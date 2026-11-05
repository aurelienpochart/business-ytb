import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {icons} from 'lucide-react';
import {C, FONT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter} from './common';
import {Kicker} from './fx';

// ---------- Gabarit The Teardown (vidéo 07 Netflix) ----------
// Trois blocs propres à ce gabarit, en plus de la cascade du billet (money.tsx) :
// - Levers : la console des leviers. Un socle « coût fixe » verrouillé en bas, des curseurs verticaux (prix, partage,
//   pub, direct…) qui montent un à un ; la marge affichée à droite grimpe avec eux. Revient au début de chaque
//   chapitre « levier » (`active`), comme le parcours de The Journey ou le tableau de The Question.
// - Gap : deux courbes sur des années (revenus, coût fixe) ; l'écart entre elles se remplit d'or (le profit).
// - Spread : un paiement en cash d'un coup, puis la charge étalée sur plusieurs années (amortissement).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const unit = (p: number) => Math.min(1, Math.max(0, p));
const Ico: React.FC<{name?: string; size: number; color: string; stroke?: number; glow?: string}> = ({name, size, color, stroke = 1.6, glow}) => {
  const I = name ? (icons as Record<string, React.FC<any>>)[name] : undefined;
  return I ? <I size={size} color={color} strokeWidth={stroke} style={glow ? {filter: `drop-shadow(0 0 12px ${glow})`} : undefined} /> : null;
};

// ---------- Console des leviers ----------
type Lever = {label: string; icon?: string; sub?: string};

