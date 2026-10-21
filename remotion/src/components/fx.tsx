import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {AMB, C, FONT, GOLD_TEXT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Ambiance permanente : lumières, sol en perspective, particules, grain, vignette ----------

const PARTICLES = Array.from({length: 70}, (_, i) => ({
  x: random(`px${i}`),
  y: random(`py${i}`),
  z: random(`pz${i}`), // profondeur : 0 loin, 1 près
  phase: random(`pp${i}`) * Math.PI * 2,
}));

export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const orb = (x: number, y: number, size: number, color: string) => (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${C.navy} 0%, ${C.ink} 75%)`, overflow: 'hidden'}}>
      {orb(width * (0.22 + 0.07 * Math.sin(t / 9)), height * (0.28 + 0.06 * Math.cos(t / 11)), 1400, 'rgba(240,181,78,0.10)')}
      {orb(width * (0.8 + 0.05 * Math.cos(t / 13)), height * (0.75 + 0.05 * Math.sin(t / 10)), 1500, AMB.orbTeal)}
      {orb(width * 0.55, height * (1.05 + 0.03 * Math.sin(t / 7)), 1800, AMB.orbCool)}
      <Floor />
      {/* Poussière en suspension, parallaxe selon la profondeur */}
      {PARTICLES.map((p, i) => {
        const speed = 6 + p.z * 22;
        const y = ((p.y * (height + 200) - t * speed) % (height + 200) + height + 200) % (height + 200) - 100;
        const x = p.x * width + Math.sin(t / 3 + p.phase) * (10 + p.z * 25);
        const size = 1.5 + p.z * 4;
        const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + p.z) + p.phase);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: p.z > 0.75 ? C.goldLight : AMB.particle,
              opacity: (0.12 + 0.4 * p.z) * (0.5 + 0.5 * tw),
              filter: p.z > 0.85 ? 'blur(2px)' : undefined,
              boxShadow: p.z > 0.6 ? `0 0 ${6 + p.z * 10}px rgba(255,220,150,0.6)` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Sol quadrillé en perspective (dessiné à la main : point de fuite au centre, lignes qui avancent).
const Floor: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const y0 = height * 0.64; // horizon
  const depth = height - y0;
  const cx = width / 2;
  const phase = ((frame / fps) * 0.25) % 1;
  const rows = Array.from({length: 18}, (_, i) => i + 1 - phase).filter((z) => z > 0.35);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="floorFade" x1="0" y1={y0} x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0B54E" stopOpacity={0} />
          <stop offset="35%" stopColor="#F0B54E" stopOpacity={0.10} />
          <stop offset="100%" stopColor="#F0B54E" stopOpacity={0.22} />
        </linearGradient>
      </defs>
      <g stroke="url(#floorFade)" strokeWidth={1.5}>
        {Array.from({length: 41}, (_, k) => k - 20).map((k) => (
          <line key={`v${k}`} x1={cx + k * 26} y1={y0} x2={cx + k * 340} y2={height + 40} />
        ))}
        {rows.map((z) => {
          const y = y0 + depth / z;
          return y < height + 10 ? <line key={`h${z}`} x1={0} x2={width} y1={y} y2={y} /> : null;
        })}
      </g>
    </svg>
  );
};

// Couche finale : vignette + grain de film (au-dessus de tout).
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Caméra : léger travelling continu pour qu'aucun plan ne soit figé ----------

export const Camera: React.FC<{duration: number; index: number; children: React.ReactNode}> = ({duration, index, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = Math.min(1, frame / Math.max(1, duration));
  const dir = index % 2 ? 1 : -1;
  const n = (k: number) => noise2D(`cam${index}`, frame / (fps * 6), k);
  const scale = 1 + 0.05 * p;
  const rotY = dir * interpolate(p, [0, 1], [1.6, -1.6]) + n(1) * 0.4;
  const rotX = interpolate(p, [0, 1], [1.0, -0.6]) + n(2) * 0.3;
  const tx = dir * interpolate(p, [0, 1], [-18, 18]);
  return (
    <AbsoluteFill style={{perspective: 2200}}>
      <AbsoluteFill style={{transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateX(${tx}px)`, transformStyle: 'preserve-3d'}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Entrée et sortie d'un plan : fondu avec flou et zoom (les plans se chevauchent de `overlap` images).
