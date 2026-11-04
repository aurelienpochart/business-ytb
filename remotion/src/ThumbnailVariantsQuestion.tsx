import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT, GOLD_TEXT} from './theme';
import {Brand, Halo, Photo, Vignette, WhiteLogo, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour une vidéo « The Question » (un produit, une règle qui change).
// Même charte (nuit teintée, or, verre, lumière) ; tout vient de thumbnail.json.
//   colis         : un colis en carton dessiné, étiquette « DUTY FREE » barrée d'un tampon rouge, prix géant (number).
//   tampon        : photo plein cadre (soute d'avion-cargo), énorme tampon de douane incliné (stamp) et words dessous.
//   interrogation : un point d'interrogation monumental en or fait de petits colis, logo à gauche, words en bas.
//   etiquette     : une étiquette de prix suspendue, l'ancien prix (number) et un « + duty » rouge qui la déchire.
export const QUESTION_VARIANTS = ['colis', 'tampon', 'interrogation', 'etiquette'] as const;
export type QuestionVariant = (typeof QUESTION_VARIANTS)[number];
export const isQuestionVariant = (v?: string): v is QuestionVariant => (QUESTION_VARIANTS as readonly string[]).includes(v ?? '');

export type ThumbQuestionProps = {
  variant: QuestionVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  logo?: string;
  logoRatio?: number;
  photo?: string;
  photoPosition?: string;
  stamp?: string; // texte du tampon (colis, tampon)
  label?: string; // texte de l'étiquette du colis / ligne rouge de l'étiquette
};

const GOLD_NUM = '#FFD98A';
const Num: React.FC<{text: string; size: number; color?: string; glow?: string; style?: React.CSSProperties}> = ({text, size, color = GOLD_NUM, glow = 'rgba(240,181,78,0.6)', style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.03, color, textShadow: `0 0 ${size * 0.45}px ${glow}`, lineHeight: 1, ...style}}>{text}</div>
);

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 72%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

const Stamp: React.FC<{text: string; size: number; rotate?: number; style?: React.CSSProperties}> = ({text, size, rotate = -12, style}) => (
  <div
    style={{
      position: 'absolute',
      transform: `rotate(${rotate}deg)`,
      padding: `${size * 0.12}px ${size * 0.36}px`,
      border: `${Math.max(5, size * 0.09)}px solid #FF4D3A`,
      borderRadius: size * 0.18,
      fontFamily: FONT.mono,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: size * 0.08,
      color: '#FF5A45',
      whiteSpace: 'nowrap',
      background: 'rgba(20,4,2,0.35)',
      boxShadow: '0 0 40px rgba(255,77,58,0.45), inset 0 0 24px rgba(255,77,58,0.25)',
      textShadow: '0 0 18px rgba(255,77,58,0.6)',
      ...style,
    }}
  >
    {text}
  </div>
);

// Colis en carton (dessin de la chaîne) : vue 3/4, ruban adhésif, étiquette blanche.
const Box: React.FC<{w: number; label: string; logo?: string; logoRatio: number}> = ({w, label, logo, logoRatio}) => {
  const h = w * 0.62;
  const d = w * 0.34;
  return (
    <div style={{position: 'relative', width: w + d, height: h + d * 0.6, filter: 'drop-shadow(0 50px 60px rgba(0,0,0,0.75)) drop-shadow(0 0 50px rgba(251,119,1,0.25))'}}>
      <svg width={w + d} height={h + d * 0.6} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="bx-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C98B4E" />
            <stop offset="1" stopColor="#8A5426" />
          </linearGradient>
          <linearGradient id="bx-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3AA6C" />
            <stop offset="1" stopColor="#B87A3E" />
          </linearGradient>
          <linearGradient id="bx-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7A4A20" />
            <stop offset="1" stopColor="#5C3614" />
          </linearGradient>
        </defs>
        {/* dessus */}
        <polygon points={`0,${d * 0.6} ${d},0 ${w + d},0 ${w},${d * 0.6}`} fill="url(#bx-top)" />
        {/* côté */}
        <polygon points={`${w},${d * 0.6} ${w + d},0 ${w + d},${h} ${w},${h + d * 0.6}`} fill="url(#bx-side)" />
        {/* face */}
        <rect x={0} y={d * 0.6} width={w} height={h} fill="url(#bx-front)" />
        {/* ruban */}
        <polygon points={`${w * 0.42},${d * 0.6} ${w * 0.42 + d},0 ${w * 0.58 + d},0 ${w * 0.58},${d * 0.6}`} fill="rgba(240,200,140,0.55)" />
        <rect x={w * 0.42} y={d * 0.6} width={w * 0.16} height={h * 0.35} fill="rgba(240,200,140,0.5)" />
      </svg>
      {/* étiquette d'expédition */}
      <div style={{position: 'absolute', left: w * 0.08, top: d * 0.6 + h * 0.3, width: w * 0.7, height: h * 0.66, background: '#F4F1EA', borderRadius: 8, boxShadow: '0 6px 14px rgba(0,0,0,0.35)', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          {logo ? <WhiteLogo file={logo} height={w * 0.07} width={w * 0.07 * logoRatio} color /> : <div />}
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: w * 0.04, color: '#1B1405', letterSpacing: 2}}>CN → US</div>
        </div>
        <div style={{height: w * 0.07, background: 'repeating-linear-gradient(90deg, #1B1405 0 3px, transparent 3px 6px, #1B1405 6px 10px, transparent 10px 12px)'}} />
        <div style={{position: 'relative', alignSelf: 'flex-start', fontFamily: FONT.title, fontWeight: 900, fontSize: w * 0.08, color: '#1B1405', letterSpacing: 1, lineHeight: 1.1}}>
          {label}
          <div style={{position: 'absolute', left: -6, right: -6, top: '44%', height: w * 0.018, background: '#E8321E', transform: 'rotate(-4deg)', boxShadow: '0 0 10px rgba(232,50,30,0.5)'}} />
        </div>
      </div>
    </div>
  );
};

