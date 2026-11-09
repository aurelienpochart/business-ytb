# Short original 07 : A Big Mac Now Costs Less Work Than in 1990 (Then vs Now)

Suite du Short 02 (« The Big Mac Beat Inflation by $1.37 », https://youtu.be/77hbDSs27bk), en réponse au
commentaire « 30yrs ago paycheck was like 400 now its 2000+ so? ». Lien : la chaîne.

## Angle (C-01)

Le commentaire a raison sur un point : les salaires ont monté aussi. On mesure donc le Big Mac en minutes de
travail au salaire horaire moyen américain. Résultat : 13 minutes en 1990, 11,5 minutes en 2026. Le salaire a
été multiplié par 3,2, le Big Mac par 2,8. Nuance montrée : le point le plus bas est 2001 (9,3 minutes) et le
Big Mac a regagné 2,2 minutes depuis.

## Sources (C-03)

1. The Economist, indice Big Mac (dépôt GitHub officiel, consulté le 9/11/2026) :
   https://github.com/TheEconomist/big-mac-data — États-Unis : 2,20 $ (1990-04-01, fichier historique),
   2,24 $ (2001-04-01), 6,22 $ (2026-07-01, `big-mac-source-data-v2.csv`).
2. BLS, Current Employment Statistics, salaire horaire moyen des « production and nonsupervisory employees »,
   secteur privé, CVS (CES0500000008 = FRED AHETPI). Copies dans `research/big-mac-minutes/raw/`
   (`ahetpi-fred.csv`, `bls-ahe-prod-*.json`, téléchargés le 9/11/2026) : avril 1990 = 10,12 $ ;
   avril 2001 = 14,44 $ ; juillet 2026 = 32,42 $ (définitif ; sept. et oct. 2026 encore provisoires).
   Ces salariés représentent environ 80 % de l'emploi privé ; c'est la seule série BLS de salaire horaire
   moyen qui remonte avant 2006 (la série « tous salariés » CES0500000003 commence en 2006).
   Le Short dit « the average American worker » pour cette série ; la précision est à l'écran.

## Calculs (fichier `minutes.csv` : chaque relevé US de l'indice / salaire horaire du même mois × 60)

- 1990 : 2,20 / 10,12 × 60 = 13,04 min → « thirteen minutes ».
- 2026 : 6,22 / 32,42 × 60 = 11,51 min → « eleven and a half minutes ».
- Écart : 13,04 − 11,51 = 1,53 min → « a minute and a half less work ».
- Salaire : 32,42 / 10,12 = 3,20 → « three point two times » ; Big Mac : 6,22 / 2,20 = 2,83 → « two point
  eight ».
- Minimum de la série : avril 2001, 2,24 / 14,44 × 60 = 9,31 min → « about nine minutes » ; depuis :
  11,51 − 9,31 = 2,20 → « +2.2 min ».
- Vérification du commentaire (« 30 ans », avril 1996) : 2,36 / 11,96 × 60 = 11,84 min, à peine plus
  qu'aujourd'hui. Non utilisé dans le Short.
- Écarté volontairement (pas de politique) : au salaire minimum fédéral (FRED FEDMINNFRWG,
  `fedmin-fred.csv`), 2,20 / 3,80 × 60 = 34,7 min en 1990 contre 6,22 / 7,25 × 60 = 51,5 min en 2026.

## Anti-répétition (C-04)

Deuxième Short Big Mac, mais angle différent (pouvoir d'achat en temps de travail, pas inflation des prix),
et il répond à une question du public. Format Then vs Now comme le 02 ; prochains originaux à varier.

## Images (C-17)

Wikimedia Commons, voir `media.json` (8 reprises du Short 02, plus horloge, chronomètre, chantiers, billets).
Crédits CC BY / CC BY-SA ajoutés à la description par `pipeline/short.py`.

## Divulgation (C-13)

Voix de synthèse ; musique générée par IA → `contains_synthetic_media: true`.
