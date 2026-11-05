import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';

// Charte The Cost Curve (section 2), version « premium » : bleu nuit profond, or, verre, lumière.
// Les clés historiques (amber, teal, brick, slate, navy, paper) restent valables dans visuals.json.
export const C = {
  ink: '#03060C',
  navy: '#0A1424',
  navyLight: '#13233A',
  paper: '#F4F1EA',
  mute: '#8C9AAD',
  amber: '#F0B54E',
  gold: '#F0B54E',
  goldLight: '#FFE7B0',
  goldDeep: '#A8701E',
  teal: '#3CCBB7',
  brick: '#FF6A55',
  slate: '#6E8199',
  line: 'rgba(255,255,255,0.09)',
};

// Dégradés par couleur : [bas, haut, halo].
export const GRAD: Record<string, [string, string, string]> = {
  amber: ['#A8701E', '#FFD27F', 'rgba(240,181,78,0.45)'],
  gold: ['#A8701E', '#FFD27F', 'rgba(240,181,78,0.45)'],
  teal: ['#12695E', '#5FF0DB', 'rgba(60,203,183,0.40)'],
  brick: ['#8E2A1D', '#FF8A75', 'rgba(255,106,85,0.40)'],
  slate: ['#2A3647', '#8597B0', 'rgba(133,151,176,0.25)'],
  paper: ['#9C9A94', '#FFFFFF', 'rgba(255,255,255,0.25)'],
};

// Ambiance (fonds, halos, étalonnage des photos) : valeurs de la teinte par défaut « bleu nuit ».
export const AMB = {
  inkRgb: '3,6,12', // voiles sombres : rgba(inkRgb, a)
  night: '#172C52', // cœur lumineux des fonds de miniature
  nightSoft: '#14284A',
  orbCool: 'rgba(70,110,200,0.08)', // halo froid sous le sol
  orbTeal: 'rgba(60,203,183,0.07)',
  particle: '#cfe3ff',
  photoGrade: 'rgba(20,40,80,0.25)', // voile coloré (mix-blend « color ») sur les photos
  photoFilter: '', // filtre CSS ajouté à toutes les photos
  regradeFilter: '', // filtre CSS des photos listées dans "tint_regrade" (photos très colorées, ex. data center bleu)
  heroNum: '#6FF2DF',
  heroNumGlow: 'rgba(60,203,183,0.5)',
};