// A : le colis. Un carton en 3/4 sur fond de nuit orange, étiquette « DUTY FREE » tamponnée « CLOSED ».
const Colis: React.FC<ThumbQuestionProps> = ({words = 'Can Temu *survive*?', number, numberLabel, logo, logoRatio = 4, stamp = 'CLOSED', label = 'DUTY FREE'}) => (
  <Night glow="70% 55%">
    <Halo x={860} y={420} r={420} />
    <div style={{position: 'absolute', left: 470, top: 175}}>
      <Box w={540} label={label} logo={logo} logoRatio={logoRatio} />
      <Stamp text={stamp} size={84} rotate={-14} style={{left: 250, top: 40, background: 'rgba(30,6,3,0.82)'}} />
    </div>
    <Words text={words} size={132} style={{position: 'absolute', left: 60, top: 70, width: 520}} />
    {number ? (
      <div style={{position: 'absolute', left: 64, bottom: 64}}>
        <Num text={number} size={150} />
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper, marginTop: 6}}>{numberLabel}</div> : null}
      </div>
    ) : null}
  </Night>
);

// B : le tampon. Photo d'avion-cargo plein cadre, tampon de douane géant, words en bas à gauche.
const Tampon: React.FC<ThumbQuestionProps> = ({words = 'Can Temu *survive*?', number, logo, logoRatio = 4, photo = 'freighter_nose.jpg', photoPosition = '60% 40%', stamp = 'NO FREE PASS'}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    <Photo file={photo} position={photoPosition} style={{filter: 'saturate(0.7) brightness(0.55) contrast(1.15)'}} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(${AMB.inkRgb},0.15) 0%, rgba(${AMB.inkRgb},0.35) 45%, rgba(${AMB.inkRgb},0.95) 100%)`}} />
    <AbsoluteFill style={{background: 'rgba(251,119,1,0.10)', mixBlendMode: 'color'}} />
    {logo ? <div style={{position: 'absolute', left: 64, top: 56}}><WhiteLogo file={logo} height={80} width={80 * logoRatio} /></div> : null}
    <Stamp text={stamp} size={92} rotate={-10} style={{left: 300, top: 210}} />
    <Words text={words} size={120} style={{position: 'absolute', left: 64, bottom: 56, width: 1000}} />
    {number ? <Num text={number} size={110} style={{position: 'absolute', right: 70, bottom: 70}} /> : null}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// C : le point d'interrogation. Un « ? » monumental en petits colis dorés, le logo et les words à gauche.
const Q_PATH: [number, number][] = (() => {
  // Points le long d'un « ? » : arc du haut, crochet, tige, puis le point.
  const pts: [number, number][] = [];
  for (let a = 200; a >= -60; a -= 13) {
    const r = (a * Math.PI) / 180;
    pts.push([150 + Math.cos(r) * 120, 150 - Math.sin(r) * 120]);
  }
  for (let k = 1; k <= 4; k++) pts.push([150 + 60 - k * 14, 254 + k * 26]);
  pts.push([150, 380]);
  pts.push([150, 410]);
  return pts;
})();
const Interrogation: React.FC<ThumbQuestionProps> = ({words = 'Can Temu *survive*?', number, numberLabel, logo, logoRatio = 4}) => (
  <Night glow="72% 45%">
    <Halo x={930} y={350} r={420} />
    <div style={{position: 'absolute', left: 760, top: 60, width: 340, height: 600}}>
      {Q_PATH.map(([x, y], i) => {
        const dot = i === Q_PATH.length - 1;
        const s = dot ? 92 : 58;
        return (
          <div key={i} style={{position: 'absolute', left: x * 1.25 - s / 2, top: y * 1.25 - s / 2 + (dot ? 40 : 0), width: s, height: s * 0.8, borderRadius: 8, background: 'linear-gradient(160deg, #FFE7B0 0%, #F0B54E 45%, #A8701E 100%)', boxShadow: '0 0 26px rgba(240,181,78,0.55), inset 0 -6px 0 rgba(0,0,0,0.2)', transform: `rotate(${(i * 37) % 24 - 12}deg)`}}>
            <div style={{position: 'absolute', left: '44%', top: 0, width: '12%', height: '100%', background: 'rgba(120,70,20,0.35)'}} />
          </div>
        );
      })}
    </div>
    {logo ? <div style={{position: 'absolute', left: 64, top: 70}}><WhiteLogo file={logo} height={96} width={96 * logoRatio} /></div> : null}
    <Words text={words} size={118} style={{position: 'absolute', left: 60, top: 210, width: 640}} />
    {number ? (
      <div style={{position: 'absolute', left: 64, bottom: 60}}>
        <Num text={number} size={96} />
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 32, color: C.paper, marginTop: 4}}>{numberLabel}</div> : null}
      </div>
    ) : null}
  </Night>
);

// D : l'étiquette de prix. Grande étiquette suspendue, le prix en or, une bande rouge « + DUTY » qui la barre.
const Etiquette: React.FC<ThumbQuestionProps> = ({words = 'The end of *cheap*?', number = '$2', numberLabel, logo, logoRatio = 4, photo, photoPosition, label = '+ DUTY'}) => (
  <Night glow="74% 50%">
    {photo ? <Photo file={photo} position={photoPosition} style={{opacity: 0.28, filter: 'blur(2px) saturate(0.7)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.94) 0%, rgba(${AMB.inkRgb},0.5) 50%, rgba(${AMB.inkRgb},0.15) 100%)`}} />
    <Halo x={900} y={380} r={400} />
    {/* ficelle */}
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
      <path d="M 1010 0 C 1000 60, 960 110, 905 168" stroke="#E8D9B8" strokeWidth={4} fill="none" />
    </svg>
    <div style={{position: 'absolute', left: 640, top: 150, width: 520, height: 420, transform: 'rotate(12deg)', filter: 'drop-shadow(0 40px 50px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(240,181,78,0.3))'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 22% 100%, 0 50%)', background: 'linear-gradient(140deg, #2A1406 0%, #120702 80%)', border: 'none'}} />
      <div style={{position: 'absolute', inset: 6, clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 22% 100%, 0 50%)', background: `linear-gradient(140deg, rgba(255,215,140,0.16), rgba(${AMB.inkRgb},0.9) 70%)`}} />
      <div style={{position: 'absolute', left: 64, top: 186, width: 46, height: 46, borderRadius: '50%', background: C.ink, border: '4px solid #E8D9B8'}} />
      {logo ? <div style={{position: 'absolute', left: 170, top: 60}}><WhiteLogo file={logo} height={52} width={52 * logoRatio} /></div> : null}
      <Num text={number} size={190} style={{position: 'absolute', left: 160, top: 130}} />
      <div style={{position: 'absolute', left: 60, right: -40, top: 300, height: 86, transform: 'rotate(-8deg)', background: 'linear-gradient(90deg, #C7321F, #FF5A45 60%, #C7321F)', boxShadow: '0 0 40px rgba(255,77,58,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: 60, letterSpacing: 6, color: '#FFF4EE'}}>{label}</div>
    </div>
    <Words text={words} size={124} style={{position: 'absolute', left: 60, top: 70, width: 600}} />
    {numberLabel ? <div style={{position: 'absolute', left: 64, bottom: 70, fontFamily: FONT.title, fontWeight: 800, fontSize: 36, color: C.paper, width: 520}}>{numberLabel}</div> : null}
  </Night>
);

export const ThumbnailVariantQuestion: React.FC<ThumbQuestionProps> = (p) => {
  if (p.variant === 'colis') return <Colis {...p} />;
  if (p.variant === 'tampon') return <Tampon {...p} />;
  if (p.variant === 'interrogation') return <Interrogation {...p} />;
  return <Etiquette {...p} />;
};

// Pour les miniatures de comparaison : reprise du dégradé or (utilisé par d'autres variantes).
export const QUESTION_GOLD = GOLD_TEXT;
