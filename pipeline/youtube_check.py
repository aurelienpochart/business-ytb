"""Vérifie les secrets YouTube sans rien envoyer : jeton valide et chaîne autorisée = The Cost Curve."""

import json
import sys

from upload_youtube import access_token, request

EXPECTED = "UC9jo-GByFScs7WJmBfq8nSg"  # The Cost Curve


def main():
    token = access_token()
    with request("GET", "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", token) as resp:
        items = json.load(resp).get("items", [])
    for c in items:
        print(f"Chaîne autorisée : {c['snippet']['title']} ({c['id']})")
    if not any(c["id"] == EXPECTED for c in items):
        sys.exit(f"Le jeton ne donne pas accès à The Cost Curve ({EXPECTED}) : refaire l'étape D en choisissant cette chaîne.")
    print("OK : les secrets donnent accès à The Cost Curve.")


if __name__ == "__main__":
    main()
