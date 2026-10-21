import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Big, Brand, GoldT, Halo, Photo, Rival, Vignette, WhiteLogo, Words, gold} from './ThumbnailVariants';

// Compositions de miniature supplémentaires (1280 x 720), même charte que ThumbnailVariants (fond sombre teinté,
// or, verre, lumière) mais des mises en page différentes, pour que les vidéos ne se ressemblent pas toutes.
// Tous les contenus viennent de thumbnail.json : elles servent à n'importe quelle vidéo.
//   portrait    : vraie photo d'une personne à droite (photo, photoPosition), grande question à gauche (words).
//   puce        : objet héros fissuré au centre (photo, détouré sur fond noir), logos autour (rivals + label), words.
//   face-a-face : logo principal doré (logo, logoRatio) contre les logos rivaux en blanc, fracture lumineuse.
//   anneau      : grand chiffre or (number) dans un anneau lumineux rempli à `ring` (0 à 1), numberLabel dessous, words.
export const PLUS_VARIANTS = ['portrait', 'puce', 'face-a-face', 'anneau'] as const;
export type PlusVariant = (typeof PLUS_VARIANTS)[number];
export const isPlusVariant = (v?: string): v is PlusVariant => (PLUS_VARIANTS as readonly string[]).includes(v ?? '');

export type ThumbPlusProps = {
  variant: PlusVariant;
  words?: string; // *mot* en or
  number?: string;
  numberLabel?: string;
  logo?: string;
  logoRatio?: number;
  rivals?: Rival[];
  photo?: string;
  photoPosition?: string;
  ring?: number;
};

const GOLD_NUM = '#FFD98A';

// Fond commun : nuit teintée, lueur à l'endroit donné.
const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// Fracture : ligne brisée déterministe de a vers b.
type Pt = [number, number];
const crackPoints = (a: Pt, b: Pt, n: number, amp: number, seed: number): Pt[] => {
  const pts: Pt[] = [a];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const r = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const off = ((r - Math.floor(r)) * 2 - 1) * amp * (i % 2 ? 1 : -0.7);
    pts.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
  }
  pts.push(b);
  return pts;
};
// fissure : cœur sombre bordé de lumière (objet cassé) ; sinon éclair lumineux.
const Crack: React.FC<{pts: Pt[]; width?: number; branches?: Pt[][]; fissure?: boolean}> = ({pts, width = 6, branches = [], fissure}) => {
  const d = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  return (
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="crackGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      {[pts, ...branches].map((p, i) => {
        const w = i ? width * 0.55 : width;
        return (
          <g key={i} fill="none" strokeLinejoin="miter" strokeLinecap="round">
            <path d={d(p)} stroke="rgba(240,181,78,0.9)" strokeWidth={w * 5} filter="url(#crackGlow)" />
            <path d={d(p)} stroke={fissure ? '#FFF1C9' : '#FFD98A'} strokeWidth={w * (fissure ? 1.9 : 1.6)} />
            <path d={d(p)} stroke={fissure ? '#140C02' : '#FFFBEF'} strokeWidth={w * (fissure ? 0.75 : 0.6)} />
          </g>
        );
      })}
    </svg>
  );
};

// Tuile de verre avec un logo blanc.
const Tile: React.FC<{r: Rival; x: number; y: number; w: number; h: number; logoH?: number}> = ({r, x, y, w, h, logoH}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: h * 0.2,
      background: 'linear-gradient(160deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04))',
      border: '1.5px solid rgba(255,255,255,0.22)',
      boxShadow: '0 18px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
      backdropFilter: 'blur(6px)',
    }}
  >
    <WhiteLogo file={r.file} height={logoH ?? (r.wide ? h * 0.36 : h * 0.6)} width={w * 0.8} color={r.color} />
  </div>
);

