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

export const GOLD_TEXT = 'linear-gradient(100deg, #A8701E 0%, #F0B54E 22%, #FFE7B0 40%, #FFF8E6 50%, #FFE7B0 60%, #F0B54E 78%, #A8701E 100%)';

export const FONT = {
  display: '"Instrument Serif", Georgia, serif',
  title: 'Inter, sans-serif',
  mono: '"IBM Plex Mono", monospace',
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
