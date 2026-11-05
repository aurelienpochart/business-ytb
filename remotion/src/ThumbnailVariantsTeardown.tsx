import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Brand, Halo, Photo, Vignette, WhiteLogo, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour une vidéo « The Teardown » (un dollar démonté).
// Même charte (nuit teintée, or, verre, lumière) ; tout vient de thumbnail.json.
//   lecteur : un écran de lecteur vidéo ; la barre de progression est le dollar découpé (contenu, coûts, profit en or).
//   piece   : une pièce d'un dollar monumentale, dont une part d'un tiers se détache, dorée et lumineuse.
//   rideau  : un rideau de salle de cinéma qui s'ouvre sur un chiffre géant (number) et son libellé.
//   cadenas : un champ de mot de passe « •••••••• » scellé d'un cadenas doré, étiquette de prix (label).
export const TEARDOWN_VARIANTS = ['lecteur', 'piece', 'rideau', 'cadenas'] as const;
export type TeardownVariant = (typeof TEARDOWN_VARIANTS)[number];
export const isTeardownVariant = (v?: string): v is TeardownVariant => (TEARDOWN_VARIANTS as readonly string[]).includes(v ?? '');

export type ThumbTeardownProps = {
  variant: TeardownVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  logo?: string;
  logoRatio?: number;
  photo?: string;
  photoPosition?: string;
  label?: string;
  segments?: {value: number; color: string; label?: string}[]; // lecteur : parts de la barre
};

const GOLD_NUM = '#FFD98A';
const RED = '#E50914';
const Num: React.FC<{text: string; size: number; style?: React.CSSProperties}> = ({text, size, style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.03, color: GOLD_NUM, textShadow: `0 0 ${size * 0.45}px rgba(240,181,78,0.6)`, lineHeight: 1, ...style}}>{text}</div>
);

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 72%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

const SEG_COLORS: Record<string, string> = {red: '#B3121C', slate: '#4E3E40', gold: '#F0B54E'};

// A : le lecteur. Un grand écran incliné, bouton lecture, barre de progression = un dollar démonté.
const Lecteur: React.FC<ThumbTeardownProps> = ({words = 'A *third* is profit', number = '35¢', numberLabel = 'of every $1', logo, logoRatio = 3.7, photo, photoPosition, segments}) => {
  const segs = segments ?? [
    {value: 33, color: 'red', label: 'CONTENT'},
    {value: 32, color: 'slate', label: 'COSTS'},
    {value: 35, color: 'gold', label: 'PROFIT'},
  ];
  const total = segs.reduce((a, b) => a + b.value, 0);
  const W = 760;
  return (
    <Night glow="68% 45%">
      <Halo x={880} y={330} r={430} />
      <div style={{position: 'absolute', left: 470, top: 70, width: W, height: 440, transform: 'perspective(1400px) rotateY(-14deg) rotateX(4deg)', transformOrigin: '30% 50%'}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: 'linear-gradient(150deg, #1A0A0B 0%, #070202 70%)', border: '3px solid rgba(255,255,255,0.14)', boxShadow: '0 50px 90px rgba(0,0,0,0.8), 0 0 80px rgba(229,9,20,0.25)', overflow: 'hidden'}}>
          {photo ? <Photo file={photo} position={photoPosition} style={{opacity: 0.35, filter: 'saturate(0.5) brightness(0.6)'}} /> : null}
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(229,9,20,0.18), transparent 60%)'}} />
          {/* bouton lecture */}
          <div style={{position: 'absolute', left: W / 2 - 80, top: 110, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(255,255,255,0.15)'}}>
            <div style={{width: 0, height: 0, borderTop: '38px solid transparent', borderBottom: '38px solid transparent', borderLeft: `62px solid ${C.paper}`, marginLeft: 14}} />
          </div>
          {/* barre de progression : le dollar */}
          <div style={{position: 'absolute', left: 40, right: 40, top: 340, height: 34, display: 'flex', borderRadius: 17, overflow: 'hidden', boxShadow: '0 0 40px rgba(240,181,78,0.35)'}}>
            {segs.map((s, i) => (
              <div key={i} style={{width: `${(s.value / total) * 100}%`, height: '100%', background: s.color === 'gold' ? 'linear-gradient(180deg, #FFE7B0, #F0B54E 50%, #A8701E)' : SEG_COLORS[s.color] ?? s.color, borderRight: i < segs.length - 1 ? '3px solid #070202' : undefined}} />
            ))}
          </div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 386, display: 'flex'}}>
            {segs.map((s, i) => (
              <div key={i} style={{width: `${(s.value / total) * 100}%`, fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: s.color === 'gold' ? GOLD_NUM : C.mute}}>{s.label}</div>
            ))}
          </div>
          {/* tête de lecture sur la frontière du profit */}
          <div style={{position: 'absolute', left: 40 + (W - 80) * ((total - segs[segs.length - 1].value) / total) - 18, top: 339, width: 36, height: 36, borderRadius: '50%', background: '#FFF3D6', boxShadow: '0 0 24px rgba(240,181,78,0.9)'}} />
        </div>
      </div>
      {logo ? <div style={{position: 'absolute', left: 64, top: 64}}><WhiteLogo file={logo} height={84} width={84 * logoRatio} /></div> : null}
      <Words text={words} size={112} style={{position: 'absolute', left: 60, top: 190, width: 470}} />
      <div style={{position: 'absolute', left: 64, bottom: 52}}>
        <Num text={number} size={128} />
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper, marginTop: 2}}>{numberLabel}</div> : null}
      </div>
    </Night>
  );
};

