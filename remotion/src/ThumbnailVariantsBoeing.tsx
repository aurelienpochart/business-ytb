import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Brand, Vignette, WhiteLogo, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour la vidéo 08 Boeing (The Timeline, aviation).
// Même charte (nuit teintée, or, verre, lumière), compositions nouvelles par rapport aux vidéos 01 à 07.
//   plan     : un plan d'ingénieur (grille bleue, avion de ligne en profil au trait), barré d'une courbe rouge qui plonge.
//   cadran   : un instrument de cockpit monumental ; l'aiguille rouge plonge vers le chiffre des pertes.
//   panneau  : un tableau des départs à palettes ; chaque ligne est une année du déclin, statut en rouge.
//   silhouettes : trois avions au trait (1954, 1969 en or ; 2019 en rouge), de plus en plus grands.
export const BOEING_VARIANTS = ['plan', 'cadran', 'panneau', 'silhouettes'] as const;
export type BoeingVariant = (typeof BOEING_VARIANTS)[number];
export const isBoeingVariant = (v?: string): v is BoeingVariant => (BOEING_VARIANTS as readonly string[]).includes(v ?? '');

export type ThumbBoeingProps = {
  variant: BoeingVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  logo?: string;
  logoRatio?: number;
  photo?: string;
  photoPosition?: string;
  rows?: {year: string; label: string; status: string}[]; // panneau
};

const GOLD_NUM = '#FFD98A';
const RED = '#FF4A3D';
const BP = 'rgba(150,200,255,';

const Num: React.FC<{text: string; size: number; color?: string; style?: React.CSSProperties}> = ({text, size, color = GOLD_NUM, style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.04, color, textShadow: `0 0 ${size * 0.45}px ${color === GOLD_NUM ? 'rgba(240,181,78,0.6)' : 'rgba(255,74,61,0.6)'}`, lineHeight: 1, ...style}}>{text}</div>
);
const Label: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 30, color: C.paper, opacity: 0.9, ...style}}>{text}</div>
);

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 72%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// Avion de ligne en profil, au trait (repère 1600 x 560, nez à droite).
const Jet: React.FC<{stroke: string; width: number; fill?: string}> = ({stroke, width, fill = 'none'}) => (
  <g fill={fill} stroke={stroke} strokeWidth={width} strokeLinejoin="round">
    <path d="M 260 230 L 1290 230 C 1385 230 1448 262 1474 296 C 1450 332 1390 362 1290 362 L 300 362 C 225 358 150 326 96 292 L 96 274 C 150 252 205 230 260 230 Z" />
    <path d="M 150 246 L 62 66 L 138 66 L 318 236 Z" />
    <path d="M 70 286 L 26 304 L 196 304 L 246 288 Z" />
    <path d="M 590 336 L 900 336 L 812 392 L 548 392 Z" />
    <rect x={760} y={392} width={150} height={56} rx={26} />
    {Array.from({length: 36}, (_, k) => (
      <rect key={k} x={340 + k * 26} y={272} width={12} height={17} rx={6} strokeWidth={width * 0.6} />
    ))}
    <path d="M 1392 268 L 1440 272 L 1452 288 L 1400 286 Z" strokeWidth={width * 0.7} />
    {[700, 1000, 1290].map((x) => (
      <line key={x} x1={x} y1={232} x2={x} y2={360} strokeDasharray="8 8" strokeWidth={width * 0.6} />
    ))}
  </g>
);

const Logo: React.FC<{file?: string; ratio: number; h: number; style: React.CSSProperties}> = ({file, ratio, h, style}) =>
  file ? (
    <div style={{position: 'absolute', ...style}}>
      <WhiteLogo file={file} height={h} width={h * ratio} />
    </div>
  ) : null;

