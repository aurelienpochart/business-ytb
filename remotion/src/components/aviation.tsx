import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter} from './common';
import {Kicker} from './fx';

// ---------- Blocs « aviation » (vidéo 08 Boeing, gabarit The Timeline) ----------
// - Airframe : un avion de ligne en profil, tracé comme un plan d'ingénieur (grille bleue, cotes). Ses sections
//   s'allument une à une (qui fabrique quoi), des repères pointent un détail (capteur, bouchon de porte), et le
//   moteur peut avancer sous l'aile en laissant son ancienne place en pointillés (737 MAX).
// - Gauge : un instrument de cockpit rond ; l'aiguille passe d'une valeur à l'autre (cadence de production),
//   une graduation rouge marque un plafond, la liste des étapes s'allume à droite.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const unit = (p: number) => Math.min(1, Math.max(0, p));

// Géométrie de l'avion (repère 1600 x 560, nez à droite).
const FUSELAGE =
  'M 260 230 L 1290 230 C 1385 230 1448 262 1474 296 C 1450 332 1390 362 1290 362 L 300 362 C 225 358 150 326 96 292 L 96 274 C 150 252 205 230 260 230 Z';
const FIN = 'M 150 246 L 62 66 L 138 66 L 318 236 Z';
const STAB = 'M 70 286 L 26 304 L 196 304 L 246 288 Z';
const WING = 'M 590 336 L 900 336 L 812 392 L 548 392 Z';
type Zone = 'nose' | 'forward' | 'center' | 'aft' | 'tail' | 'wing' | 'engine';
const ZONE_X: Record<Zone, [number, number]> = {
  nose: [1290, 1480],
  forward: [1000, 1290],
  center: [700, 1000],
  aft: [300, 700],
  tail: [0, 300],
  wing: [540, 905],
  engine: [740, 960],
};
const SPOTS: Record<string, [number, number]> = {
  plug: [520, 292],
  sensor: [1408, 338],
  engine: [860, 418],
  wing: [720, 365],
  cockpit: [1420, 286],
  fin: [150, 120],
  aft: [480, 296],
  forward: [1140, 296],
};

type AirZone = {zone: Zone; label: string; sub?: string; color?: string; at?: number};
type Marker = {at: string; label: string; sub?: string; color?: string; time?: number};