// Teintes d'ambiance réglables par vidéo (champ "tint" de videos/<v>/metadata.json).
// Une teinte ne remplace que les nuances froides : l'or reste l'accent principal.
type Palette = {C: Partial<typeof C>; GRAD: Partial<typeof GRAD>; AMB: Partial<typeof AMB>};
export const TINTS: Record<string, Palette> = {
  nvidia: {
    // Vert presque noir, halos verts discrets, vert Nvidia (#76B900) pour les chiffres « teal ».
    C: {ink: '#020604', navy: '#0A1A0E', navyLight: '#132A18', mute: '#93A38F', slate: '#74876F', teal: '#8CD42A'},
    GRAD: {
      teal: ['#3F6A06', '#A6E848', 'rgba(118,185,0,0.42)'],
      slate: ['#2B3A2B', '#8EA289', 'rgba(142,162,137,0.25)'],
    },
    AMB: {
      inkRgb: '2,6,4',
      night: '#183C1E',
      nightSoft: '#163419',
      orbCool: 'rgba(118,185,0,0.07)',
      orbTeal: 'rgba(118,185,0,0.06)',
      particle: '#e0f5c8',
      photoGrade: 'rgba(30,72,22,0.24)',
      photoFilter: '',
      regradeFilter: 'hue-rotate(-128deg) saturate(0.6)',
      heroNum: '#A6EB3C',
      heroNumGlow: 'rgba(118,185,0,0.5)',
    },
  },
  costco: {
    // Rouge Costco (#E31837) pour l'ambiance : nuit bordeaux presque noire, halos rouges discrets ; l'or reste
    // l'accent principal. Les chiffres « teal » passent au bleu Costco éclairci (#005DAA, la 2e couleur de la marque),
    // qui reste lisible sur le fond rouge sombre et ne se confond pas avec le rouge brique des baisses.
    C: {ink: '#070203', navy: '#1C080B', navyLight: '#2C0F14', mute: '#AE9799', slate: '#8C7779', teal: '#6FB4FF'},
    GRAD: {
      teal: ['#0B4F9A', '#8CC6FF', 'rgba(70,150,240,0.40)'],
      slate: ['#3A2C2E', '#A08A8C', 'rgba(160,138,140,0.25)'],
    },
    AMB: {
      inkRgb: '7,2,3',
      night: '#4A121B',
      nightSoft: '#3D0F17',
      orbCool: 'rgba(227,24,55,0.08)',
      orbTeal: 'rgba(227,24,55,0.06)',
      particle: '#ffe0e3',
      photoGrade: 'rgba(96,18,30,0.22)',
      photoFilter: '',
      regradeFilter: 'saturate(0.55)',
      heroNum: '#FF6476',
      heroNumGlow: 'rgba(227,24,55,0.55)',
    },
  },
  intel: {
    // Bleu Intel (#0068B5) pour l'ambiance : nuit cobalt presque noire, halos bleu électrique plus saturés que
    // le bleu nuit par défaut ; l'or reste l'accent principal. Les chiffres « teal » passent au cyan Intel
    // (#00C7FD), lisible sur le fond cobalt et distinct de l'or et du rouge brique.
    C: {ink: '#01040C', navy: '#04142E', navyLight: '#08234A', mute: '#93A6C2', slate: '#7189AD', teal: '#38D2FF'},
    GRAD: {
      teal: ['#005E9E', '#7FE3FF', 'rgba(0,199,253,0.42)'],
      slate: ['#24364F', '#8BA3C4', 'rgba(139,163,196,0.25)'],
    },
    AMB: {
      inkRgb: '1,4,12',
      night: '#0B3A86',
      nightSoft: '#0A3070',
      orbCool: 'rgba(0,104,181,0.12)',
      orbTeal: 'rgba(0,199,253,0.06)',
      particle: '#d6efff',
      photoGrade: 'rgba(0,60,140,0.26)',
      photoFilter: '',
      regradeFilter: 'saturate(0.6)',
      heroNum: '#5FDcff',
      heroNumGlow: 'rgba(0,199,253,0.55)',
    },
  },
  ryanair: {
    // Bleu Ryanair (#073590) pour l'ambiance : nuit bleu roi presque noire, halos bleu roi ; l'or reste
    // l'accent principal et rejoint le jaune Ryanair (#F1C933) pour les grands chiffres des photos. Les chiffres
    // « teal » passent à un bleu ciel (#4FA8FF), lisible sur le bleu roi et distinct de l'or et du rouge brique.
    C: {ink: '#01030B', navy: '#05112E', navyLight: '#0A1D4A', mute: '#97A5C6', slate: '#7286B2', teal: '#4FA8FF'},
    GRAD: {
      teal: ['#0B4FA8', '#8CC8FF', 'rgba(79,168,255,0.42)'],
      slate: ['#26355A', '#8C9DC6', 'rgba(140,157,198,0.25)'],
    },
    AMB: {
      inkRgb: '1,3,11',
      night: '#0A2C7A',
      nightSoft: '#082566',
      orbCool: 'rgba(7,53,144,0.16)',
      orbTeal: 'rgba(241,201,51,0.05)',
      particle: '#fff3c9',
      photoGrade: 'rgba(7,40,120,0.28)',
      photoFilter: '',
      regradeFilter: 'saturate(0.6)',
      heroNum: '#F7D54A',
      heroNumGlow: 'rgba(241,201,51,0.55)',
    },
  },
  temu: {
    // Orange Temu (#FB7701) pour l'ambiance : nuit brun-orangé presque noire, halos orange ; l'or reste l'accent
    // principal (plus clair et plus jaune que l'orange, donc distinct). Les chiffres « teal » passent à un
    // turquoise clair (#4FD8E0), complémentaire de l'orange, lisible et distinct de l'or et du rouge brique.
    C: {ink: '#070301', navy: '#1E0D04', navyLight: '#311708', mute: '#B39C8C', slate: '#8F7766', teal: '#4FD8E0'},
    GRAD: {
      teal: ['#11727A', '#8DF0F5', 'rgba(79,216,224,0.40)'],
      slate: ['#3D2C22', '#A58E7E', 'rgba(165,142,126,0.25)'],
    },
    AMB: {
      inkRgb: '7,3,1',
      night: '#5A2406',
      nightSoft: '#4A1E06',
      orbCool: 'rgba(251,119,1,0.10)',
      orbTeal: 'rgba(251,119,1,0.06)',
      particle: '#ffe6cc',
      photoGrade: 'rgba(120,52,8,0.24)',
      photoFilter: '',
      regradeFilter: 'saturate(0.6)',
      heroNum: '#FF9A3C',
      heroNumGlow: 'rgba(251,119,1,0.55)',
    },
  },
  netflix: {
    // Rouge Netflix (#E50914) pour l'ambiance : nuit d'un noir rouge, plus sombre et plus « salle de cinéma » que
    // le bordeaux de Costco, halos rouge vif ; l'or reste l'accent principal. Les chiffres « teal » passent à un
    // bleu glacier (#8FD8FF), lisible sur le fond rouge sombre et distinct de l'or et du rouge brique des baisses.
    C: {ink: '#060101', navy: '#160304', navyLight: '#260608', mute: '#B29A9B', slate: '#8E7576', teal: '#8FD8FF'},
    GRAD: {
      teal: ['#1F6E9E', '#B5E6FF', 'rgba(143,216,255,0.40)'],
      slate: ['#3A2627', '#A38C8D', 'rgba(163,140,141,0.25)'],
    },
    AMB: {
      inkRgb: '6,1,1',
      night: '#520A10',
      nightSoft: '#43080D',
      orbCool: 'rgba(229,9,20,0.11)',
      orbTeal: 'rgba(229,9,20,0.06)',
      particle: '#ffd9db',
      photoGrade: 'rgba(110,8,16,0.26)',
      photoFilter: '',
      regradeFilter: 'saturate(0.55)',
      heroNum: '#FF2E3A',
      heroNumGlow: 'rgba(229,9,20,0.6)',
    },
  },
};