// A : vraie photo d'une personne (étalonnage seul, visage non retouché), la question en grand à gauche.
const Portrait: React.FC<ThumbPlusProps> = ({words = 'Who beats *Nvidia*?', photo = 'jensen_stage.jpg', photoPosition = '60% 35%', number, numberLabel}) => (
  <Night glow="75% 40%">
    <div style={{position: 'absolute', left: 420, top: 0, width: 860, height: 720, overflow: 'hidden'}}>
      <Photo file={photo} position={photoPosition} style={{filter: 'saturate(0.85) contrast(1.12) brightness(0.85)', transform: 'scale(1.22)', transformOrigin: photoPosition}} />
      {/* étalonnage : voile coloré de la teinte et assombrissement du décor autour du sujet */}
      <AbsoluteFill style={{background: AMB.photoGrade, mixBlendMode: 'color'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 36% 58% at 55% 50%, transparent 22%, rgba(${AMB.inkRgb},0.95) 100%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},1) 0%, rgba(${AMB.inkRgb},0.75) 16%, transparent 42%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(${AMB.inkRgb},0.85) 0%, transparent 30%, transparent 62%, rgba(${AMB.inkRgb},0.6) 100%)`}} />
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 520, height: 720, background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.55), transparent)`}} />
    <Words text={words} size={150} style={{position: 'absolute', left: 64, top: number ? 70 : 96, width: 560, lineHeight: 0.9}} />
    {number ? (
      <div style={{position: 'absolute', left: 64, bottom: 58, display: 'flex', alignItems: 'baseline', gap: 16}}>
        <Big text={number} size={88} style={{position: 'relative'}} />
        {numberLabel ? <Words text={numberLabel} size={60} /> : null}
      </div>
    ) : null}
  </Night>
);

// B : l'objet héros (une puce) fissuré, entouré des logos de ceux qui fabriquent la leur.
const Puce: React.FC<ThumbPlusProps> = ({words = 'Its own *customers*', photo = 'gpu_die.jpg', rivals = []}) => {
  const cx = 850;
  const cy = 372;
  const spots: Pt[] = [
    [605, 118],
    [1095, 118],
    [605, 618],
    [1095, 618],
  ];
  return (
    <Night glow="66% 50%">
      <Halo x={cx} y={cy} r={360} />
      {/* puce dorée (photo étalonnée en or ; le fond noir de la photo se fond dans le décor) */}
      <Img
        src={staticFile(`media/${photo}`)}
        style={{
          position: 'absolute',
          left: cx - 400,
          top: cy - 271,
          width: 800,
          height: 542,
          objectFit: 'cover',
          mixBlendMode: 'screen',
          filter: 'grayscale(1) sepia(1) saturate(2.2) hue-rotate(-4deg) brightness(1.05) contrast(1.25)',
        }}
      />
      <Crack
        pts={crackPoints([cx - 90, cy - 150], [cx + 70, cy + 168], 9, 26, 3)}
        branches={[crackPoints([cx - 28, cy - 30], [cx + 150, cy - 64], 4, 12, 7), crackPoints([cx + 30, cy + 80], [cx - 140, cy + 118], 4, 12, 11)]}
        width={6}
        fissure
      />
      {rivals.slice(0, 4).map((r, i) => (
        <React.Fragment key={i}>
          <Tile r={r} x={spots[i][0]} y={spots[i][1]} w={214} h={104} />
          {r.label ? (
            <div style={{position: 'absolute', left: spots[i][0] - 120, width: 240, top: spots[i][1] + (i < 2 ? 62 : -96), textAlign: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: GOLD_NUM, textShadow: '0 0 14px rgba(240,181,78,0.6), 0 2px 8px #000'}}>
              {r.label.toUpperCase()}
            </div>
          ) : null}
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: 0, top: 0, width: 560, height: 720, background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.9) 30%, transparent)`}} />
      <Words text={words} size={138} style={{position: 'absolute', left: 60, top: 150, width: 470, lineHeight: 0.9}} />
    </Night>
  );
};

// C : face-à-face, le logo principal doré contre les logos rivaux, séparés par une fracture de lumière.
const FaceAFace: React.FC<ThumbPlusProps> = ({logo = 'logo_nvidia_word.svg', logoRatio = 5.33, rivals = [], words}) => {
  const w = 500;
  const h = w / logoRatio;
  const lx = 300;
  const ly = words ? 400 : 360;
  const shown = rivals.slice(0, 4);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {/* deux camps : lueur verte à gauche, froide et neutre à droite */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 80% at 22% 50%, ${AMB.night} 0%, transparent 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 75% at 82% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)'}} />
      <Halo x={lx} y={ly} r={300} />
      <div style={{position: 'absolute', left: lx - w / 2, top: ly - h / 2}}>
        <GoldT size={h} ratio={logoRatio} glow={0.85} file={logo} />
      </div>
      {words ? <Words text={words} size={86} style={{position: 'absolute', left: 50, width: 500, top: 92, textAlign: 'center'}} /> : null}
      {shown.map((r, i) => {
        const x = i % 2 ? 1110 : 860;
        const y = shown.length > 2 ? (i < 2 ? 262 : 470) : 366;
        return <Tile key={i} r={r} x={x} y={y} w={212} h={150} logoH={r.wide ? 46 : 88} />;
      })}
      <Crack pts={crackPoints([640, -20], [640, 740], 11, 38, 5)} branches={[crackPoints([652, 300], [720, 230], 3, 10, 9), crackPoints([630, 470], [560, 540], 3, 10, 13)]} width={6} />
      <div
        style={{
          position: 'absolute',
          left: 640 - 66,
          top: 366 - 66,
          width: 132,
          height: 132,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 35% 30%, ${AMB.night}, ${C.ink})`,
          border: '2px solid rgba(255,217,138,0.7)',
          boxShadow: '0 0 50px rgba(240,181,78,0.55), inset 0 2px 0 rgba(255,255,255,0.2)',
        }}
      >
        <span style={{...gold, fontFamily: FONT.display, fontStyle: 'italic', fontSize: 84, lineHeight: 1, marginTop: -8, filter: 'none'}}>vs</span>
      </div>
      <Brand />
      <Vignette />
    </AbsoluteFill>
  );
};

