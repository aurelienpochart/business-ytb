# Shorts originaux

Shorts écrits pour le format vertical (charte 6.3 et 6.4 : One Number, Myth vs Reality, The Map, Then vs Now),
sans extrait d'une vidéo longue. Un dossier par Short : `<n>-<sujet>/`.

Contenu d'un dossier : `short.json` (format, angle C-01, accroche, paragraphes lus), `metadata.json` (titre,
phrase, sources, `related`), `visuals.json` (plans `shot`), `media-queries.json` et `media.json` (images
Wikimedia Commons propres au Short), `recherche.md` (sources, calculs, licences).

`related` dans `metadata.json` : `{"channel": true}` (lien « More on the channel » vers
https://www.youtube.com/@thecostcurvetv et carte finale « More on the channel ») ou
`{"video": "videos/03-costco"}` (lien « Full video » vers la vidéo longue la plus proche).

Production : workflow « Produire un Short » avec `short: videos/shorts-originaux/<n>-<sujet>` ; images :
workflow « Médias » lancé à la main (`mode` search ou fetch, `video` = le dossier du Short).