export const Airframe: React.FC<{
  kicker?: string;
  title?: string;
  name?: string; // cote sous l'avion (ex. « Boeing 737 MAX 9 »)
  zones?: AirZone[];
  markers?: Marker[];
  engineShift?: number; // seconde où le moteur avance (737 MAX) ; absent : pas de déplacement
  shiftLabel?: string;
  counter?: {value: string; label: string; at?: number};
  start?: number;
  stagger?: number;
  source?: string;
}> = ({kicker, title, name, zones = [], markers = [], engineShift, shiftLabel = 'Bigger engines, further forward', counter, start = 1.0, stagger = 0.8, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const draw = interpolate(t, [0.1, 1.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const pK = useEnter(0.05);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.6);
  const [gLo, gHi, gHalo] = gradOf('amber');
  const shift = engineShift === undefined ? 0 : interpolate(t, [engineShift, engineShift + 1.4], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const engDx = 74 * shift;
  const engDy = -16 * shift;
  const zoneP = (z: AirZone, i: number) => interpolate(t, [(z.at ?? start + i * stagger), (z.at ?? start + i * stagger) + 0.6], [0, 1], clamp);
  const blue = 'rgba(150,200,255,';
  const SW = 1600;
  const SH = 560;
  const sc = 1.0;
  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: title ? -10 : -40, ...fade(pK)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: title ? 40 : 10, height: 700, ...glass(), borderRadius: 30, overflow: 'hidden', opacity: unit(draw * 3)}}>
        {/* Grille de plan */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${blue}0.07) 1px, transparent 1px), linear-gradient(90deg, ${blue}0.07) 1px, transparent 1px), linear-gradient(${blue}0.035) 1px, transparent 1px), linear-gradient(90deg, ${blue}0.035) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          }}
        />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 55%, rgba(80,140,255,0.10), transparent 65%)'}} />
      </div>
      <svg viewBox={`0 0 ${SW} ${SH}`} style={{position: 'absolute', left: 10, top: title ? 140 : 110, width: SW * sc, height: SH * sc, overflow: 'visible'}}>
        <defs>
          <clipPath id="af-body">
            <path d={FUSELAGE} />
            <path d={FIN} />
            <path d={STAB} />
          </clipPath>
          <linearGradient id="af-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={gHi} stopOpacity="0.95" />
            <stop offset="1" stopColor={gLo} stopOpacity="0.85" />
          </linearGradient>
          <filter id="af-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Corps : remplissage léger */}
        <g opacity={draw}>
          <path d={FUSELAGE} fill="rgba(160,200,255,0.06)" />
          <path d={FIN} fill="rgba(160,200,255,0.05)" />
          <path d={WING} fill="rgba(160,200,255,0.05)" />
        </g>
        {/* Sections allumées */}
        {zones.map((z, i) => {
          const p = zoneP(z, i);
          if (p <= 0) return null;
          const [x0, x1] = ZONE_X[z.zone];
          const col = z.color === 'teal' ? C.teal : z.color === 'brick' ? C.brick : `url(#af-gold)`;
          if (z.zone === 'wing') return <path key={i} d={WING} fill={col} opacity={0.55 * p} filter="url(#af-glow)" />;
          if (z.zone === 'engine') return null;
          return (
            <g key={i} clipPath="url(#af-body)" opacity={0.5 * p}>
              <rect x={x0 + 3} y={40} width={x1 - x0 - 6} height={340} fill={col} filter="url(#af-glow)" />
            </g>
          );
        })}
        {/* Contours (tracés à la main) */}
        {[FUSELAGE, FIN, STAB, WING].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={`${blue}0.85)`} strokeWidth={2.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} strokeLinejoin="round" />
        ))}
        {/* Hublots */}
        <g opacity={unit(draw * 1.4 - 0.4)}>
          {Array.from({length: 36}, (_, k) => (
            <rect key={k} x={340 + k * 26} y={272} width={12} height={17} rx={6} fill={`${blue}0.45)`} />
          ))}
          <path d="M 1392 268 L 1440 272 L 1452 288 L 1400 286 Z" fill={`${blue}0.55)`} />
          {/* Portes */}
          <rect x={1262} y={246} width={30} height={88} rx={8} fill="none" stroke={`${blue}0.5)`} strokeWidth={2} />
          <rect x={318} y={250} width={28} height={84} rx={8} fill="none" stroke={`${blue}0.5)`} strokeWidth={2} />
          {/* Joints de tronçons */}
          {[700, 1000, 1290].map((x) => (
            <line key={x} x1={x} y1={232} x2={x} y2={360} stroke={`${blue}0.25)`} strokeWidth={1.5} strokeDasharray="6 6" />
          ))}
        </g>
        {/* Moteur : place d'origine en pointillés quand il avance */}
        {engineShift !== undefined && shift > 0 ? (
          <g opacity={0.7}>
            <rect x={760} y={392} width={150} height={56} rx={26} fill="none" stroke={`${blue}0.5)`} strokeWidth={2} strokeDasharray="8 7" />
          </g>
        ) : null}
        <g transform={`translate(${engDx} ${engDy})`} opacity={unit(draw * 1.5 - 0.3)}>
          <rect x={760} y={392} width={150} height={56} rx={26} fill={zones.some((z) => z.zone === 'engine') || shift > 0 ? 'url(#af-gold)' : 'rgba(160,200,255,0.10)'} fillOpacity={shift > 0 ? 0.35 + 0.4 * shift : zones.some((z) => z.zone === 'engine') ? 0.6 : 1} stroke={`${blue}0.85)`} strokeWidth={2.4} filter={shift > 0 ? 'url(#af-glow)' : undefined} />
          <ellipse cx={906} cy={420} rx={8} ry={24} fill="none" stroke={`${blue}0.8)`} strokeWidth={2} />
          <line x1={800} y1={392} x2={820} y2={372 - engDy} stroke={`${blue}0.6)`} strokeWidth={3} />
        </g>
        {engineShift !== undefined ? (
          <g opacity={shift}>
            <line x1={780} y1={476} x2={780 + 160 * shift} y2={476} stroke={gHi} strokeWidth={4} />
            <path d={`M ${780 + 160 * shift} 476 l -18 -10 l 0 20 z`} fill={gHi} />
            <text x={780} y={512} fill={C.paper} style={{font: `800 34px ${FONT.title}`}}>{shiftLabel}</text>
          </g>
        ) : null}
        {/* Cote */}
        {name ? (
          <g opacity={unit(draw * 2 - 1)}>
            <line x1={96} y1={540} x2={1474} y2={540} stroke={`${blue}0.35)`} strokeWidth={1.5} />
            <line x1={96} y1={528} x2={96} y2={552} stroke={`${blue}0.35)`} strokeWidth={1.5} />
            <line x1={1474} y1={528} x2={1474} y2={552} stroke={`${blue}0.35)`} strokeWidth={1.5} />
            <rect x={785 - name.length * 9.5} y={524} width={name.length * 19} height={32} fill={C.ink} />
            <text x={785} y={548} textAnchor="middle" fill={`${blue}0.8)`} style={{font: `600 22px ${FONT.mono}`, letterSpacing: 3}}>{name.toUpperCase()}</text>
          </g>
        ) : null}
        {/* Étiquettes des sections */}
        {zones.map((z, i) => {
          const p = zoneP(z, i);
          if (p <= 0) return null;
          const [x0, x1] = ZONE_X[z.zone];
          const cx = z.zone === 'tail' ? 250 : (x0 + x1) / 2;
          const below = z.zone === 'wing' || z.zone === 'engine';
          const row = below ? 0 : i % 2;
          const ly = below ? 470 + (z.zone === 'engine' ? 0 : 0) : row ? 120 : 30;
          const ay = below ? 400 : z.zone === 'tail' ? 70 : 228;
          return (
            <g key={`l${i}`} opacity={p}>
              <line x1={cx} y1={ay} x2={cx} y2={below ? ly - 30 : ly + 52} stroke={gHi} strokeWidth={2} strokeDasharray="4 5" />
              <circle cx={cx} cy={ay} r={6} fill={gHi} />
              <text x={cx} y={ly + (below ? 0 : 20)} textAnchor="middle" fill={C.paper} style={{font: `800 38px ${FONT.title}`}}>{z.label}</text>
              {z.sub ? (
                <text x={cx} y={ly + (below ? 34 : 52)} textAnchor="middle" fill={gHi} style={{font: `600 22px ${FONT.mono}`, letterSpacing: 2}}>{z.sub.toUpperCase()}</text>
              ) : null}
            </g>
          );
        })}
        {/* Repères */}
        {markers.map((m, i) => {
          const tm = m.time ?? start + (zones.length + i) * stagger;
          const p = interpolate(t, [tm, tm + 0.5], [0, 1], clamp);
          if (p <= 0) return null;
          const [x, y] = SPOTS[m.at] ?? [800, 300];
          const col = m.color === 'brick' ? C.brick : m.color === 'teal' ? C.teal : gHi;
          const up = y > 330 ? false : true;
          const ty = up ? 60 : 500;
          const tx = Math.min(1360, Math.max(240, x));
          return (
            <g key={`m${i}`} opacity={p}>
              <circle cx={x} cy={y} r={18 + 10 * pulse} fill="none" stroke={col} strokeWidth={3} opacity={0.4 + 0.4 * (1 - pulse)} />
              <circle cx={x} cy={y} r={9} fill={col} />
              <line x1={x} y1={up ? y - 20 : y + 20} x2={tx} y2={up ? ty + 40 : ty - 40} stroke={col} strokeWidth={2} />
              <text x={tx} y={ty + (up ? 14 : 0)} textAnchor="middle" fill={C.paper} style={{font: `800 42px ${FONT.title}`}}>{m.label}</text>
              {m.sub ? (
                <text x={tx} y={ty + (up ? 44 : 30)} textAnchor="middle" fill={col} style={{font: `600 20px ${FONT.mono}`, letterSpacing: 2}}>{m.sub.toUpperCase()}</text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {counter ? (
        (() => {
          const p = spring({frame: frame - (counter.at ?? start + zones.length * stagger) * fps, fps, config: {damping: 200}});
          return (
            <div style={{position: 'absolute', right: 40, top: title ? 70 : 40, textAlign: 'right', ...fade(p)}}>
              <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 96, color: gHi, letterSpacing: -3, lineHeight: 1, textShadow: `0 0 40px ${gHalo}`}}>{counter.value}</div>
              <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 3, color: C.mute, marginTop: 8}}>{counter.label.toUpperCase()}</div>
            </div>
          );
        })()
      ) : null}
    </Frame>
  );
};