// A : le plan d'ingénieur barré d'une courbe rouge.
const Plan: React.FC<ThumbBoeingProps> = ({words = 'What *really* went wrong', number = '−$35.7B', numberLabel = 'lost from 2019 to 2024', logo, logoRatio = 4.6}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 62% 45%, #0B2A66 0%, #04102A 55%, ${C.ink} 100%)`, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${BP}0.10) 1px, transparent 1px), linear-gradient(90deg, ${BP}0.10) 1px, transparent 1px), linear-gradient(${BP}0.04) 1px, transparent 1px), linear-gradient(90deg, ${BP}0.04) 1px, transparent 1px)`,
        backgroundSize: '80px 80px, 80px 80px, 16px 16px, 16px 16px',
      }}
    />
    <svg viewBox="0 0 1600 560" style={{position: 'absolute', left: 500, top: 60, width: 1100, height: 385, filter: 'drop-shadow(0 0 10px rgba(120,180,255,0.6))'}}>
      <Jet stroke={`${BP}0.95)`} width={4} fill="rgba(120,170,255,0.06)" />
      <line x1={96} y1={520} x2={1474} y2={520} stroke={`${BP}0.6)`} strokeWidth={3} />
      <line x1={96} y1={500} x2={96} y2={540} stroke={`${BP}0.6)`} strokeWidth={3} />
      <line x1={1474} y1={500} x2={1474} y2={540} stroke={`${BP}0.6)`} strokeWidth={3} />
    </svg>
    {/* La courbe rouge qui plonge à travers le plan */}
    <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
      <path d="M 600 150 C 760 150 850 175 925 260 C 1000 350 1045 470 1200 600" fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 18px rgba(255,74,61,0.8))'}} />
      <path d="M 1200 600 l -8 -46 l 40 26 z" fill={RED} />
    </svg>
    <Logo file={logo} ratio={logoRatio} h={62} style={{left: 60, top: 52}} />
    <Words text={words} size={112} style={{position: 'absolute', left: 60, top: 150, width: 560}} />
    <div style={{position: 'absolute', left: 60, bottom: 54}}>
      <Num text={number} size={104} color={RED} />
      <Label text={numberLabel} style={{marginTop: 6}} />
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// B : l'instrument de cockpit dont l'aiguille rouge plonge.
const Cadran: React.FC<ThumbBoeingProps> = ({words = 'What *really* went wrong', number = '−$35.7B', numberLabel = 'lost from 2019 to 2024', logo, logoRatio = 4.6}) => {
  const cx = 930;
  const cy = 380;
  const R = 270;
  const ticks = Array.from({length: 41}, (_, k) => -225 + (k * 270) / 40);
  const pt = (a: number, r: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const needle = 80; // pointe vers le bas, à droite : la plongée
  return (
    <Night glow="72% 50%">
      <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="tb-face" cx="50%" cy="40%" r="65%">
            <stop offset="0" stopColor="#15274A" />
            <stop offset="1" stopColor="#040914" />
          </radialGradient>
          <linearGradient id="tb-bezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B98B3" />
            <stop offset="0.45" stopColor="#1A2233" />
            <stop offset="1" stopColor="#55627C" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R + 50} fill="url(#tb-bezel)" style={{filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))'}} />
        <circle cx={cx} cy={cy} r={R + 28} fill="url(#tb-face)" />
        {/* Zone rouge */}
        <path d={`M ${pt(10, R - 10)[0]} ${pt(10, R - 10)[1]} A ${R - 10} ${R - 10} 0 0 1 ${pt(45, R - 10)[0]} ${pt(45, R - 10)[1]}`} fill="none" stroke={RED} strokeWidth={22} opacity={0.9} />
        {ticks.map((a, k) => {
          const major = k % 5 === 0;
          const [x0, y0] = pt(a, R + 10);
          const [x1, y1] = pt(a, R - (major ? 34 : 14));
          return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.paper} strokeWidth={major ? 5 : 2.5} opacity={major ? 1 : 0.55} />;
        })}
        <g transform={`rotate(${needle} ${cx} ${cy})`} style={{filter: 'drop-shadow(0 0 16px rgba(255,74,61,0.9))'}}>
          <path d={`M ${cx - 40} ${cy - 10} L ${cx + R - 30} ${cy - 3} L ${cx + R - 6} ${cy} L ${cx + R - 30} ${cy + 3} L ${cx - 40} ${cy + 10} Z`} fill={RED} />
        </g>
        <circle cx={cx} cy={cy} r={34} fill="url(#tb-bezel)" />
        <circle cx={cx} cy={cy} r={12} fill={GOLD_NUM} />
      </svg>
      <div style={{position: 'absolute', left: cx - 200, width: 400, top: cy - 175, textAlign: 'center'}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.mute}}>NET RESULT</div>
      </div>
      <Logo file={logo} ratio={logoRatio} h={62} style={{left: 60, top: 52}} />
      <Words text={words} size={108} style={{position: 'absolute', left: 60, top: 150, width: 520}} />
      <div style={{position: 'absolute', left: 60, bottom: 54}}>
        <Num text={number} size={100} color={RED} />
        <Label text={numberLabel} style={{marginTop: 6}} />
      </div>
    </Night>
  );
};

