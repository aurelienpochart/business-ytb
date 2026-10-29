# Short original 02 : The Big Mac Beat Inflation by $1.37 (Then vs Now)

Sortie prévue : samedi 7 novembre 2026, 17 h UTC. Lien : la chaîne (aucune vidéo longue proche).

## Angle (C-01)

Tout le monde sait que le burger a augmenté ; la question est de savoir si le Big Mac a seulement suivi
l'inflation. Avec l'indice Big Mac de The Economist et l'indice des prix à la consommation américain, on montre
que non : les prix ont à peu près triplé depuis 1986, le Big Mac a presque quadruplé, et il a même dépassé la
hausse des prix des restaurants.

## Sources (C-03)

1. The Economist, données de l'indice Big Mac (dépôt GitHub officiel, consulté le 29/10/2026) :
   https://github.com/TheEconomist/big-mac-data
   - `source-data/big-mac-historical-source-data.csv` : États-Unis, 1986-09-01, 1,60 $.
   - `source-data/big-mac-source-data-v2.csv` : États-Unis, 2026-07-01, 6,22 $ (dernier relevé).
   - Courbe : prix américain à chaque relevé de 1986 à 2026 (59 relevés, deux fichiers ci-dessus).
2. US Bureau of Labor Statistics, CPI-U, tous postes, non désaisonnalisé (CUUR0000SA0) : sept. 1986 = 110,2 ;
   juillet 2026 = 333,918. API BLS et FRED (CPIAUCNS), copies dans `research/shorts-originaux/raw/`
   (`cpi-u-bls-1986.json`, `cpi-u-bls-2026.json`, `cpi-u-fred.csv`), téléchargées le 29/10/2026.
3. BLS, CPI-U, restauration hors domicile (« food away from home », CUUR0000SEFV) : sept. 1986 = 113,5 ;
   juillet 2026 = 396,859. Copie : `research/shorts-originaux/raw/cpi-fafh-fred.csv`.

## Calculs

- Big Mac : 6,22 / 1,60 = 3,89 → « almost four times », « nearly quadrupled », « ×3.9 ».
- Prix en général : 333,918 / 110,2 = 3,030 → « roughly tripled », « ×3 ».
- 1,60 $ indexé sur l'inflation : 1,60 × 3,030 = 4,848 → « about $4.85 ».
- 1,60 $ indexé sur les prix des restaurants : 1,60 × 396,859 / 113,5 = 5,594 → « $5.59 ». La restauration
  (×3,50) a bien augmenté plus vite que la moyenne (×3,03).
- Écart : 6,22 − 4,848 = 1,372 → « $1.37 a burger ».
- Courbe indexée : 1,60 × CPI(mois du relevé) / 110,2. Les deux courbes se croisent plusieurs fois avant
  2008 (Big Mac au-dessus de 1988 à 1999, en dessous de 2000 à 2007) ; à partir du relevé d'avril-juin 2008
  (3,21 $ contre 3,18 $), le Big Mac reste au-dessus à chaque relevé → « Until around 2008, the two lines
  crossed back and forth. Since then, the Big Mac has stayed ahead. »
- « Today » = dernier relevé disponible (juillet 2026), comparé à l'inflation du même mois.

## Anti-répétition (C-04)

Premier Short sur McDonald's et sur l'inflation. Aucun chiffre repris d'une vidéo existante. Format Then vs Now,
différent du Short du mercredi (Myth vs Reality). Pas de politique partisane : aucun commentaire sur les causes
de l'inflation ni sur des responsables ; pas de conseil d'investissement.

## Images (C-17)

Wikimedia Commons, voir `media.json`. Crédits CC BY et CC BY-SA ajoutés à la description par
`pipeline/short.py`. Logo McDonald's : domaine public (marque déposée), affiché en blanc à titre
d'identification.

## Divulgation (C-13)

Voix de synthèse ; musique générée par IA ajoutée ensuite → `contains_synthetic_media: true`.
