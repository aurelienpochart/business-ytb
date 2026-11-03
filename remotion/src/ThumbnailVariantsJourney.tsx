import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {AMB, C, FONT, GOLD_TEXT} from './theme';
import {Brand, Halo, Photo, Vignette, WhiteLogo, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour une vidéo « Journey » (on suit un produit, un passager).
// Même charte (nuit teintée, or, verre, lumière) ; tout vient de thumbnail.json, elles servent à n'importe quelle vidéo.
//   embarquement : une carte d'embarquement en verre et or, inclinée, prix d'appel géant (number), words à gauche.
//   iceberg      : photo en haut, ligne de flottaison ; au-dessus le petit prix (number), dessous la masse dorée
//                  cachée (number2, label2) ; words en haut à gauche.
//   trajet       : une route en pointillé d'un point de départ (number) à une arrivée (number2) avec un avion, photo en fond.
//   hublot       : un hublot d'avion (photo dedans), une étiquette de prix suspendue devant, words à droite.
export const JOURNEY_VARIANTS = ['embarquement', 'iceberg', 'trajet', 'hublot'] as const;
export type JourneyVariant = (typeof JOURNEY_VARIANTS)[number];
export const isJourneyVariant = (v?: string): v is JourneyVariant => (JOURNEY_VARIANTS as readonly string[]).includes(v ?? '');

export type ThumbJourneyProps = {
  variant: JourneyVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  number2?: string;
  label2?: string;
  logo?: string;
  logoRatio?: number;
  photo?: string;
  photoPosition?: string;
  from?: string; // libellé du départ (trajet, embarquement)
  to?: string; // libellé de l'arrivée
};

const GOLD_NUM = '#FFD98A';
const goldFill: React.CSSProperties = {
  backgroundImage: GOLD_TEXT,
  backgroundSize: '200% 100%',
  backgroundPosition: '30% 0',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

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

const PlaneIcon: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = '#FFE7B0', style}) => (
  // Pictogramme d'avion (dessin de la chaîne, pas un logo), vu de dessus, nez vers la droite.
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path
      d="M96 50c0-3-3-5-7-5H62L40 10h-9l11 35H22l-8-10H7l5 15-5 15h7l8-10h20L31 90h9l22-35h27c4 0 7-2 7-5z"
      fill={color}
      style={{filter: `drop-shadow(0 0 ${size / 6}px rgba(255,231,176,0.85))`}}
    />
  </svg>
);

