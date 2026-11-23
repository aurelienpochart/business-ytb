# Production automatique continue (« la boucle »)

Mise en place le 23/11/2026 à la demande d'aurelien : chaque vidéo longue publiée déclenche, le lendemain, la production de la suivante et de ses Shorts, indéfiniment, jusqu'à ce qu'il l'arrête.

## Fonctionnement

- Une **tâche programmée Claude** (« The Cost Curve : production automatique ») se lance **chaque mercredi et chaque samedi à 9 h 23 UTC** (10 h 23 à Paris), c'est-à-dire le lendemain des sorties du mardi et du vendredi 15 h UTC. Chaque lancement ouvre une session neuve sur ce dépôt.
- La session lit ce fichier et suit la procédure ci-dessous. Si une vidéo longue est déjà programmée dans le futur, elle ne fait rien : la boucle ne produit donc qu'une vidéo d'avance et se cale toute seule sur les sorties, même après une panne.
- Branche de production : `claude/project-thread-t3c48c` (celle de `config/boucle.json`). Toutes les productions y sont commitées et les workflows y tournent, pour que `config/calendar.json` reste à jour d'une production à l'autre.

## Arrêter la boucle

Au choix :
1. Dire à Claude « arrête la production automatique » (il désactive ou supprime la tâche programmée).
2. Mettre `"active": false` dans `config/boucle.json` sur la branche de production : la tâche continue de se lancer mais s'arrête aussitôt sans rien produire.
3. Supprimer la tâche dans claude.ai (Code > tâches programmées).

Une vidéo déjà envoyée reste programmée : pour l'empêcher de sortir, la repasser en privé sans date dans YouTube Studio.

## Procédure de chaque lancement

1. `git fetch origin <branche>` puis travailler sur cette branche (worktree si besoin) ; pousser uniquement sur elle.
2. Garde-fous, dans l'ordre ; si l'un bloque, s'arrêter et le dire dans le compte rendu :
   - `config/boucle.json` : `active` doit valoir `true`.
   - `config/calendar.json` : si une entrée `kind: long` a un `publish_at` dans le futur, il n'y a rien à faire.
   - Au plus 3 vidéos longues par semaine (le calendrier mar./ven. en donne 2).
   - Un échec d'envoi, une réclamation Content ID, un avertissement, une monétisation limitée ou un refus YPP signalé dans le dépôt ou la mémoire du projet : mettre `active` à `false`, ne rien envoyer, prévenir aurelien (retour à la validation manuelle, checklist de conformité).
3. Choisir le sujet dans `config/sujets.md` (règles en tête du fichier), vérifier qu'il n'a pas déjà été traité (`videos/`), et le rayer.
4. Produire la vidéo longue de bout en bout avec le skill `produire-video-youtube` (recherche sourcée et datée, script, métadonnées, médias, visuels, miniature en plusieurs variantes, rendu 1440p, contrôle de l'aperçu, musique, envoi en privé avec `publish_at` = `auto`), puis son Short extrait (`videos/<v>/shorts/1`), puis **un** Short original (`videos/shorts-originaux/<n>`, sujet du quotidien, `publish_at` = `auto`). Deux lancements par semaine donnent 2 Shorts originaux par semaine.
5. Commiter les IDs YouTube (les workflows le font) et cocher le sujet dans `config/sujets.md`.
6. Compte rendu final court : titre, date de sortie programmée (heure de Paris), liens YouTube, miniature retenue, ce qui reste à faire dans Studio (écran de fin « Importer depuis une vidéo », vidéo associée du Short).

## Budget

Chaque vidéo coûte quelques dizaines de centimes en Google Cloud (voix Chirp 3 HD, LINEAR16) ; la musique réutilise les pistes Lyria déjà générées. Le dépôt reste public pour les minutes GitHub Actions gratuites. Budget du projet : 100 €/mois.
