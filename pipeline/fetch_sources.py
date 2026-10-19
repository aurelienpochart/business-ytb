"""Télécharge des sources (pages web, CSV, JSON) listées dans un fichier, pour la recherche.

Usage : python pipeline/fetch_sources.py research/<sujet>/sources.txt
Chaque ligne : <nom_fichier> <url>. Les pages HTML sont aussi converties en texte (.txt).
Tourne sur GitHub Actions, dont le réseau n'est pas filtré.
"""

import re
import subprocess
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

UA = "TheCostCurve research-bot 41898282+github-actions[bot]@users.noreply.github.com"


class TextExtractor(HTMLParser):
    BLOCK = {"p", "div", "br", "tr", "li", "h1", "h2", "h3", "h4", "table", "section"}

    def __init__(self):
        super().__init__()
        self.parts, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        if tag in self.BLOCK:
            self.parts.append("\n")
        if tag in ("td", "th"):
            self.parts.append(" | ")

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def text(self):
        out = re.sub(r"[ \t\xa0]+", " ", "".join(self.parts))
        return re.sub(r"\n\s*\n+", "\n", out).strip() + "\n"


def main():
    listing = Path(sys.argv[1])
    out_dir = listing.parent / "raw"
    out_dir.mkdir(exist_ok=True)
    failed = 0
    for line in listing.read_text().splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        name, url = line.split(maxsplit=1)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = resp.read()
                ctype = resp.headers.get("Content-Type", "")
        except Exception as exc:
            print(f"!! {name}: {exc}")
            failed += 1
            continue
        (out_dir / name).write_bytes(body)
        if "html" in ctype or name.endswith((".htm", ".html")):
            parser = TextExtractor()
            parser.feed(body.decode("utf-8", errors="replace"))
            (out_dir / (Path(name).stem + ".txt")).write_text(parser.text())
        if name.endswith(".pdf"):
            subprocess.run(["pdftotext", "-layout", str(out_dir / name), str(out_dir / (Path(name).stem + ".txt"))], check=False)
        print(f"OK {name} ({len(body)} octets)")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
