import json, re, subprocess, sys, time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_WORDS = SCRIPT_DIR / "words.json"
URL = "https://kaikki.org/dictionary/English/words/kaikki.org-dictionary-English-words.jsonl"
OUT_PATH = SCRIPT_DIR / "definitions_map.json"
LOG_PATH = SCRIPT_DIR / "add_definitions.log"

MAX_DEFINITIONS = 4
MAX_EXAMPLES = 4
MAX_EXAMPLE_LEN = 220
MIN_EXAMPLE_LEN = 15

SKIP_GLOSS_PATTERNS = [
    r"^alternative (spelling|form|case|capitalization) of\b",
    r"^obsolete (spelling|form) of\b",
    r"^archaic (spelling|form) of\b",
    r"^dialectal (spelling|form) of\b",
    r"^misspelling of\b",
    r"^rare (spelling|form) of\b",
    r"^\(.*\) alternative form of\b",
    r"^plural of\b",
    r"^present participle of\b",
    r"^past participle of\b",
    r"^past tense of\b",
    r"^third-person singular",
    r"^gerund or present participle of\b",
    r"^superlative of\b",
    r"^comparative of\b",
]
SKIP_GLOSS_RE = re.compile("|".join(SKIP_GLOSS_PATTERNS), re.IGNORECASE)

SKIP_TAGS = {"obsolete", "archaic", "dated", "misspelling", "rare"}


def log(msg):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")


def clean_text(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def usable_gloss(sense):
    tags = set(sense.get("tags", []))
    if tags & SKIP_TAGS:
        return None
    glosses = sense.get("glosses") or sense.get("raw_glosses")
    if not glosses:
        return None
    gloss = clean_text(glosses[-1])
    if not gloss or SKIP_GLOSS_RE.match(gloss):
        return None
    return gloss


ARCHAIC_CHARS = "ſ"

MAX_RELATIONS = 6
PREFERRED_IPA_TAG = "General-American"


def extract_ipa(rec):
    best = None
    for sound in rec.get("sounds", []):
        ipa = sound.get("ipa")
        if not ipa:
            continue
        if best is None:
            best = ipa
        if PREFERRED_IPA_TAG in sound.get("tags", []):
            return ipa
    return best or ""


def extract_syllables(rec):
    hyph = rec.get("hyphenation")
    if not hyph:
        return ""
    first = hyph[0]
    if isinstance(first, dict):
        parts = first.get("parts", [])
        return "-".join(parts)
    return str(first).replace("·", "-").replace("‧", "-")


def extract_relations(rec, field):
    out = []
    word_lower = rec.get("word", "").lower()
    for sense in rec.get("senses", []):
        for rel in sense.get(field, []):
            tags = set(rel.get("tags", []))
            if tags & SKIP_TAGS:
                continue
            text = clean_text(rel.get("word", ""))
            if not text or " " in text or "-" in text:
                continue
            if text.lower() == word_lower:
                continue
            out.append(text)
    # dedupe, preserve order
    seen = set()
    deduped = []
    for text in out:
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(text)
        if len(deduped) >= MAX_RELATIONS:
            break
    return deduped


def usable_examples(sense):
    out = []
    for ex in sense.get("examples", []):
        text = clean_text(ex.get("text", ""))
        if not text:
            continue
        if not (MIN_EXAMPLE_LEN <= len(text) <= MAX_EXAMPLE_LEN):
            continue
        if any(c in text for c in ARCHAIC_CHARS):
            continue
        out.append((ex.get("type", ""), text))
    # prefer plain "example" type entries over historical "quote" entries
    out.sort(key=lambda t: 0 if t[0] == "example" else 1)
    return [text for _, text in out]


def main():
    with open(REPO_WORDS, encoding="utf-8") as f:
        words = json.load(f)

    wanted = {w["word"].lower() for w in words}
    found = {}

    log(f"Loaded {len(words)} target words ({len(wanted)} unique lowercase). Starting stream from {URL}")

    proc = subprocess.Popen(
        ["curl", "-sS", "-f", "--retry", "3", URL],
        stdout=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="ignore",
        bufsize=1,
    )

    count = 0
    try:
        for line in proc.stdout:
            count += 1
            if count % 500000 == 0:
                log(f"processed {count} lines, matched words so far: {len(found)}")
                with open(OUT_PATH, "w", encoding="utf-8") as f:
                    json.dump(found, f, ensure_ascii=False, indent=2)

            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue

            if rec.get("lang") != "English":
                continue
            w = rec.get("word", "")
            key = w.lower()
            if key not in wanted:
                continue

            pos = rec.get("pos", "")
            entry = found.setdefault(key, {
                "definitions": [], "examples": [],
                "ipa": "", "syllables": "", "synonyms": [], "antonyms": [],
            })
            seen_glosses = {d["gloss"] for d in entry["definitions"]}
            seen_examples = set(entry["examples"])

            for sense in rec.get("senses", []):
                gloss = usable_gloss(sense)
                if gloss and gloss not in seen_glosses and len(entry["definitions"]) < MAX_DEFINITIONS:
                    entry["definitions"].append({"pos": pos, "gloss": gloss})
                    seen_glosses.add(gloss)

                for ex_text in usable_examples(sense):
                    if len(entry["examples"]) >= MAX_EXAMPLES:
                        break
                    if ex_text in seen_examples:
                        continue
                    entry["examples"].append(ex_text)
                    seen_examples.add(ex_text)

            if not entry["ipa"]:
                entry["ipa"] = extract_ipa(rec)
            if not entry["syllables"]:
                entry["syllables"] = extract_syllables(rec)

            seen_syn = {s.lower() for s in entry["synonyms"]}
            for s in extract_relations(rec, "synonyms"):
                if s.lower() in seen_syn or len(entry["synonyms"]) >= MAX_RELATIONS:
                    continue
                entry["synonyms"].append(s)
                seen_syn.add(s.lower())

            seen_ant = {s.lower() for s in entry["antonyms"]}
            for s in extract_relations(rec, "antonyms"):
                if s.lower() in seen_ant or len(entry["antonyms"]) >= MAX_RELATIONS:
                    continue
                entry["antonyms"].append(s)
                seen_ant.add(s.lower())
    finally:
        proc.stdout.close()
        proc.wait()

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(found, f, ensure_ascii=False, indent=2)

    if proc.returncode != 0:
        log(f"WARNING: curl exited with code {proc.returncode} (interrupted or network error) after only "
            f"{count} lines — the download did NOT finish. {OUT_PATH.name} only reflects a partial, "
            f"non-representative slice of the file. Re-run this script uninterrupted, with a stable "
            f"connection, to get real results.")
        sys.exit(1)

    with_defs = sum(1 for v in found.values() if v["definitions"])
    with_examples = sum(1 for v in found.values() if v["examples"])
    with_ipa = sum(1 for v in found.values() if v["ipa"])
    with_syllables = sum(1 for v in found.values() if v["syllables"])
    with_synonyms = sum(1 for v in found.values() if v["synonyms"])
    with_antonyms = sum(1 for v in found.values() if v["antonyms"])
    log(f"DONE. total lines processed: {count}, words matched: {len(found)} / {len(wanted)}, "
        f"words with definitions: {with_defs}, words with examples: {with_examples}, "
        f"words with ipa: {with_ipa}, words with syllables: {with_syllables}, "
        f"words with synonyms: {with_synonyms}, words with antonyms: {with_antonyms}")
    log(f"wrote {OUT_PATH}")
    log("Next: run `python3 merge_definitions.py` to fold this into words.json")


if __name__ == "__main__":
    main()