// D : un grand chiffre or dans un anneau lumineux, sobre.
const Anneau: React.FC<ThumbPlusProps> = ({number = '75%', numberLabel = 'gross margin', ring = 0.75, words = 'Too *profitable*?', logo, logoRatio = 1}) => {
  const cx = 905;
  const cy = 372;
  const R = 248;
  const sw = 40;
  const k = Math.max(0, Math.min(1, ring));
  const circ = 2 * Math.PI * R;
  const lh = logo ? Math.round(150 / Math.sqrt(logoRatio)) * 0.5 : 0;
  return (
    <Night glow="70% 50%">
      <Halo x={cx} y={cy} r={340} />
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF4D6" />
            <stop offset="0.35" stopColor="#FFD27F" />
            <stop offset="0.75" stopColor="#F0B54E" />
            <stop offset="1" stopColor="#A8701E" />
          </linearGradient>
          <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        {/* piste en verre */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={R + sw / 2} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={R - sw / 2} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(240,181,78,0.75)" strokeWidth={sw} strokeDasharray={`${circ * k} ${circ}`} filter="url(#ringGlow)" />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#ringGold)" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${circ * k} ${circ}`} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: cx - 260, width: 520, top: cy - 100, textAlign: 'center'}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 168, lineHeight: 1, letterSpacing: -8, color: GOLD_NUM, textShadow: '0 0 44px rgba(240,181,78,0.6)'}}>{number}</div>
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 30, letterSpacing: 5, color: C.paper, marginTop: 10, opacity: 0.9}}>{numberLabel.toUpperCase()}</div> : null}
      </div>
      {logo ? (
        <div style={{position: 'absolute', left: 64, top: 110, opacity: 0.95}}>
          <WhiteLogo file={logo} height={lh} width={lh * logoRatio} />
        </div>
      ) : null}
      <Words text={words} size={140} style={{position: 'absolute', left: 60, top: logo ? 190 : 140, width: 520, lineHeight: 0.9}} />
    </Night>
  );
};

export const ThumbnailVariantPlus: React.FC<ThumbPlusProps> = (p) => {
  switch (p.variant) {
    case 'portrait':
      return <Portrait {...p} />;
    case 'puce':
      return <Puce {...p} />;
    case 'face-a-face':
      return <FaceAFace {...p} />;
    default:
      return <Anneau {...p} />;
  }
};