export const SceneShell: React.FC<{duration: number; overlap: number; first?: boolean; children: React.ReactNode}> = ({
  duration,
  overlap,
  first,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = first ? 1 : spring({frame, fps, config: {damping: 200}, durationInFrames: 22});
  const exit = interpolate(frame, [duration - overlap, duration], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const blur = (1 - enter) * 16 + exit * 18;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enter, 1 - exit),
        transform: `scale(${interpolate(enter, [0, 1], [0.95, 1]) + exit * 0.07})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Balayage lumineux diagonal au début d'un plan.
export const LightSweep: React.FC<{delay?: number; strength?: number}> = ({delay = 0, strength = 0.22}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [delay * fps, delay * fps + 26], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          bottom: '-50%',
          width: 520,
          left: `${interpolate(p, [0, 1], [-30, 130])}%`,
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, transparent, rgba(255,226,160,${strength}), transparent)`,
          filter: 'blur(30px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Texte ----------

// Texte doré avec reflet métallique qui passe toutes les quelques secondes.
export const gold = (frame: number, fps: number, offset = 0): React.CSSProperties => {
  const cycle = 5.5 * fps;
  const k = ((frame + offset) % cycle) / cycle;
  return {
    backgroundImage: GOLD_TEXT,
    backgroundSize: '300% 100%',
    backgroundPosition: `${interpolate(k, [0, 0.35, 1], [100, 0, 0])}% 0`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };
};

export const GoldText: React.FC<{children: React.ReactNode; style?: React.CSSProperties; offset?: number}> = ({children, style, offset = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <span style={{...gold(frame, fps, offset), ...style}}>{children}</span>;
};

// Mots qui apparaissent un à un (montée + flou), les mots entre *astérisques* en or.
export const RevealWords: React.FC<{text: string; delay?: number; stagger?: number; style?: React.CSSProperties; accent?: 'gold' | string}> = ({
  text,
  delay = 0,
  stagger = 0.07,
  style,
  accent = 'gold',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words: {w: string; hi: boolean; tail?: string}[] = [];
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    const hi = part.startsWith('*') && part.endsWith('*');
    const body = hi ? part.slice(1, -1) : part;
    body.split(/\s+/).filter(Boolean).forEach((w, k) => {
      // Ponctuation isolée (« carmakers*. ») : collée au mot précédent.
      if (/^[.,;:!?)]+$/.test(w) && words.length && k === 0 && !/^\s/.test(body)) words[words.length - 1].tail = w;
      else words.push({w, hi});
    });
  });
  return (
    <span style={style}>
      {words.map(({w, hi, tail}, i) => {
        const p = spring({frame: frame - (delay + i * stagger) * fps, fps, config: {damping: 18, mass: 0.7, stiffness: 120}});
        const q = Math.min(1, Math.max(0, p));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.24em',
              opacity: q,
              transform: `translateY(${(1 - p) * 0.45}em)`,
              filter: q < 0.98 ? `blur(${(1 - q) * 10}px)` : undefined,
              ...(hi ? (accent === 'gold' ? gold(frame, fps, i * 4) : {color: accent}) : null),
              ...(hi && accent === 'gold' ? {filter: `drop-shadow(0 0 24px rgba(240,181,78,0.35))${q < 0.98 ? ` blur(${(1 - q) * 10}px)` : ''}`} : null),
            }}
          >
            {w}
            {tail ? <span style={{color: C.paper, WebkitTextFillColor: C.paper}}>{tail}</span> : null}
          </span>
        );
      })}
    </span>
  );
};

// Compteur à rouleaux : chaque chiffre défile jusqu'à sa valeur (de droite à gauche).
export const Odometer: React.FC<{text: string; delay?: number; style?: React.CSSProperties; spins?: number}> = ({text, delay = 0, style, spins = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chars = text.split('');
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let d = 0;
  return (
    <span style={{display: 'inline-flex', lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...style}}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          const p = spring({frame: frame - delay * fps, fps, config: {damping: 200}});
          return (
            <span key={i} style={{display: 'inline-block', opacity: p, whiteSpace: 'pre'}}>
              {c}
            </span>
          );
        }
        const order = digitCount - 1 - d++;
        const p = spring({frame: frame - (delay + order * 0.06) * fps, fps, config: {damping: 26, mass: 1.1, stiffness: 70}});
        const target = Number(c) + 10 * spins;
        const pos = p * target;
        return (
          <span key={i} style={{display: 'inline-block', height: '1em', overflow: 'hidden', position: 'relative'}}>
            <span style={{display: 'block', visibility: 'hidden'}}>0</span>
            <span style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${-pos}em)`}}>
              {Array.from({length: 10 * (spins + 1)}, (_, k) => (
                <span key={k} style={{display: 'block', height: '1em'}}>
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// Petit libellé technique : trait doré qui se dessine + texte en capitales espacées.
export const Kicker: React.FC<{text: string; delay?: number; color?: string}> = ({text, delay = 0, color = C.gold}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const line = interpolate(frame, [delay * fps, delay * fps + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const p = spring({frame: frame - (delay + 0.2) * fps, fps, config: {damping: 200}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <div style={{width: 70 * line, height: 3, background: color, boxShadow: `0 0 14px ${color}`}} />
      <div style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: 7, color, opacity: p, transform: `translateX(${(1 - p) * -20}px)`}}>{text.toUpperCase()}</div>
    </div>
  );
};

// Cercle technique en pointillés qui tourne (décor derrière un chiffre).
export const TechRing: React.FC<{size: number; delay?: number; color?: string}> = ({size, delay = 0, color = C.gold}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay * fps, fps, config: {damping: 200}});
  const r = size / 2 - 4;
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: '50%', top: '50%', marginLeft: -size / 2, marginTop: -size / 2, opacity: 0.55 * p, transform: `scale(${0.8 + 0.2 * p})`}}>
      <g transform={`rotate(${frame * 0.25} ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="2 14" />
      </g>
      <g transform={`rotate(${-frame * 0.4} ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r - 24} fill="none" stroke={color} strokeOpacity={0.6} strokeWidth={2} pathLength={100} strokeDasharray={`${18 * p} 82`} />
        <circle cx={size / 2} cy={size / 2} r={r - 24} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={1} />
      </g>
    </svg>
  );
};
