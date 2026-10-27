"""Recherche et récupération d'images libres sur Wikimedia Commons (logos, photos).

Deux modes, lancés par le workflow « Médias » (le conteneur de travail n'a pas accès à Commons) :

  python3 pipeline/media.py search <video>
      Lit <video>/media-queries.json ({"clé": "requête", ...}), garde les fichiers sous licence
      libre (domaine public, CC0, CC BY, CC BY-SA), télécharge une vignette de chacun dans
      <video>/media/candidates/<clé>/ et écrit <video>/media/candidates/catalog.json.

  python3 pipeline/media.py fetch <video>
      Lit <video>/media.json ([{"id", "title"}, ...], titres « File:... » choisis dans le catalogue),
      télécharge chaque fichier en grand (2560 px de large au plus, SVG gardé tel quel) dans
      <video>/media/<id>.<ext>, et complète media.json avec licence, auteur et lien (crédits).
      Champ facultatif "svg_drop" : couleurs de remplissage à retirer d'un logo SVG (fond, contour blanc).
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://commons.wikimedia.org/w/api.php"
UA = "TheCostCurveBot/1.0 (https://github.com/aurelienpochart/business-ytb; video research)"
FREE = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? \d|cc by(-sa)?$|attribution)", re.I)


def get(url, params=None):
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            if attempt == 3:
                raise
            print("nouvel essai :", e)
            time.sleep(2 ** attempt * 2)


def clean(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()


def info(pages):
    out = []
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata", {})
        lic = clean(meta.get("LicenseShortName", {}).get("value", ""))
        out.append({
            "title": p["title"],
            "license": lic,
            "free": bool(FREE.match(lic)),
            "artist": clean(meta.get("Artist", {}).get("value", ""))[:200],
            "restrictions": clean(meta.get("Restrictions", {}).get("value", "")),
            "width": ii.get("width"),
            "height": ii.get("height"),
            "mime": ii.get("mime"),
            "url": ii.get("url"),
            "thumb": ii.get("thumburl"),
            "page": ii.get("descriptionurl"),
        })
    return out


def search(video):
    queries = json.loads((video / "media-queries.json").read_text())
    out_dir = video / "media" / "candidates"
    out_dir.mkdir(parents=True, exist_ok=True)
    catalog = {}
    for key, q in queries.items():
        data = json.loads(get(API, {
            "action": "query", "format": "json", "generator": "search", "gsrsearch": q, "gsrnamespace": 6,
            "gsrlimit": 16, "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 480,
        }))
        pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
        items = [i for i in info(pages) if i["free"] and i["thumb"]]
        (out_dir / key).mkdir(exist_ok=True)
        for n, item in enumerate(items[:12]):
            ext = ".png" if item["mime"] in ("image/svg+xml", "image/png") else ".jpg"
            item["file"] = f"{key}/{n:02d}{ext}"
            (out_dir / item["file"]).write_bytes(get(item["thumb"]))
            time.sleep(0.3)
        catalog[key] = items[:12]
        print(f"{key}: {len(items[:12])} images libres sur {len(pages)} résultats")
    (out_dir / "catalog.json").write_text(json.dumps(catalog, indent=1, ensure_ascii=False) + "\n")


def add_viewbox(data):
    """Ajoute un viewBox aux SVG qui n'ont que width/height : sans lui, le logo ne se met pas à l'échelle."""
    text = data.decode("utf-8", "replace")
    m = re.search(r"<svg\b[^>]*>", text)
    if not m or "viewBox" in m.group(0):
        return data
    w = re.search(r'\swidth="([\d.]+)(?:px)?"', m.group(0))
    h = re.search(r'\sheight="([\d.]+)(?:px)?"', m.group(0))
    if not (w and h):
        return data
    tag = m.group(0)[:-1].rstrip("/") + f' viewBox="0 0 {w.group(1)} {h.group(1)}"' + ("/>" if m.group(0).endswith("/>") else ">")
    return (text[:m.start()] + tag + text[m.end():]).encode("utf-8")


def drop_fills(data, fills):
    """Retire d'un SVG les formes remplies d'une des couleurs données (champ "svg_drop" de media.json) : fond
    d'un logo ou contour blanc, pour que le logo affiché en blanc uni garde le dessin de ses lettres."""
    text = data.decode("utf-8", "replace")
    for color in fills:
        if color.startswith("d:"):  # forme désignée par le début de son tracé (ex. « d:m0 0c135.84 »)
            text = re.sub(rf'<path\b[^>]*?\sd="{re.escape(color[2:])}[^"]*"[^>]*?/>', "", text)
            continue
        c = re.escape(color)
        attr = rf'(?:fill="{c}"|style="[^"]*fill:\s*{c}\b[^"]*")'
        text = re.sub(rf"<(path|rect|ellipse|circle|polygon)\b[^>]*?{attr}[^>]*?/>", "", text, flags=re.I)
        text = re.sub(rf"<(path|rect|ellipse|circle|polygon)\b[^>]*?{attr}[^>]*?>.*?</\1>", "", text, flags=re.I | re.S)
    return text.encode("utf-8")


def fetch(video):
    path = video / "media.json"
    items = json.loads(path.read_text())
    (video / "media").mkdir(exist_ok=True)
    for item in items:
        data = json.loads(get(API, {
            "action": "query", "format": "json", "titles": item["title"], "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 2560,
        }))
        meta = info(list(data["query"]["pages"].values()))[0]
        if not meta["free"]:
            print(f"REFUSÉ (licence non libre : {meta['license']}) : {item['title']}")
            continue
        svg = meta["mime"] == "image/svg+xml"
        big = svg or (meta["width"] or 0) <= 2560
        url = meta["url"] if big else meta["thumb"]
        ext = ".svg" if svg else (".png" if meta["mime"] == "image/png" else ".jpg")
        target = video / "media" / f"{item['id']}{ext}"
        data = get(url)
        if svg:
            data = add_viewbox(data)
            if item.get("svg_drop"):
                data = drop_fills(data, item["svg_drop"])
        target.write_bytes(data)
        item.update({"file": f"media/{target.name}", "license": meta["license"], "artist": meta["artist"],
                     "restrictions": meta["restrictions"], "page": meta["page"]})
        print(f"{item['id']}: {meta['license']} — {meta['artist'][:60]}")
        time.sleep(0.3)
    path.write_text(json.dumps(items, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    mode, video = sys.argv[1], Path(sys.argv[2])
    {"search": search, "fetch": fetch}[mode](video)
