"""Remove references to the headword (or a word sharing its root) from each
entry's `meaning` and `definitions[].gloss`, so a definition never gives away
the word it defines.

Run after merge_definitions.py (which overwrites `definitions` from kaikki):

    python3 fix_definition_leaks.py            # rewrite words.json
    python3 fix_definition_leaks.py --dry-run  # only write the report

Strategy, from least to most lossy:
  - "Ex." usage examples: blank the word out ("Ex. run ___").
  - Derived-form notes ("N. inference", "ADJ. senile: ...; Ex. ...",
    "CF. abate"): drop the note and the clauses that belong to it.
  - Plain clauses ("strangle; regulate the speed of with a throttle"): drop the
    leaking clause when another clean clause is left.
  - Glosses where every clause leaks: drop the whole gloss when another clean
    gloss is left.
  - Nothing clean left: blank the word out and list it as unresolved, so it
    can be given a hand-written replacement in definition_overrides.json.

definition_overrides.json (optional) maps a word to replacement text:
    {"abase": {"meaning": "...", "glosses": {"<original gloss>": "<new gloss>"}}}
Overrides are applied first and are still checked for leaks.
"""
import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
WORDS_PATH = SCRIPT_DIR / "words.json"
OVERRIDES_PATH = SCRIPT_DIR / "definition_overrides.json"
REPORT_PATH = SCRIPT_DIR / "definition_leaks_report.json"

# Endings that can be stacked onto a shared stem ("lethargic" / "lethargy",
# "inference" / "infer", "abasing" / "abase"). A token only counts as related
# when what's left after the shared stem is built entirely from these, which
# keeps "part" from matching "particularly".
SUFFIXES = sorted(set("""
    s es ed d ing er ers est ly y ily ies ied e
    ness ity ty ment ments ful less ous ious eous ive ative ion ions ation ition
    tion sion able ible ably ibly ance ence ancy ency ant ent ism ist ists ize ise
    ized ised izing ising ate ated ating ator al ally ial ic ics ical ically tic
    atic ure ery ary ory or ors ee an ian ist ship hood dom ward wards like
    a um us i ae ia
""".split()), key=len, reverse=True)
MIN_STEM = 4

POS_LABEL = re.compile(r"^(N|V|ADJ|ADV|CF|OP|PREP|CONJ|INTERJ)\s*[.:]\s*", re.IGNORECASE)
# the same labels mid-clause, with no '; ' before them: "end V. terminate"
INLINE_LABEL = re.compile(r"\s+(?=(?:N|V|ADJ|ADV|CF|OP)\.\s)")
TOKEN = re.compile(r"[A-Za-z]+")
NUMBERED = re.compile(r"^(\d+)\.\s+")


def is_suffix_chain(rest, depth=0, single_letters=0):
    # at most one one-letter piece, so "see" doesn't pass as s+e+e
    if not rest:
        return True
    if depth >= 3:
        return False
    return any(rest.startswith(s) and (len(s) > 1 or single_letters == 0)
               and is_suffix_chain(rest[len(s):], depth + 1, single_letters + (len(s) == 1))
               for s in SUFFIXES)


def related(token, word):
    """True when `token` is `word` or shares its root."""
    t, w = token.lower(), word.lower()
    if t == w:
        return True
    n = 0
    while n < min(len(t), len(w)) and t[n] == w[n]:
        n += 1
    if n < MIN_STEM:
        return False
    stem = t[:n]

    def rest_ok(rest):
        # allow a doubled final consonant: "stop" + "ped"
        return is_suffix_chain(rest) or (rest[:1] == stem[-1] and is_suffix_chain(rest[1:]))

    return rest_ok(t[n:]) and rest_ok(w[n:])


# filler words in phrase headwords ("stem from", "blatant versus flagrant")
# that shouldn't count as a reference on their own
PHRASE_FILLER = {"from", "with", "into", "onto", "upon", "over", "versus", "self", "word"}


