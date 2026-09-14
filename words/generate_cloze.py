import json, re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
WORDS_PATH = SCRIPT_DIR / "words.json"


def inflections(word):
    w = word.lower()
    forms = {w}
    if w.endswith("e") and len(w) > 2:
        stem = w[:-1]
        forms.update({stem + "ed", stem + "ing"})
        forms.add(w + "s")
    elif len(w) > 1 and w.endswith("y") and w[-2] not in "aeiou":
        stem = w[:-1]
        forms.add(stem + "ies")
        forms.update({w + "ing", w + "ed"})
    elif w.endswith(("s", "x", "z", "ch", "sh")):
        forms.add(w + "es")
        forms.update({w + "ed", w + "ing"})
    else:
        forms.update({w + "s", w + "ed", w + "ing"})
    return forms


def build_pattern(word):
    forms = sorted(inflections(word), key=len, reverse=True)
    alt = "|".join(re.escape(f) for f in forms)
    return re.compile(rf"\b({alt})\b", re.IGNORECASE)


def make_cloze(word, examples):
    pattern = build_pattern(word)
    best = None
    for ex in examples:
        m = pattern.search(ex)
        if not m:
            continue
        if best is None or len(ex) < len(best[0]):
            best = (ex, m)
    if not best:
        return ""
    ex, m = best
    return ex[:m.start()] + "___" + ex[m.end():]


def main():
    with open(WORDS_PATH, encoding="utf-8") as f:
        words = json.load(f)

    made = 0
    for entry in words:
        examples = entry.get("examples") or []
        cloze = make_cloze(entry["word"], examples) if examples else ""
        entry["cloze"] = cloze
        if cloze:
            made += 1

    with open(WORDS_PATH, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"Generated cloze sentences for {made} / {len(words)} words. Wrote {WORDS_PATH}")


if __name__ == "__main__":
    main()
