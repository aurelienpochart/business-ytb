# Short original 04 : Half the World's Coffee Comes From Two Countries (The Map)

Sortie prévue : mercredi 11 novembre 2026, 17 h UTC (publish_at 2026-11-11T17:00:00Z). Lien : la chaîne.

## Angle (C-01)

Le café paraît venir de partout ; la carte de sa production est en fait très concentrée. Selon les prévisions
2026/27 du ministère américain de l'Agriculture, le Brésil et le Viêt Nam font à eux seuls 55 % du café
mondial, et cinq pays les trois quarts, tandis que les grands buveurs (Union européenne, États-Unis)
importent presque tout ce qu'ils consomment.

## Source (C-03)

USDA Foreign Agricultural Service, « Coffee: World Markets and Trade », juillet 2026 (page datée du
2 juillet 2026), tableaux « Coffee Summary » (milliers de sacs de 60 kg), colonne 2026/27 (prévision) :
https://apps.fas.usda.gov/psdonline/circulars/2026/07/coffee.pdf
Copie texte : `research/shorts-originaux/raw/usda-coffee-2026-07.txt` (workflow « Récupérer des sources »,
4/11/2026). Le rapport suivant de l'USDA sort en décembre 2026.

| 2026/27 (prévision, milliers de sacs) | Production |
|---|---|
| Monde | 189 667 |
| Brésil (record, « a record 71.9 million ») | 71 900 |
| Viêt Nam (dont robusta 31 400) | 32 500 |
| Colombie | 13 400 |
| Éthiopie | 12 100 |
| Indonésie | 11 380 |

Importations 2026/27 : Union européenne 50 000 (café vert) ; États-Unis 26 900 au total (vert 24 500,
torréfié 900, soluble 1 500). Consommation des États-Unis : 26 950.

## Calculs (chiffres dits ou affichés)

- Brésil : 71 900 / 189 667 = 37,9 % → « almost two bags in every five », « 38% ».
- Viêt Nam : 32 500 / 189 667 = 17,1 % → « 17% » ; robusta 31 400 / 32 500 = 96,6 % → « almost all of it
  robusta », « 97% ».
- Brésil + Viêt Nam : 104 400 / 189 667 = 55,0 % → « 55% », « more than half ».
- Colombie + Éthiopie + Indonésie : 36 880 / 189 667 = 19,4 % → « about one bag in five ». Ordre 3e, 4e, 5e
  confirmé par le tableau ; « Number two isn't Colombia » : la Colombie est 3e.
- UE : 50 millions de sacs importés ; États-Unis : 26,9 millions importés pour 26,95 millions consommés
  (≈ 27,0) → « almost 27 million: nearly everything it drinks ».
- « This season » : campagne 2026/27 (juillet 2026-juin 2027 au Brésil, octobre-septembre au Viêt Nam).

## Carte

Fond : « World location map.svg » (Wikimedia Commons, domaine public), planisphère équirectangulaire couvrant
-180/180° de longitude et -90/90° de latitude, assombri par un filtre CSS. Nouveau champ `map` du bloc `shot`
(`remotion/src/components/shorts.tsx`) : caméra qui glisse d'un cadrage à l'autre, pastilles (taille ∝ racine
du volume) et arcs. Points : Brésil (-47, -15) et Minas Gerais (-45, -18), Viêt Nam (108, 13), Colombie
(-74, 4,5), Éthiopie (39, 8), Indonésie (104, -5), UE (10, 50), États-Unis (-95, 38). Les arcs illustrent les
flux vers les deux grands importateurs (pas des routes réelles).

## Anti-répétition (C-04)

Premier Short sur le café et sur une matière première. Format The Map, pas encore utilisé ; le Short précédent
(03, Disney) est en One Number. Pas de politique (droits de douane non abordés), pas de conseil
d'investissement.

## Images (C-17)

Wikimedia Commons, voir `media.json` (licence, auteur, lien). Crédits CC BY et CC BY-SA ajoutés à la
description par `pipeline/short.py`. Les photos de plantations servent d'illustration ; seules celles du
Brésil (Carmo de Minas) et du Viêt Nam sont placées sur leur pays.

## Divulgation (C-13)

Voix de synthèse ; musique générée par IA ajoutée ensuite → `contains_synthetic_media: true`.