def headword_parts(word):
    parts = [p for p in re.split(r"[\s-]+", word)
             if len(p) >= MIN_STEM and p.lower() not in PHRASE_FILLER]
    return parts or [word]


def leaks(text, word):
    return [t for t in TOKEN.findall(text) if any(related(t, p) for p in headword_parts(word))]


def blank(text, word):
    parts = headword_parts(word)
    return TOKEN.sub(lambda m: "___" if any(related(m.group(0), p) for p in parts) else m.group(0), text)


def split_clauses(text):
    """Split on '; ' and on numbered items ('1. ... 2. ...'), but not inside
    brackets or quotes."""
    clauses, depth, start = [], 0, 0
    text = text.strip()
    for i, ch in enumerate(text):
        if ch in "([“":
            depth += 1
        elif ch in ")]”":
            depth = max(0, depth - 1)
        elif depth == 0 and i > start:
            if ch == ";" and text[i + 1:i + 2].isspace():
                clauses.append(text[start:i])
                start = i + 1
            elif ch.isspace() and NUMBERED.match(text[i + 1:]):
                clauses.append(text[start:i])
                start = i + 1
    clauses.append(text[start:])
    clauses = [part for c in clauses for part in INLINE_LABEL.split(c)]
    return [c.strip() for c in clauses if c.strip()]


def join_clauses(clauses, original):
    numbered = [c for c in clauses if NUMBERED.match(c)]
    if numbered and len(numbered) == len(clauses):
        if len(clauses) == 1:
            return NUMBERED.sub("", clauses[0])
        return " ".join(NUMBERED.sub(f"{i}. ", c) for i, c in enumerate(clauses, 1))
    out = "; ".join(clauses)
    if not out:
        return out
    # a clause promoted to the front takes the original's capitalization
    if original[:1].isupper() and out[:1].islower():
        out = out[0].upper() + out[1:]
    if original.rstrip().endswith(".") and not out.endswith((".", "!", "?")):
        out += "."
    return out


# sentence break: ". " + capital/quote, but not after "Ex.", "Mrs.", "n." etc.
SENTENCE_BREAK = re.compile(r"(?<!\b[A-Za-z]{2}\.)(?<!\bMrs\.)(?<=[.!?])\s+(?=[A-Z\"“(])")


# leftovers that don't define anything on their own
NON_DEFINING = re.compile(r"^\s*((adj|adjective|n|noun|v|verb|adv|adverb)\b\.?:?|Earliest documented use\b.*)\s*$", re.IGNORECASE)


def drop_leaking_sentences(clause, word):
    """In a multi-sentence clause, keep only the sentences that don't leak
    ("Criminal intent. From Latin mens rea (guilty mind)." -> "Criminal intent.")."""
    sentences = [s for s in SENTENCE_BREAK.split(clause) if s.strip()]
    clean = [s for s in sentences if not leaks(s, word)]
    if len(sentences) > 1 and any(not NON_DEFINING.match(s) for s in clean):
        return " ".join(clean)
    return clause


def is_example(clause):
    return clause.startswith("Ex.") or clause.startswith("Ex:")


def is_note(clause):
    """A cross-reference ("CF. defeatism") or a label left with nothing after
    it ("V.") - kept alongside a definition, but not a definition itself."""
    label = POS_LABEL.match(clause)
    return bool(label) and (label.group(1).upper() in ("CF", "OP") or not clause[label.end():].strip())