// ---------- Instrument de cockpit ----------
type Step = {value: number; label: string; sub?: string; at?: number; color?: string};

export const Gauge: React.FC<{
  kicker?: string;
  title?: string;
  unit?: string; // ex. « per month »
  name?: string; // texte au centre du cadran (ex. « 737 RATE »)
  min?: number;
  max: number;
  ticks?: number; // pas des graduations chiffrées
  steps: Step[];
  cap?: {value: number; label: string};
  start?: number;
  stagger?: number;
  source?: string;
}> = ({kicker, title, unit: unitLabel, name, min = 0, max, ticks = 10, steps, cap, start = 0.8, stagger = 1.6, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pK = useEnter(0.05);
  const pDial = useEnter(0.15);
  const [gLo, gHi, gHalo] = gradOf('amber');
  const R = 290;
  const cx = 360;
  const cy = 360;
  const A0 = -225;
  const A1 = 45;
  const ang = (v: number) => A0 + ((v - min) / (max - min)) * (A1 - A0);
  const pt = (a: number, r: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const timeOf = (s: Step, i: number) => s.at ?? start + i * stagger;
  // Valeur de l'aiguille : ressort vers chaque étape à son heure.
  let value = min;
  steps.forEach((s, i) => {
    const sp = spring({frame: frame - timeOf(s, i) * fps, fps, config: {damping: 14, mass: 1, stiffness: 60}});
    value += (s.value - (i === 0 ? min : steps[i - 1].value)) * sp;
  });
  const arc = (v0: number, v1: number, r: number) => {
    const [x0, y0] = pt(ang(v0), r);
    const [x1, y1] = pt(ang(v1), r);
    const large = ang(v1) - ang(v0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const nTicks = Math.round((max - min) / ticks);
  const active = steps.reduce((a, s, i) => (t >= timeOf(s, i) ? i : a), -1);
  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: title ? -10 : -40, ...fade(pK)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <svg viewBox="0 0 720 720" style={{position: 'absolute', left: 40, top: title ? 0 : -20, width: 720, height: 720, opacity: unit(pDial), transform: `scale(${interpolate(pDial, [0, 1], [0.92, 1])})`}}>
        <defs>
          <radialGradient id="g-face" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#13213C" />
            <stop offset="1" stopColor="#050A16" />
          </radialGradient>
          <linearGradient id="g-bezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5B6A85" />
            <stop offset="0.5" stopColor="#1A2233" />
            <stop offset="1" stopColor="#3B475E" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R + 46} fill="url(#g-bezel)" />
        <circle cx={cx} cy={cy} r={R + 30} fill="url(#g-face)" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        {/* Arc parcouru */}
        <path d={arc(min, max, R - 20)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={18} strokeLinecap="round" />
        {value > min + 0.01 ? <path d={arc(min, Math.min(max, value), R - 20)} fill="none" stroke={gHi} strokeWidth={18} strokeLinecap="round" style={{filter: `drop-shadow(0 0 14px ${gHalo})`}} /> : null}
        {/* Graduations */}
        {Array.from({length: nTicks * 5 + 1}, (_, k) => {
          const v = min + (k * ticks) / 5;
          const major = k % 5 === 0;
          const [x0, y0] = pt(ang(v), R + 8);
          const [x1, y1] = pt(ang(v), R - (major ? 34 : 14) + 8);
          return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke={major ? C.paper : 'rgba(255,255,255,0.4)'} strokeWidth={major ? 4 : 2} />;
        })}
        {Array.from({length: nTicks + 1}, (_, k) => {
          const v = min + k * ticks;
          const [x, y] = pt(ang(v), R - 72);
          return (
            <text key={k} x={x} y={y + 12} textAnchor="middle" fill={C.paper} style={{font: `600 34px ${FONT.mono}`}}>{v}</text>
          );
        })}
        {/* Plafond */}
        {cap ? (
          (() => {
            const [x0, y0] = pt(ang(cap.value), R + 18);
            const [x1, y1] = pt(ang(cap.value), R - 48);
            const [lx, ly] = pt(ang(cap.value), R - 150);
            return (
              <g>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.brick} strokeWidth={8} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${C.brick})`}} />
                <text x={lx} y={ly + 8} textAnchor="middle" fill={C.brick} style={{font: `700 22px ${FONT.mono}`, letterSpacing: 2}}>{cap.label.toUpperCase()}</text>
              </g>
            );
          })()
        ) : null}
        {/* Centre */}
        {name ? <text x={cx} y={cy + 120} textAnchor="middle" fill={C.mute} style={{font: `600 24px ${FONT.mono}`, letterSpacing: 5}}>{name.toUpperCase()}</text> : null}
        <text x={cx} y={cy + 196} textAnchor="middle" fill={gHi} style={{font: `600 76px ${FONT.mono}`, filter: `drop-shadow(0 0 18px ${gHalo})`}}>{Math.round(value)}</text>
        {unitLabel ? <text x={cx} y={cy + 232} textAnchor="middle" fill={C.mute} style={{font: `600 20px ${FONT.mono}`, letterSpacing: 4}}>{unitLabel.toUpperCase()}</text> : null}
        {/* Aiguille */}
        <g transform={`rotate(${ang(value)} ${cx} ${cy})`}>
          <path d={`M ${cx - 30} ${cy - 7} L ${cx + R - 40} ${cy - 2} L ${cx + R - 22} ${cy} L ${cx + R - 40} ${cy + 2} L ${cx - 30} ${cy + 7} Z`} fill={C.paper} style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'}} />
        </g>
        <circle cx={cx} cy={cy} r={26} fill="url(#g-bezel)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={8} fill={gHi} />
      </svg>
      {/* Étapes */}
      <div style={{position: 'absolute', left: 860, right: 0, top: title ? 60 : 40, display: 'flex', flexDirection: 'column', gap: 26}}>
        {steps.map((s, i) => {
          const p = interpolate(t, [timeOf(s, i) - 0.1, timeOf(s, i) + 0.5], [0, 1], clamp);
          const on = i === active;
          const col = s.color === 'brick' ? C.brick : s.color === 'teal' ? C.teal : gHi;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '24px 34px', ...glass(on ? `${col}88` : undefined), borderRadius: 22, opacity: 0.25 + 0.75 * p, transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`}}>
              <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 70, color: p > 0.5 ? col : C.slate, minWidth: 120, textShadow: on ? `0 0 26px ${col}` : undefined, lineHeight: 1}}>{s.value}</div>
              <div>
                <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 36, color: C.paper, lineHeight: 1.1}}>{s.label}</div>
                {s.sub ? <div style={{fontFamily: FONT.mono, fontSize: 20, letterSpacing: 2, color: C.mute, marginTop: 8}}>{s.sub.toUpperCase()}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
};
