# The Cost Curve : pipeline de production

Dépôt du pipeline qui produit les vidéos de la chaîne YouTube **The Cost Curve**
(économie et industrie expliquées, en anglais).

Aucun secret n'est stocké ici. Les accès passent par :
- **Google Cloud** (voix Chirp 3 HD, Imagen) : fédération d'identité GitHub → Google,
  sans clé (compte de service `pipeline@business-ytb.iam.gserviceaccount.com`).
- **Autres clés** (Pixabay, FRED, puis YouTube et Claude) : secrets GitHub Actions.

## Contenu

| Chemin | Rôle |
|---|---|
| `pipeline/voice_test.py` | Génère le même texte avec plusieurs voix Chirp 3 HD (test d'écoute). |
| `config/voice-test.json` | Voix à comparer et texte utilisé. |
| `content/voice-test/sample.txt` | Paragraphe d'essai, dans le style de la chaîne. |
| `samples/voix/` | Échantillons MP3 produits par le test. |
| `.github/workflows/voice-test.yml` | Lance le test sur GitHub Actions. |