// A : la carte d'embarquement. Grand billet de verre sombre, liseré or, talon détaché ; le prix en or.
const Embarquement: React.FC<ThumbJourneyProps> = ({words = 'The ticket is *bait*', number = '€14.99', numberLabel, logo, logoRatio = 8, photo, photoPosition, from = 'SEARCH', to = 'PROFIT'}) => (
  <Night glow="72% 45%">
    {photo ? <Photo file={photo} position={photoPosition} style={{opacity: 0.32, filter: 'blur(2px) saturate(0.8)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.92) 0%, rgba(${AMB.inkRgb},0.55) 45%, rgba(${AMB.inkRgb},0.2) 100%)`}} />
    <Halo x={880} y={380} r={430} />
    <div style={{position: 'absolute', left: 520, top: 150, width: 720, height: 400, transform: 'rotate(-9deg)', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(240,181,78,0.25))'}}>
      {/* corps du billet */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 520, height: 400, borderRadius: '28px 0 0 28px', background: 'linear-gradient(135deg, rgba(30,52,110,0.95) 0%, rgba(8,18,46,0.97) 70%)', border: '2px solid rgba(255,215,140,0.65)', borderRight: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 74, background: 'linear-gradient(90deg, #A8701E, #FFD27F 45%, #F0B54E)'}} />
        <div style={{position: 'absolute', left: 34, top: 18, fontFamily: FONT.mono, fontWeight: 600, fontSize: 30, letterSpacing: 8, color: '#1B1405'}}>BOARDING PASS</div>
        {logo ? <div style={{position: 'absolute', left: 34, top: 104}}><WhiteLogo file={logo} height={40} width={40 * logoRatio} /></div> : null}
        <div style={{position: 'absolute', left: 34, top: 170, display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, color: C.paper, letterSpacing: 2}}>
          {from}
          <PlaneIcon size={44} />
          {to}
        </div>
        <div style={{position: 'absolute', left: 34, top: 240, fontFamily: FONT.mono, fontSize: 20, letterSpacing: 5, color: C.mute}}>FARE</div>
        <Num text={number} size={118} style={{position: 'absolute', left: 30, top: 262}} />
      </div>
      {/* pointillés de découpe + talon */}
      <div style={{position: 'absolute', left: 520, top: 0, width: 0, height: 400, borderLeft: '4px dashed rgba(255,215,140,0.75)'}} />
      <div style={{position: 'absolute', left: 540, top: 26, width: 190, height: 400, transform: 'rotate(7deg)', transformOrigin: '0% 0%', borderRadius: '0 28px 28px 0', background: 'linear-gradient(135deg, rgba(30,52,110,0.9), rgba(8,18,46,0.95))', border: '2px solid rgba(255,215,140,0.5)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 74, background: 'linear-gradient(90deg, #A8701E, #FFD27F)'}} />
        <div style={{position: 'absolute', left: 22, top: 100, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.mute}}>+ BAG</div>
        <div style={{position: 'absolute', left: 22, top: 140, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.mute}}>+ SEAT</div>
        <div style={{position: 'absolute', left: 22, top: 180, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.mute}}>+ PRIORITY</div>
        <div style={{position: 'absolute', left: 22, top: 250, fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, ...goldFill}}>+€€€</div>
      </div>
    </div>
    <Words text={words} size={128} style={{position: 'absolute', left: 60, top: 70, width: 560}} />
    {numberLabel ? <div style={{position: 'absolute', left: 64, bottom: 70, width: 470, fontFamily: FONT.title, fontWeight: 800, fontSize: 36, lineHeight: 1.15, color: C.paper, textShadow: '0 4px 20px rgba(0,0,0,0.8)'}}>{numberLabel}</div> : null}
  </Night>
);

// B : l'iceberg. Au-dessus de la ligne de flottaison, la photo et le petit prix ; dessous, la masse dorée.
const Iceberg: React.FC<ThumbJourneyProps> = ({words = 'What’s *under* the price?', number = '€14.99', numberLabel = 'the ticket', number2 = '€2.15B', label2 = 'profit in six months', photo, photoPosition = '50% 50%', logo, logoRatio = 8}) => {
  const W = 330; // ligne de flottaison
  return (
    <Night glow="60% 80%">
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: W, overflow: 'hidden'}}>
        {photo ? <Photo file={photo} position={photoPosition} style={{opacity: 0.85}} /> : null}
        <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(${AMB.inkRgb},0.35) 0%, rgba(${AMB.inkRgb},0.15) 60%, rgba(${AMB.inkRgb},0.6) 100%)`}} />
      </div>
      {/* masse cachée : un grand triangle d'or sous l'eau */}
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="ice-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE7B0" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#F0B54E" stopOpacity="0.85" />
            <stop offset="1" stopColor="#7A4E12" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="ice-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={AMB.night} stopOpacity="0.55" />
            <stop offset="1" stopColor={C.ink} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect x={0} y={W} width={1280} height={720 - W} fill="url(#ice-water)" />
        <polygon points={`820,${W - 70} 905,${W} 1180,${W + 330} 600,${W + 360} 735,${W}`} fill="url(#ice-gold)" style={{filter: 'drop-shadow(0 0 50px rgba(240,181,78,0.55))'}} />
        <polygon points={`820,${W - 70} 905,${W} 735,${W}`} fill="#FFF3D6" />
        <line x1={0} x2={1280} y1={W} y2={W} stroke="rgba(255,255,255,0.75)" strokeWidth={3} strokeDasharray="14 10" />
      </svg>
      {/* le petit prix, au sommet */}
      <div style={{position: 'absolute', left: 820, top: W - 178, transform: 'translateX(-50%)', textAlign: 'center', padding: '8px 22px 10px', borderRadius: 16, background: `rgba(${AMB.inkRgb},0.72)`, border: '1.5px solid rgba(255,255,255,0.25)'}}>
        <Num text={number} size={74} color="#FFFFFF" glow="rgba(255,255,255,0.45)" />
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 24, color: C.paper, textShadow: '0 3px 12px rgba(0,0,0,0.9)'}}>{numberLabel}</div>
      </div>
      {/* la masse */}
      <div style={{position: 'absolute', left: 890, top: W + 150, transform: 'translateX(-50%)', textAlign: 'center'}}>
        <Num text={number2} size={104} color="#1B1405" glow="rgba(255,231,176,0.0)" />
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 28, color: '#1B1405'}}>{label2}</div>
      </div>
      <Words text={words} size={112} style={{position: 'absolute', left: 56, top: W + 40, width: 560}} />
      {logo ? <div style={{position: 'absolute', left: 60, top: 48}}><WhiteLogo file={logo} height={50} width={50 * logoRatio} /></div> : null}
    </Night>
  );
};

// C : le trajet. Route en arc pointillé du prix d'appel à l'arrivée, avion doré en route, photo en fond.
const Trajet: React.FC<ThumbJourneyProps> = ({words = 'Follow the *€15*', number = '€14.99', numberLabel = 'ticket', number2 = '€2.15B', label2 = 'profit', photo, photoPosition = '50% 60%', logo, logoRatio = 8}) => {
  const A = {x: 170, y: 560};
  const B = {x: 1090, y: 330};
  const Cp = {x: 560, y: 120};
  const at = (t: number) => ({
    x: (1 - t) ** 2 * A.x + 2 * (1 - t) * t * Cp.x + t * t * B.x,
    y: (1 - t) ** 2 * A.y + 2 * (1 - t) * t * Cp.y + t * t * B.y,
  });
  const P = at(0.62);
  const Q = at(0.66);
  const ang = (Math.atan2(Q.y - P.y, Q.x - P.x) * 180) / Math.PI;
  return (
    <Night glow="75% 40%">
      {photo ? <Photo file={photo} position={photoPosition} style={{opacity: 0.5}} /> : null}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(${AMB.inkRgb},0.25) 0%, rgba(${AMB.inkRgb},0.75) 100%)`}} />
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <path d={`M${A.x},${A.y} Q${Cp.x},${Cp.y} ${B.x},${B.y}`} fill="none" stroke="rgba(255,231,176,0.9)" strokeWidth={7} strokeDasharray="4 18" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px rgba(240,181,78,0.8))'}} />
        {[0.25, 0.45, 0.8].map((t) => {
          const p = at(t);
          return <circle key={t} cx={p.x} cy={p.y} r={11} fill={C.ink} stroke="#FFD27F" strokeWidth={4} />;
        })}
        <circle cx={A.x} cy={A.y} r={22} fill="#FFFFFF" style={{filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.8))'}} />
        <circle cx={B.x} cy={B.y} r={30} fill="#FFD27F" style={{filter: 'drop-shadow(0 0 30px rgba(240,181,78,0.95))'}} />
      </svg>
      <div style={{position: 'absolute', left: P.x - 60, top: P.y - 60, transform: `rotate(${ang}deg)`}}>
        <PlaneIcon size={120} />
      </div>
      <div style={{position: 'absolute', left: A.x - 40, top: A.y + 34}}>
        <Num text={number} size={72} color="#FFFFFF" glow="rgba(255,255,255,0.45)" />
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 28, color: C.paper}}>{numberLabel}</div>
      </div>
      <div style={{position: 'absolute', right: 40, top: B.y + 44, textAlign: 'right'}}>
        <Num text={number2} size={112} />
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 32, color: C.paper}}>{label2}</div>
      </div>
      <Words text={words} size={118} style={{position: 'absolute', left: 60, top: 56, width: 700}} />
      {logo ? <div style={{position: 'absolute', left: 64, top: 200}}><WhiteLogo file={logo} height={46} width={46 * logoRatio} /></div> : null}
    </Night>
  );
};

