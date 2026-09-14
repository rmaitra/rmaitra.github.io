import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
WORDS_PATH = SCRIPT_DIR / "words.json"
DEFINITIONS_MAP_PATH = SCRIPT_DIR / "definitions_map.json"


def main():
    if not DEFINITIONS_MAP_PATH.exists():
        raise SystemExit(
            f"{DEFINITIONS_MAP_PATH.name} not found. Run `python3 add_definitions.py` first."
        )

    with open(WORDS_PATH, encoding="utf-8") as f:
        words = json.load(f)
    with open(DEFINITIONS_MAP_PATH, encoding="utf-8") as f:
        definitions_map = json.load(f)

    matched_defs = 0
    matched_examples = 0
    missing = []
    for entry in words:
        data = definitions_map.get(entry["word"].lower(), {})
        # only overwrite a field when kaikki actually found something for it;
        # otherwise keep whatever was already there (e.g. Wiktionary-sourced
        # definitions for words kaikki doesn't match under this exact spelling)
        if data.get("definitions"):
            entry["definitions"] = data["definitions"]
        if data.get("examples"):
            entry["examples"] = data["examples"]
        if data.get("ipa"):
            entry["ipa"] = data["ipa"]
        if data.get("syllables"):
            entry["syllables"] = data["syllables"]
        if data.get("synonyms"):
            entry["synonyms"] = data["synonyms"]
        if data.get("antonyms"):
            entry["antonyms"] = data["antonyms"]

        if entry.get("definitions"):
            matched_defs += 1
        if entry.get("examples"):
            matched_examples += 1
        if not entry.get("definitions") or not entry.get("examples"):
            missing.append(entry["word"])

    with open(WORDS_PATH, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    matched_ipa = sum(1 for e in words if e.get("ipa"))
    matched_syn = sum(1 for e in words if e.get("synonyms"))
    matched_ant = sum(1 for e in words if e.get("antonyms"))

    print(f"Merged definitions into {matched_defs} / {len(words)} words.")
    print(f"Merged examples into {matched_examples} / {len(words)} words.")
    print(f"Merged ipa into {matched_ipa} / {len(words)} words.")
    print(f"Merged synonyms into {matched_syn} / {len(words)} words, antonyms into {matched_ant} / {len(words)} words.")
    print(f"Wrote {WORDS_PATH}")

    gaps_path = SCRIPT_DIR / "definitions_gaps.json"
    with open(gaps_path, "w", encoding="utf-8") as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)
    print(f"{len(missing)} words still missing a definition and/or example -> wrote {gaps_path}")


if __name__ == "__main__":
    main()