// B : la pièce. Un dollar en or, monumental ; une part d'un tiers se détache et brille.
const Piece: React.FC<ThumbTeardownProps> = ({words = 'A *third* is profit', number = '35¢', numberLabel = 'kept from every $1', logo, logoRatio = 3.7}) => {
  const R = 270;
  const cx = 300;
  const cy = 300;
  const share = 0.346;
  const a0 = -90;
  const a1 = a0 + 360 * share;
  const pt = (a: number, r = R) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  const mid = (a0 + a1) / 2;
  const off = 46;
  const dx = off * Math.cos((mid * Math.PI) / 180);
  const dy = off * Math.sin((mid * Math.PI) / 180);
  return (
    <Night glow="66% 50%">
      <Halo x={900} y={360} r={430} />
      <svg width={640} height={640} style={{position: 'absolute', left: 560, top: 50, overflow: 'visible', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.75))'}}>
        <defs>
          <radialGradient id="coin-body" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#5A2A2C" />
            <stop offset="1" stopColor="#1C0708" />
          </radialGradient>
          <linearGradient id="coin-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF3D6" />
            <stop offset="0.35" stopColor="#FFD27F" />
            <stop offset="0.7" stopColor="#F0B54E" />
            <stop offset="1" stopColor="#A8701E" />
          </linearGradient>
        </defs>
        {/* le reste de la pièce (les coûts), sombre */}
        <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 1 1 ${x0} ${y0} Z`} fill="url(#coin-body)" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
        <circle cx={cx} cy={cy} r={R - 26} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={3} strokeDasharray="4 10" />
        <text x={cx - 80} y={cy + 130} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontFamily={FONT.title} fontWeight={900} fontSize={150}>$1</text>
        {/* la part du profit, détachée */}
        <g transform={`translate(${dx} ${dy})`} style={{filter: 'drop-shadow(0 0 40px rgba(240,181,78,0.75))'}}>
          <path d={`M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} Z`} fill="url(#coin-gold)" stroke="#FFF3D6" strokeWidth={4} />
        </g>
      </svg>
      {logo ? <div style={{position: 'absolute', left: 64, top: 64}}><WhiteLogo file={logo} height={84} width={84 * logoRatio} /></div> : null}
      <Words text={words} size={116} style={{position: 'absolute', left: 60, top: 190, width: 520}} />
      <div style={{position: 'absolute', left: 64, bottom: 52}}>
        <Num text={number} size={128} />
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper, marginTop: 2}}>{numberLabel}</div> : null}
      </div>
    </Night>
  );
};

// C : le rideau. Deux pans de velours rouge s'ouvrent sur un chiffre géant en or.
const Curtain: React.FC<{side: 'left' | 'right'}> = ({side}) => (
  <div
    style={{
      position: 'absolute',
      top: -20,
      bottom: -20,
      [side]: -40,
      width: 470,
      background: `repeating-linear-gradient(90deg, #5E0409 0px, #A10A14 26px, #D3141F 40px, #8A0610 58px, #4A0307 80px)`,
      borderRadius: side === 'left' ? '0 0 260px 0' : '0 0 0 260px',
      boxShadow: side === 'left' ? 'inset -30px 0 60px rgba(0,0,0,0.6), 20px 0 60px rgba(0,0,0,0.7)' : 'inset 30px 0 60px rgba(0,0,0,0.6), -20px 0 60px rgba(0,0,0,0.7)',
      transform: side === 'left' ? 'skewX(4deg)' : 'skewX(-4deg)',
    }}
  />
);
const Rideau: React.FC<ThumbTeardownProps> = ({words = 'How Netflix *really* earns', number = '34.6%', numberLabel = 'operating margin', logo, logoRatio = 3.7}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${AMB.night} 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 340, top: 80, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,231,176,0.30) 0%, transparent 62%)'}} />
    <Curtain side="left" />
    <Curtain side="right" />
    <div style={{position: 'absolute', left: 0, right: 0, top: -10, height: 70, background: 'linear-gradient(180deg, #3A0206, #8E0812)', boxShadow: '0 12px 30px rgba(0,0,0,0.7)'}} />
    {logo ? <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center'}}><WhiteLogo file={logo} height={70} width={70 * logoRatio} /></div> : null}
    <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Num text={number} size={190} />
      {numberLabel ? <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: C.paper, marginTop: 8}}>{numberLabel.toUpperCase()}</div> : null}
    </div>
    <Words text={words} size={86} style={{position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center'}} />
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// D : le cadenas. Un champ de mot de passe en verre, un cadenas doré qui le scelle, une étiquette de prix.
const Cadenas: React.FC<ThumbTeardownProps> = ({words = 'Sharing *ended*. Profit soared', number, numberLabel, logo, logoRatio = 3.7, label = '+$7.99'}) => (
  <Night glow="70% 50%">
    <Halo x={880} y={380} r={420} />
    <div style={{position: 'absolute', left: 560, top: 300, width: 640, height: 130, borderRadius: 26, background: 'linear-gradient(140deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))', border: '2.5px solid rgba(255,255,255,0.22)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 22}}>
      {Array.from({length: 8}, (_, i) => (
        <div key={i} style={{width: 40, height: 40, borderRadius: '50%', background: C.paper, boxShadow: '0 0 14px rgba(255,255,255,0.4)'}} />
      ))}
    </div>
    <div style={{position: 'absolute', left: 570, top: 250, fontFamily: FONT.mono, fontSize: 24, letterSpacing: 6, color: C.mute}}>PASSWORD</div>
    {/* cadenas */}
    <div style={{position: 'absolute', left: 990, top: 150, width: 230, height: 300, filter: 'drop-shadow(0 0 50px rgba(240,181,78,0.6)) drop-shadow(0 30px 40px rgba(0,0,0,0.7))'}}>
      <div style={{position: 'absolute', left: 40, top: 0, width: 150, height: 170, borderRadius: '75px 75px 0 0', border: '30px solid #D9A040', borderBottom: 'none'}} />
      <div style={{position: 'absolute', left: 0, top: 130, width: 230, height: 170, borderRadius: 28, background: 'linear-gradient(150deg, #FFF3D6 0%, #FFD27F 30%, #F0B54E 60%, #A8701E 100%)'}} />
      <div style={{position: 'absolute', left: 99, top: 185, width: 32, height: 60, borderRadius: 16, background: '#3A1A04'}} />
    </div>
    {/* étiquette de prix */}
    <div style={{position: 'absolute', left: 600, top: 470, padding: '12px 30px', borderRadius: 16, background: RED, transform: 'rotate(-6deg)', fontFamily: FONT.mono, fontWeight: 600, fontSize: 64, color: '#FFF4EE', boxShadow: '0 0 40px rgba(229,9,20,0.6)'}}>
      {label}
      <span style={{fontSize: 28, marginLeft: 10}}>/MONTH</span>
    </div>
    {logo ? <div style={{position: 'absolute', left: 64, top: 64}}><WhiteLogo file={logo} height={84} width={84 * logoRatio} /></div> : null}
    <Words text={words} size={108} style={{position: 'absolute', left: 60, top: 190, width: 520}} />
    {number ? (
      <div style={{position: 'absolute', left: 64, bottom: 52}}>
        <Num text={number} size={110} />
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 32, color: C.paper}}>{numberLabel}</div> : null}
      </div>
    ) : null}
  </Night>
);

export const ThumbnailVariantTeardown: React.FC<ThumbTeardownProps> = (p) => {
  if (p.variant === 'lecteur') return <Lecteur {...p} />;
  if (p.variant === 'piece') return <Piece {...p} />;
  if (p.variant === 'rideau') return <Rideau {...p} />;
  return <Cadenas {...p} />;
};
