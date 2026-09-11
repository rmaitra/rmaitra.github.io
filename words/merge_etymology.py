import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
WORDS_PATH = SCRIPT_DIR / "words.json"
ETYMOLOGY_MAP_PATH = SCRIPT_DIR / "etymology_map.json"


def main():
    if not ETYMOLOGY_MAP_PATH.exists():
        raise SystemExit(
            f"{ETYMOLOGY_MAP_PATH.name} not found. Run `python3 add_etymology.py` first."
        )

    with open(WORDS_PATH, encoding="utf-8") as f:
        words = json.load(f)
    with open(ETYMOLOGY_MAP_PATH, encoding="utf-8") as f:
        etymology_map = json.load(f)

    matched = 0
    for entry in words:
        etym = etymology_map.get(entry["word"].lower(), "")
        if etym:
            matched += 1
        entry["etymology"] = etym

    with open(WORDS_PATH, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"Merged etymology into {matched} / {len(words)} words. Wrote {WORDS_PATH}")


if __name__ == "__main__":
    main()
