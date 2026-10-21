#!/usr/bin/env bash
# Copie dans remotion/public/ les fichiers de la vidéo en cours (à lancer depuis remotion/).
# Usage : bash ../pipeline/remotion_public.sh ../videos/01-tesla
set -euo pipefail
V="$1"
cp "$V/build/timeline.json" "$V/build/narration.wav" "$V/visuals.json" "$V/thumbnail.json" "$V/metadata.json" public/
if [ -f "$V/media.json" ]; then
  cp "$V/media.json" public/
  mkdir -p public/media
  find "$V/media" -maxdepth 1 -type f -exec cp {} public/media/ \;
fi
ls public public/media 2>/dev/null | head -50