// C : le tableau des départs à palettes.
const Flap: React.FC<{text: string; w: number; color?: string; size?: number}> = ({text, w, color = '#F4F1EA', size = 40}) => (
  <div style={{display: 'flex', gap: 4}}>
    {text
      .padEnd(w, ' ')
      .slice(0, w)
      .split('')
      .map((ch, i) => (
        <div key={i} style={{position: 'relative', width: size * 0.78, height: size * 1.32, borderRadius: 5, background: 'linear-gradient(180deg, #1C2230 0%, #10141D 49%, #05070B 51%, #141925 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 6px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: size, color}}>
          {ch}
          <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(0,0,0,0.7)'}} />
        </div>
      ))}
  </div>
);
const Panneau: React.FC<ThumbBoeingProps> = ({words = 'What *really* went wrong', number = '−$35.7B', numberLabel = 'lost from 2019 to 2024', logo, logoRatio = 4.6, rows}) => {
  const R = rows ?? [
    {year: '1997', label: 'MERGER', status: 'MCDONNELL'},
    {year: '2011', label: '737 MAX', status: 'NEW ENGINES'},
    {year: '2019', label: 'MAX', status: 'GROUNDED'},
    {year: '2024', label: 'DOOR PLUG', status: 'NO BOLTS'},
  ];
  return (
    <Night glow="60% 40%">
      <div style={{position: 'absolute', left: 540, top: 150, padding: '26px 30px', borderRadius: 18, background: 'linear-gradient(180deg, #0A0E16, #05070B)', border: '2px solid rgba(255,255,255,0.10)', boxShadow: '0 40px 80px rgba(0,0,0,0.75), 0 0 60px rgba(60,120,255,0.18)', transform: 'perspective(1600px) rotateY(-12deg)', transformOrigin: '0% 50%'}}>
        <div style={{display: 'flex', gap: 24, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: '#F2C14E', marginBottom: 14}}>
          <span style={{width: 4 * 25}}>YEAR</span>
          <span style={{width: 9 * 25}}>FLIGHT</span>
          <span>STATUS</span>
        </div>
        {R.map((r, i) => (
          <div key={i} style={{display: 'flex', gap: 24, marginBottom: 12}}>
            <Flap text={r.year} w={4} size={27} color="#F2C14E" />
            <Flap text={r.label} w={9} size={27} />
            <Flap text={r.status} w={11} size={27} color={RED} />
          </div>
        ))}
      </div>
      <Logo file={logo} ratio={logoRatio} h={56} style={{left: 60, top: 52}} />
      <Words text={words} size={96} style={{position: 'absolute', left: 60, top: 140, width: 440}} />
      <div style={{position: 'absolute', left: 60, bottom: 50}}>
        <Num text={number} size={100} color={RED} />
        <Label text={numberLabel} style={{marginTop: 6}} />
      </div>
    </Night>
  );
};

// D : trois silhouettes d'avion au trait, de plus en plus grandes : deux en or (l'âge d'or), la dernière en rouge.
const Silhouettes: React.FC<ThumbBoeingProps> = ({words = 'What *really* went wrong', number = '−$35.7B', numberLabel = 'lost from 2019 to 2024', logo, logoRatio = 4.6}) => {
  const jets = [
    {year: '1954', x: 560, y: 70, w: 420, col: 'rgba(255,217,138,0.95)', glow: 'rgba(240,181,78,0.7)'},
    {year: '1969', x: 640, y: 230, w: 520, col: 'rgba(255,217,138,0.95)', glow: 'rgba(240,181,78,0.7)'},
    {year: '2019', x: 600, y: 420, w: 640, col: RED, glow: 'rgba(255,74,61,0.8)'},
  ];
  return (
    <Night glow="68% 50%">
      {jets.map((j, i) => (
        <div key={i} style={{position: 'absolute', left: j.x, top: j.y, width: j.w}}>
          <svg viewBox="0 0 1600 560" style={{width: j.w, height: (j.w * 560) / 1600, filter: `drop-shadow(0 0 12px ${j.glow})`}}>
            <Jet stroke={j.col} width={i === 2 ? 9 : 7} />
          </svg>
          <div style={{position: 'absolute', left: j.w * 0.42, top: -14, fontFamily: FONT.mono, fontWeight: 600, fontSize: 44, color: j.col, textShadow: `0 0 20px ${j.glow}`}}>{j.year}</div>
        </div>
      ))}
      <Logo file={logo} ratio={logoRatio} h={62} style={{left: 60, top: 52}} />
      <Words text={words} size={100} style={{position: 'absolute', left: 60, top: 150, width: 420}} />
      <div style={{position: 'absolute', left: 60, bottom: 54}}>
        <Num text={number} size={96} color={RED} />
        <Label text={numberLabel} style={{marginTop: 6}} />
      </div>
    </Night>
  );
};

export const ThumbnailVariantBoeing: React.FC<ThumbBoeingProps> = (p) => {
  if (p.variant === 'cadran') return <Cadran {...p} />;
  if (p.variant === 'panneau') return <Panneau {...p} />;
  if (p.variant === 'silhouettes') return <Silhouettes {...p} />;
  return <Plan {...p} />;
};