// D : le hublot. Un hublot d'avion (photo à l'intérieur), une étiquette de prix suspendue devant ; words à droite.
const Hublot: React.FC<ThumbJourneyProps> = ({words = 'Who pays for *the flight*?', number = '€14.99', numberLabel, photo, photoPosition = '50% 50%', logo, logoRatio = 8}) => (
  <Night glow="30% 50%">
    <Halo x={360} y={370} r={420} />
    {/* paroi de cabine */}
    <div style={{position: 'absolute', left: 90, top: 50, width: 540, height: 640, borderRadius: 270, background: 'linear-gradient(145deg, #2A3550 0%, #121A2C 60%, #0A0F1A 100%)', boxShadow: '0 40px 90px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.15)'}} />
    <div style={{position: 'absolute', left: 140, top: 100, width: 440, height: 540, borderRadius: 220, overflow: 'hidden', border: '10px solid #0B1220', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.85), 0 0 0 3px rgba(255,215,140,0.55), 0 0 50px rgba(240,181,78,0.3)'}}>
      {photo ? <Img src={staticFile(`media/${photo}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: photoPosition}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, transparent 35%)'}} />
    </div>
    {/* étiquette de prix suspendue */}
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
      <line x1={470} y1={60} x2={540} y2={330} stroke="#FFD27F" strokeWidth={3} />
    </svg>
    <div style={{position: 'absolute', left: 430, top: 320, transform: 'rotate(12deg)', transformOrigin: '30% 0%', padding: '22px 34px 22px 64px', borderRadius: '18px 26px 26px 18px', background: 'linear-gradient(135deg, #FFE7B0 0%, #F0B54E 55%, #B57A22 100%)', boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 50px rgba(240,181,78,0.5)'}}>
      <div style={{position: 'absolute', left: 22, top: '50%', width: 22, height: 22, marginTop: -11, borderRadius: '50%', background: C.ink}} />
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 100, letterSpacing: -3, color: '#1B1405', lineHeight: 1}}>{number}</div>
    </div>
    <Words text={words} size={124} style={{position: 'absolute', right: 60, top: 120, width: 520, textAlign: 'right'}} />
    {numberLabel ? <div style={{position: 'absolute', right: 64, bottom: 90, width: 480, textAlign: 'right', fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper}}>{numberLabel}</div> : null}
    {logo ? <div style={{position: 'absolute', right: 64, bottom: 40}}><WhiteLogo file={logo} height={40} width={40 * logoRatio} /></div> : null}
  </Night>
);

export const ThumbnailVariantJourney: React.FC<ThumbJourneyProps> = (p) => {
  switch (p.variant) {
    case 'embarquement':
      return <Embarquement {...p} />;
    case 'iceberg':
      return <Iceberg {...p} />;
    case 'trajet':
      return <Trajet {...p} />;
    case 'hublot':
      return <Hublot {...p} />;
  }
};
