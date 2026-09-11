import json, re, subprocess, sys, time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_WORDS = SCRIPT_DIR / "words.json"
URL = "https://kaikki.org/dictionary/English/words/kaikki.org-dictionary-English-words.jsonl"
OUT_PATH = SCRIPT_DIR / "etymology_map.json"
LOG_PATH = SCRIPT_DIR / "add_etymology.log"

def log(msg):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")

def clean_etymology(text):
    if not text:
        return ""
    text = text.strip()
    if text.startswith("Etymology tree"):
        text = text[len("Etymology tree"):].lstrip("\n")
    text = text.split("\ncognates, etc\n")[0]
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return ""
    prose = lines[-1]
    prose = re.sub(r"\s+", " ", prose).strip()
    return prose

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
    matched_lines = 0
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

            etym_text = rec.get("etymology_text")
            if not etym_text:
                continue

            cleaned = clean_etymology(etym_text)
            if not cleaned:
                continue

            matched_lines += 1
            if key not in found:
                found[key] = cleaned
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

    log(f"DONE. total lines processed: {count}, matching-word lines with etymology: {matched_lines}, unique words with etymology: {len(found)} / {len(wanted)}")
    log(f"wrote {OUT_PATH}")
    log("Next: run `python3 merge_etymology.py` to fold this into words.json")

if __name__ == "__main__":
    main()
