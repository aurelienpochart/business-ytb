"""Coche « contenu modifié ou synthétique » (status.containsSyntheticMedia) sur des vidéos déjà envoyées.

Usage : python3 pipeline/set_synthetic.py <id> [<id> ...]
Relit le statut actuel et le renvoie à l'identique (confidentialité, date de programmation, licence…)
en changeant seulement containsSyntheticMedia, puis relit pour vérifier (grille C-13, contrôle C-14).
"""
import json
import sys
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from upload_youtube import access_token, request  # noqa: E402

API = "https://www.googleapis.com/youtube/v3/videos"
WRITABLE = ("privacyStatus", "publishAt", "license", "embeddable", "publicStatsViewable",
            "selfDeclaredMadeForKids", "containsSyntheticMedia")


def status(token, vid):
    data = json.load(request("GET", f"{API}?part=status&id={vid}", token))
    items = data.get("items") or []
    if not items:
        sys.exit(f"{vid} : vidéo introuvable sur la chaîne")
    return items[0]["status"]


def main():
    token = access_token()
    for vid in sys.argv[1:]:
        cur = status(token, vid)
        if cur.get("containsSyntheticMedia"):
            print(f"{vid} : déjà coché")
            continue
        body = {k: cur[k] for k in WRITABLE if k in cur}
        if "selfDeclaredMadeForKids" not in body:
            body["selfDeclaredMadeForKids"] = cur.get("madeForKids", False)
        body["containsSyntheticMedia"] = True
        try:
            request("PUT", f"{API}?part=status", token, json.dumps({"id": vid, "status": body}).encode(),
                    {"Content-Type": "application/json"}).read()
        except urllib.error.HTTPError as e:
            sys.exit(f"{vid} : HTTP {e.code} {e.read().decode()[:500]}")
        after = status(token, vid)
        ok = after.get("containsSyntheticMedia") is True and after.get("privacyStatus") == cur.get("privacyStatus") \
            and after.get("publishAt") == cur.get("publishAt")
        print(f"{vid} : {'OK' if ok else 'À VÉRIFIER'} (avant {json.dumps(cur)}, après {json.dumps(after)})")
        if not ok:
            sys.exit(1)


if __name__ == "__main__":
    main()