export const Levers: React.FC<{
  kicker?: string;
  base: {label: string; sub?: string}; // le socle fixe (ex. « Content bill »)
  levers: Lever[];
  done?: number; // leviers déjà levés au début du plan
  active?: number; // levier mis en avant (monte pendant le plan) ; -1 : aucun
  lift?: number; // nombre de leviers qui montent pendant le plan (après `done`), défaut : jusqu'à `active` ou tous
  margin?: {from: number; to: number; decimals?: number; suffix?: string; label?: string}; // compteur de marge à droite (monte avec les leviers)
  start?: number;
  stagger?: number;
  source?: string;
}> = ({kicker, base, levers, done = 0, active = -1, lift, margin, start = 0.6, stagger = 0.7, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = levers.length;
  const upTo = lift !== undefined ? done + lift : active >= 0 ? active + 1 : n;
  const pK = useEnter(0.05);
  const pBase = useEnter(0.25);
  const W = 1620;
  const deskW = margin ? 1120 : 1620;
  const slot = deskW / n;
  const trackTop = 70;
  const trackH = 380;
  const [gLo, gHi, gHalo] = gradOf('amber');
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 3.4);
  const upOf = (i: number) => {
    if (i < done) return 1;
    if (i >= upTo) return 0;
    const d = start + (i - done) * stagger;
    return spring({frame: frame - d * fps, fps, config: {damping: 16, mass: 1, stiffness: 70}});
  };
  const lifted = levers.reduce((a, _, i) => a + unit(upOf(i)), 0);
  const marginP = margin ? unit(lifted / Math.max(1, upTo)) : 0;
  const Lock = icons.Lock as React.FC<any>;
  return (
    <Frame source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: -40, ...fade(pK)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      {/* Pupitre */}
      <div style={{position: 'absolute', left: 0, top: 30, width: deskW, height: 620, ...glass(), borderRadius: 30, ...fade(pBase)}} />
      {levers.map((l, i) => {
        const up = upOf(i);
        const u = unit(up);
        const isActive = i === active;
        const cx = slot * i + slot / 2;
        const knobY = trackTop + 30 + trackH - 60 - (trackH - 60) * up;
        const lit = u > 0.05;
        const col = lit ? gHi : C.slate;
        return (
          <div key={i} style={{position: 'absolute', left: cx - slot / 2, top: 30, width: slot, height: 620, opacity: interpolate(pBase, [0, 1], [0, 1])}}>
            {/* Rail */}
            <div style={{position: 'absolute', left: slot / 2 - 7, top: trackTop + 30, width: 14, height: trackH, borderRadius: 7, background: 'rgba(255,255,255,0.07)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'}} />
            <div
              style={{
                position: 'absolute',
                left: slot / 2 - 5,
                top: knobY + 30,
                width: 10,
                height: Math.max(0, trackTop + 30 + trackH - knobY - 30),
                borderRadius: 5,
                background: `linear-gradient(180deg, ${gHi}, ${gLo})`,
                boxShadow: `0 0 24px ${gHalo}`,
                opacity: u,
              }}
            />
            {/* Graduations */}
            {Array.from({length: 9}, (_, k) => (
              <div key={k} style={{position: 'absolute', left: slot / 2 + 18, top: trackTop + 30 + (k * trackH) / 8, width: k % 4 === 0 ? 22 : 12, height: 2, background: 'rgba(255,255,255,0.13)'}} />
            ))}
            {/* Bouton du curseur */}
            <div
              style={{
                position: 'absolute',
                left: slot / 2 - 62,
                top: knobY,
                width: 124,
                height: 60,
                borderRadius: 14,
                background: lit ? `linear-gradient(180deg, #FFF3D6, ${gHi} 45%, ${gLo})` : 'linear-gradient(180deg, #5A6577, #2A3240)',
                boxShadow: lit ? `0 0 ${isActive ? 30 + 30 * pulse : 26}px ${gHalo}, 0 10px 24px rgba(0,0,0,0.5)` : '0 10px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{width: 70, height: 4, borderRadius: 2, background: lit ? 'rgba(80,45,0,0.55)' : 'rgba(255,255,255,0.25)'}} />
            </div>
            {/* Icône et libellé */}
            <div style={{position: 'absolute', left: 0, right: 0, top: 6, display: 'flex', justifyContent: 'center', opacity: 0.4 + 0.6 * u}}>
              <Ico name={l.icon} size={46} color={col} glow={lit ? gHalo : undefined} />
            </div>
            <div style={{position: 'absolute', left: 6, right: 6, top: trackTop + trackH + 52, textAlign: 'center'}}>
              <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: n > 4 ? 30 : 36, color: lit ? C.paper : C.mute, letterSpacing: -0.3, lineHeight: 1.05}}>{l.label}</div>
              {l.sub ? <div style={{fontFamily: FONT.mono, fontSize: 20, letterSpacing: 2, color: lit ? gHi : C.slate, marginTop: 8}}>{l.sub.toUpperCase()}</div> : null}
            </div>
            {isActive ? (
              <div style={{position: 'absolute', left: 14, right: 14, top: 0, bottom: 0, borderRadius: 24, border: `2px solid rgba(240,181,78,${0.25 + 0.35 * pulse})`, boxShadow: `0 0 50px rgba(240,181,78,${0.12 + 0.12 * pulse})`}} />
            ) : null}
          </div>
        );
      })}
      {/* Socle : coût fixe verrouillé */}
      <div style={{position: 'absolute', left: 0, top: 690, width: deskW, height: 96, borderRadius: 20, background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))', border: '1.5px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', ...fade(pBase)}}>
        <Lock size={38} color={C.mute} strokeWidth={1.8} />
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 36, color: C.paper}}>{base.label}</div>
        {base.sub ? <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: 3, color: C.mute}}>{base.sub.toUpperCase()}</div> : null}
      </div>
      {/* Compteur de marge */}
      {margin ? (
        <div style={{position: 'absolute', left: deskW + 60, top: 30, width: W - deskW - 60, height: 756, ...glass('rgba(240,181,78,0.35)'), borderRadius: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fade(pBase)}}>
          <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: 6, color: C.mute}}>{(margin.label ?? 'Operating margin').toUpperCase()}</div>
          <div style={{position: 'relative', width: 300, height: 420, marginTop: 30, borderRadius: 24, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${18 + 70 * marginP}%`, background: `linear-gradient(180deg, ${gHi}, ${gLo})`, boxShadow: `0 0 60px ${gHalo}`}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: `${18 + 70 * marginP}%`, height: 3, background: '#FFF3D6', boxShadow: `0 0 20px ${gHalo}`}} />
          </div>
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 76, color: gHi, textShadow: `0 0 30px ${gHalo}`, marginTop: 26, letterSpacing: -2}}>{(margin.from + (margin.to - margin.from) * marginP).toFixed(margin.decimals ?? 0)}{margin.suffix ?? '%'}</div>
        </div>
      ) : null}
    </Frame>
  );
};

// ---------- L'écart qui s'ouvre ----------
type GapPoint = {year: number; top: number; bottom: number; topLabel?: string; bottomLabel?: string};

export const Gap: React.FC<{
  title?: string;
  points: GapPoint[];
  topName: string; // ex. « Revenue »
  bottomName: string; // ex. « Content expense »
  gapName?: string; // ex. « Everything else, incl. profit »
  max?: number;
  prefix?: string;
  suffix?: string;
  draw?: [number, number];
  source?: string;
}> = ({title, points, topName, bottomName, gapName, max, prefix = '$', suffix = 'B', draw: span = [0.6, 3.6], source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const W = 1300;
  const H = 520;
  const y0 = points[0].year;
  const y1 = points[points.length - 1].year;
  const top = max ?? Math.max(...points.map((p) => p.top)) * 1.15;
  const X = (y: number) => ((y - y0) / Math.max(1, y1 - y0)) * W;
  const Y = (v: number) => H - (v / top) * H;
  const k = interpolate(t, span, [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const xMax = X(y0) + (W - X(y0)) * k;
  const grid = useEnter(0.1);
  const pGap = useEnter(span[1] + 0.2);
  const [, tHi, tHalo] = gradOf('amber');
  const [, bHi, bHalo] = gradOf('teal');
  const path = (key: 'top' | 'bottom') => points.map((p, i) => `${i ? 'L' : 'M'} ${X(p.year)} ${Y(p[key])}`).join(' ');
  const area = `${path('top')} ${[...points].reverse().map((p) => `L ${X(p.year)} ${Y(p.bottom)}`).join(' ')} Z`;
  const last = points[points.length - 1];
  const fmt = (v: number) => `${prefix}${v.toLocaleString('en-US', {maximumFractionDigits: 1})}${suffix}`;
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 60, top: 40, width: W + 300, height: H + 80}}>
        <svg width={W + 300} height={H + 80} style={{overflow: 'visible'}}>
          <defs>
            <clipPath id="gapclip">
              <rect x={-20} y={-40} width={xMax + 20} height={H + 120} />
            </clipPath>
            <linearGradient id="gapfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0B54E" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#A8701E" stopOpacity={0.12} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((g) => (
            <line key={g} x1={0} x2={W} y1={H - g * H} y2={H - g * H} stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} opacity={grid} />
          ))}
          <line x1={0} x2={W} y1={H} y2={H} stroke="rgba(255,255,255,0.25)" strokeWidth={2} opacity={grid} />
          <g clipPath="url(#gapclip)">
            <path d={area} fill="url(#gapfill)" opacity={0.25 + 0.75 * pGap} />
            <path d={path('bottom')} fill="none" stroke={bHi} strokeWidth={6} style={{filter: `drop-shadow(0 0 10px ${bHalo})`}} />
            <path d={path('top')} fill="none" stroke={tHi} strokeWidth={7} style={{filter: `drop-shadow(0 0 12px ${tHalo})`}} />
          </g>
          {points.map((p, i) => {
            const on = X(p.year) <= xMax + 1;
            const q = on ? 1 : 0;
            return (
              <g key={i} opacity={q}>
                <circle cx={X(p.year)} cy={Y(p.top)} r={10} fill="#FFF3D6" stroke={tHi} strokeWidth={4} />
                <circle cx={X(p.year)} cy={Y(p.bottom)} r={9} fill="#E8F8FF" stroke={bHi} strokeWidth={4} />
                <text x={X(p.year)} y={Y(p.top) - 26} textAnchor="middle" fill={C.paper} fontFamily={FONT.mono} fontWeight={600} fontSize={30}>
                  {p.topLabel ?? fmt(p.top)}
                </text>
                <text x={X(p.year)} y={Y(p.bottom) + 46} textAnchor="middle" fill={bHi} fontFamily={FONT.mono} fontWeight={600} fontSize={28}>
                  {p.bottomLabel ?? fmt(p.bottom)}
                </text>
                <text x={X(p.year)} y={H + 50} textAnchor="middle" fill={C.mute} fontFamily={FONT.mono} fontSize={26} letterSpacing={2}>
                  {p.year}
                </text>
              </g>
            );
          })}
          <g opacity={k > 0.98 ? 1 : 0}>
            <text x={W + 40} y={Y(last.top) + 10} fill={tHi} fontFamily={FONT.title} fontWeight={800} fontSize={34}>
              {topName}
            </text>
            <text x={W + 40} y={Y(last.bottom) + 10} fill={bHi} fontFamily={FONT.title} fontWeight={800} fontSize={34}>
              {bottomName}
            </text>
          </g>
          {gapName ? (
            <text x={W + 40} y={(Y(last.top) + Y(last.bottom)) / 2 + 10} fill={C.paper} fontFamily={FONT.display} fontStyle="italic" fontSize={42} opacity={pGap}>
              {gapName}
            </text>
          ) : null}
        </svg>
      </div>
    </Frame>
  );
};

// ---------- Paiement d'avance, charge étalée ----------
type SpreadBar = {label: string; value: number; display?: string};

export const Spread: React.FC<{
  title?: string;
  cash: {label: string; display: string};
  bars: SpreadBar[]; // charge par année (parts du total, ex. 45, 25…)
  note?: string; // ex. « Over 90% within four years »
  splitAt?: number;
  stagger?: number;
  source?: string;
}> = ({title, cash, bars, note, splitAt = 1.8, stagger = 0.45, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pCash = useEnter(0.25);
  const total = bars.reduce((a, b) => a + b.value, 0);
  const H = 440;
  const baseY = 600;
  const colW = 170;
  const gap = 46;
  const x0 = 520;
  const [gLo, gHi, gHalo] = gradOf('amber');
  const [tLo, tHi, tHalo] = gradOf('teal');
  // Le bloc de cash « fond » au fil de la répartition.
  const drained = bars.reduce((a, b, i) => a + b.value * unit(spring({frame: frame - (splitAt + i * stagger) * fps, fps, config: {damping: 200}})), 0);
  const cashH = H * (1 - (0.85 * drained) / total);
  const pNote = useEnter(splitAt + bars.length * stagger + 0.5);
  const Arrow = icons.ArrowRight as React.FC<any>;
  return (
    <Frame title={title} source={source}>
      {/* Cash payé d'avance */}
      <div style={{position: 'absolute', left: 40, top: baseY - H - 10, width: 300, height: H + 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', ...fade(pCash)}}>
        <div style={{width: 220, height: cashH, borderRadius: '18px 18px 6px 6px', background: `linear-gradient(180deg, ${gHi}, ${gLo})`, boxShadow: `0 0 60px ${gHalo}, inset 0 3px 0 rgba(255,255,255,0.45)`}} />
      </div>
      <div style={{position: 'absolute', left: 40, top: baseY + 22, width: 300, textAlign: 'center', ...fade(pCash)}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, color: gHi}}>{cash.display}</div>
        <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 28, color: C.paper, marginTop: 6}}>{cash.label}</div>
      </div>
      <div style={{position: 'absolute', left: 372, top: baseY - 200, opacity: interpolate(t, [splitAt - 0.4, splitAt], [0, 1], clamp)}}>
        <Arrow size={84} color={C.mute} strokeWidth={1.4} />
      </div>
      {/* Charge par année */}
      {bars.map((b, i) => {
        const p = spring({frame: frame - (splitAt + i * stagger) * fps, fps, config: {damping: 15, mass: 0.9, stiffness: 80}});
        const h = (b.value / total) * H * 1.6 * Math.max(0, p);
        const x = x0 + i * (colW + gap);
        const u = unit(p);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: baseY - h, width: colW, height: h, borderRadius: '14px 14px 4px 4px', background: `linear-gradient(180deg, ${tHi}, ${tLo})`, boxShadow: `0 0 40px ${tHalo}, inset 0 3px 0 rgba(255,255,255,0.4)`}} />
            <div style={{position: 'absolute', left: x - 20, width: colW + 40, top: baseY - h - 56, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: 32, color: C.paper, opacity: u}}>{b.display ?? ''}</div>
            <div style={{position: 'absolute', left: x - 20, width: colW + 40, top: baseY + 22, textAlign: 'center', fontFamily: FONT.mono, fontSize: 26, letterSpacing: 2, color: C.mute, opacity: u}}>{b.label.toUpperCase()}</div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: baseY, height: 2, background: 'rgba(255,255,255,0.25)'}} />
      {note ? (
        <div style={{position: 'absolute', left: x0, top: 30, width: bars.length * (colW + gap) - gap, ...fade(pNote)}}>
          <div style={{...glass('rgba(240,181,78,0.35)'), padding: '18px 30px', fontFamily: FONT.display, fontStyle: 'italic', fontSize: 46, color: C.paper, textAlign: 'center'}}>{note}</div>
        </div>
      ) : null}
    </Frame>
  );
};