const DEFAULT = {C: {...C}, GRAD: {...GRAD}, AMB: {...AMB}};
let current = '';
let regrade: string[] = [];
// Applique la teinte d'une vidéo (sans teinte ou inconnue : bleu nuit d'origine). Appelée en tête des
// compositions, avant le rendu des composants qui lisent C, GRAD et AMB.
export const applyTint = (name?: string, regradeIds: string[] = []) => {
  const key = `${name ?? ''}|${regradeIds.join(',')}`;
  if (key === current) return;
  current = key;
  regrade = regradeIds;
  const t = (name && TINTS[name]) || {C: {}, GRAD: {}, AMB: {}};
  Object.assign(C, DEFAULT.C, t.C);
  Object.assign(GRAD, DEFAULT.GRAD, t.GRAD);
  Object.assign(AMB, DEFAULT.AMB, t.AMB);
};

// Filtre CSS supplémentaire d'une photo selon la teinte ('' par défaut).
export const photoTint = (id: string) => [AMB.photoFilter, regrade.includes(id) ? AMB.regradeFilter : ''].filter(Boolean).join(' ');

export const GOLD_TEXT = 'linear-gradient(100deg, #A8701E 0%, #F0B54E 22%, #FFE7B0 40%, #FFF8E6 50%, #FFE7B0 60%, #F0B54E 78%, #A8701E 100%)';

export const FONT = {
  display: '"Instrument Serif", Georgia, serif',
  title: 'Inter, sans-serif',
  mono: '"IBM Plex Mono", monospace',
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