def clean_text(text, word):
    """Return (new_text, resolved). resolved is False when the only way to
    remove the reference was to blank it out of a defining clause."""
    if not text or not leaks(text, word):
        return text, True

    clauses = split_clauses(text)
    kept = []
    in_derived_block = False
    for c in clauses:
        label = POS_LABEL.match(c)
        if label:
            # "N. inference", "ADJ. senile: old; ...", "CF. abate" - a note about
            # a related word; its following clauses belong to it too.
            # the note's subject: "inference" in "N. inference", "senile" in
            # "ADJ. senile: ...". A label followed by a whole sentence ("adj. Of
            # or belonging to the dawn...") is just a part of speech, not a note.
            rest = c[label.end():]
            subject = rest.split(":", 1)[0] if ":" in rest else rest
            if len(subject.split()) > 3:
                subject = ""
            in_derived_block = bool(leaks(subject, word)) or (
                label.group(1).upper() in ("CF", "OP") and bool(leaks(c, word)))
            if in_derived_block:
                continue
        elif in_derived_block:
            continue
        if label and not c[label.end():].strip():
            continue  # bare "N." / "V." with nothing after it
        kept.append(c)

    kept = [c if is_example(c) or not leaks(c, word) else drop_leaking_sentences(c, word)
            for c in kept]
    defining = [c for c in kept if not is_example(c) and not is_note(c)]
    clean_defining = [c for c in defining if not leaks(c, word)]
    resolved = True
    out = []
    for c in kept:
        if is_example(c):
            out.append(blank(c, word))
        elif not leaks(c, word):
            out.append(c)
        elif not clean_defining:
            # nothing else defines the word - keep the clause, minus the word
            out.append(blank(c, word))
            resolved = False
    if not [c for c in out if not is_example(c) and not is_note(c)]:
        resolved = False
    return join_clauses(out, text), resolved


def clean_entry(entry, overrides):
    word = entry["word"]
    changes = []
    ov = overrides.get(word, {})

    meaning = entry.get("meaning") or ""
    if "meaning" in ov:
        meaning = ov["meaning"]
    new_meaning, ok = clean_text(meaning, word)
    if new_meaning != entry.get("meaning", ""):
        changes.append({"field": "meaning", "before": entry.get("meaning", ""),
                        "after": new_meaning, "resolved": ok})
        entry["meaning"] = new_meaning

    defs = entry.get("definitions") or []
    gloss_ov = ov.get("glosses", {})
    cleaned = []
    for d in defs:
        gloss = gloss_ov.get(d.get("gloss", ""), d.get("gloss", ""))
        new_gloss, ok = clean_text(gloss, word)
        cleaned.append((d, new_gloss, ok))
    any_clean = any(ok and g for _, g, ok in cleaned)
    new_defs = []
    for d, new_gloss, ok in cleaned:
        if not ok and any_clean:
            changes.append({"field": "gloss", "before": d["gloss"], "after": None, "resolved": True})
            continue
        if new_gloss != d.get("gloss"):
            changes.append({"field": "gloss", "before": d["gloss"], "after": new_gloss, "resolved": ok})
        new_defs.append({**d, "gloss": new_gloss})
    if defs:
        entry["definitions"] = new_defs
    return changes


def main():
    dry_run = "--dry-run" in sys.argv
    with open(WORDS_PATH, encoding="utf-8") as f:
        words = json.load(f)
    overrides = {}
    if OVERRIDES_PATH.exists():
        with open(OVERRIDES_PATH, encoding="utf-8") as f:
            overrides = json.load(f)

    report = {}
    for entry in words:
        changes = clean_entry(entry, overrides)
        if changes:
            report[entry["word"]] = changes

    all_changes = [c for cs in report.values() for c in cs]
    unresolved = {w: [c for c in cs if not c["resolved"]] for w, cs in report.items()}
    unresolved = {w: cs for w, cs in unresolved.items() if cs}

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump({"unresolved": unresolved, "changes": report}, f, ensure_ascii=False, indent=2)
    if not dry_run:
        with open(WORDS_PATH, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"{len(report)} / {len(words)} words had a definition referencing the word or its root.")
    print(f"  meanings changed: {sum(c['field'] == 'meaning' for c in all_changes)}")
    print(f"  glosses changed:  {sum(c['field'] == 'gloss' and c['after'] is not None for c in all_changes)}")
    print(f"  glosses dropped:  {sum(c['field'] == 'gloss' and c['after'] is None for c in all_changes)}")
    print(f"  unresolved (blanked with ___, need an override): {len(unresolved)} words")
    print(f"Wrote {REPORT_PATH}" + ("" if dry_run else f" and {WORDS_PATH}"))


if __name__ == "__main__":
    main()
