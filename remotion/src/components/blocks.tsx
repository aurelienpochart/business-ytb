import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {icons} from 'lucide-react';
import {C, FONT} from '../theme';
import {Frame, colorOf, fade, formatNumber, glass, gradOf, useEnter} from './common';
import {Kicker, Odometer, RevealWords, TechRing} from './fx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Couleur de texte lumineuse + halo pour une couleur de la charte.
const glowText = (name?: string): React.CSSProperties => {
  const [, top, halo] = gradOf(name ?? 'amber');
  return {color: top, textShadow: `0 0 36px ${halo}`};
};

// ---------- Icône qui se dessine (Lucide, licence ISC) ----------
export const IconDraw: React.FC<{name: string; size: number; delay?: number; color?: string; uid: string}> = ({name, size, delay = 0, color = C.gold, uid}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const Icon = (icons as Record<string, React.FC<any>>)[name];
  if (!Icon) return null;
  const p = interpolate(frame, [delay * fps, delay * fps + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cls = `draw-${uid.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <>
      <style>{`.${cls} * { stroke-dasharray: 90; stroke-dashoffset: ${90 * (1 - p)}; }`}</style>
      <Icon className={cls} size={size} color={color} strokeWidth={1.3} style={{filter: `drop-shadow(0 0 18px ${color}88)`}} />
    </>
  );
};

// ---------- Grande phrase ----------
export const Statement: React.FC<{kicker?: string; text: string; sub?: string; source?: string; icon?: string}> = ({kicker, text, sub, source, icon}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.replace(/\*/g, '').split(/\s+/).length;
  const p2 = useEnter(0.35 + words * 0.07);
  const iconP = useEnter(0.3);
  const watermark = (kicker ?? text.match(/\*([^*]+)\*/)?.[1] ?? '').replace(/[.]/g, '').toUpperCase();
  return (
    <Frame source={source}>
      {watermark ? (
        <div
          style={{
            position: 'absolute',
            left: -150 - frame * 0.6,
            top: 60,
            fontFamily: FONT.title,
            fontWeight: 900,
            fontSize: 380,
            whiteSpace: 'nowrap',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(240,181,78,0.07)',
            letterSpacing: -6,
          }}
        >
          {watermark}
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 80}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {kicker ? (
            <div style={{marginBottom: 36}}>
              <Kicker text={kicker} />
            </div>
          ) : null}
          <div style={{fontFamily: FONT.display, fontWeight: 400, fontSize: 132, lineHeight: 1.02, color: C.paper, maxWidth: icon ? 1100 : 1550, letterSpacing: -1}}>
            <RevealWords text={text} delay={0.15} stagger={0.075} />
          </div>
          {sub ? (
            <div style={{...fade(p2), fontFamily: FONT.title, fontWeight: 300, fontSize: 42, color: C.paper, opacity: 0.78 * Math.min(1, p2), marginTop: 44, maxWidth: 1300, letterSpacing: 0.2}}>
              {sub.replace(/\*/g, '')}
            </div>
          ) : null}
        </div>
        {icon ? (
          <div style={{position: 'relative', width: 460, height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fade(iconP)}}>
            <div style={{position: 'absolute', inset: 40, ...glass('rgba(240,181,78,0.35)'), borderRadius: '50%'}} />
            <TechRing size={460} delay={0.3} />
            <div style={{transform: `translateY(${Math.sin(frame / fps) * 8}px)`}}>
              <IconDraw name={icon} size={200} delay={0.35} uid={`st${icon}${text.length}`} />
            </div>
          </div>
        ) : null}
      </div>
    </Frame>
  );
};

// ---------- Grands chiffres ----------
type Num = {value: number; prefix?: string; suffix?: string; decimals?: number; label: string; color?: string; icon?: string};
export const BigNumbers: React.FC<{title?: string; items: Num[]; source?: string}> = ({title, items, source}) => (
  <Frame title={title} source={source}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 90}}>
      {items.map((item, i) => (
        <NumberItem key={i} item={item} delay={0.25 + i * 0.9} big={items.length === 1} />
      ))}
    </div>
  </Frame>
);

const NumberItem: React.FC<{item: Num; delay: number; big: boolean}> = ({item, delay, big}) => {
  const p = useEnter(delay);
  const text = `${item.prefix ?? ''}${formatNumber(Math.abs(item.value), item.decimals ?? 0)}${item.suffix ?? ''}`;
  const neg = item.value < 0;
  const ring = big ? 620 : 520;
  return (
    <div style={{position: 'relative', width: big ? 1100 : 720, height: ring, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fade(p)}}>
      <TechRing size={ring} delay={delay} color={gradOf(item.color ?? 'amber')[1]} />
      {item.icon ? (
        <div style={{marginBottom: 10}}>
          <IconDraw name={item.icon} size={64} delay={delay} color={gradOf(item.color ?? 'amber')[1]} uid={`n${item.icon}${delay}`} />
        </div>
      ) : null}
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: big ? 190 : 140, letterSpacing: -4, ...glowText(item.color ?? 'amber')}}>
        {neg ? '−' : ''}
        <Odometer text={text} delay={delay + 0.1} />
      </div>
      <div style={{fontFamily: FONT.title, fontWeight: 400, fontSize: 36, color: C.paper, opacity: 0.85, marginTop: 26, maxWidth: 560, textAlign: 'center', letterSpacing: 1}}>
        {item.label}
      </div>
    </div>
  );
};

// ---------- Barres ----------
type Bar = {label: string; value: number; color?: string; note?: string};
const CHART_H = 560;
export const Bars: React.FC<{title: string; bars: Bar[]; prefix?: string; suffix?: string; decimals?: number; max?: number; stagger?: number; source?: string}> = ({
  title,
  bars,
  prefix = '',
  suffix = '',
  decimals = 0,
  max,
  stagger = 0.35,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const posMax = Math.max(0, ...bars.map((b) => b.value));
  const negMax = Math.max(0, ...bars.map((b) => -b.value));
  const span = (max ?? posMax + negMax) * 1.12;
  const posH = (posMax / span) * CHART_H + (negMax ? 60 : 0);
  const negH = (negMax / span) * CHART_H + (negMax ? 60 : 0);
  const n = bars.length;
  const width = Math.min(200, 1300 / n - 40);
  const grid = interpolate(frame, [0, 0.9 * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, height: posH + negH}}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <div key={g} style={{position: 'absolute', left: 0, right: 0, top: posH - g * posH, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.08) 85%, transparent)', transformOrigin: 'left', transform: `scaleX(${grid})`}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, top: posH - 1, height: 2, background: 'linear-gradient(90deg, transparent, rgba(240,181,78,0.6), transparent)', transform: `scaleX(${grid})`, boxShadow: '0 0 18px rgba(240,181,78,0.4)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', gap: Math.max(40, 120 - n * 10)}}>
          {bars.map((bar, i) => (
            <BarItem key={i} bar={bar} scale={CHART_H / span} base={posH} width={width} delay={0.4 + i * stagger} prefix={prefix} suffix={suffix} decimals={decimals}
              labelBelow={negMax > 0 ? posH + negH + 22 : posH + 26} />
          ))}
        </div>
      </div>
    </Frame>
  );
};

const BarItem: React.FC<{bar: Bar; scale: number; base: number; width: number; delay: number; prefix: string; suffix: string; decimals: number; labelBelow: number}> = ({
  bar,
  scale,
  base,
  width,
  delay,
  prefix,
  suffix,
  decimals,
  labelBelow,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay * fps, fps, config: {damping: 16, mass: 0.9, stiffness: 70}});
  const h = Math.max(0, p) * Math.abs(bar.value) * scale;
  const neg = bar.value < 0;
  const [lo, hi, halo] = gradOf(bar.color ?? 'teal');
  const shine = interpolate(frame, [(delay + 1.1) * fps, (delay + 1.9) * fps], [-0.4, 1.4], clamp);
  const text = `${neg ? '−' : ''}${prefix}${formatNumber(Math.abs(bar.value), decimals)}${suffix}`;
  const body: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width,
    height: h,
    background: neg ? `linear-gradient(0deg, ${hi}, ${lo})` : `linear-gradient(180deg, ${hi}, ${lo})`,
    borderRadius: neg ? '0 0 10px 10px' : '10px 10px 0 0',
    boxShadow: `0 0 60px ${halo}, inset 0 2px 0 rgba(255,255,255,0.35)`,
    overflow: 'hidden',
  };
  const shineEl = (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${neg ? 0 : 180}deg, transparent ${shine * 100 - 20}%, rgba(255,255,255,0.45) ${shine * 100}%, transparent ${shine * 100 + 20}%)`}} />
  );
  const label = (
    <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: width > 150 ? 40 : 32, color: C.paper, opacity: Math.min(1, Math.max(0, p)), whiteSpace: 'nowrap', textAlign: 'center', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
      <Odometer text={text} delay={delay} />
    </div>
  );
  return (
    <div style={{position: 'relative', width}}>
      {neg ? (
        <>
          <div style={{...body, top: base}}>{shineEl}</div>
          <div style={{position: 'absolute', top: base - 58, left: -60, right: -60}}>{label}</div>
        </>
      ) : (
        <>
          <div style={{...body, top: base - h}}>{shineEl}</div>
          {/* Reflet sur le « sol » */}
          <div style={{position: 'absolute', top: base + 2, left: 0, width, height: h * 0.35, background: `linear-gradient(180deg, ${lo}66, transparent)`, borderRadius: '0 0 10px 10px', opacity: 0.5, filter: 'blur(2px)'}} />
          <div style={{position: 'absolute', top: base - h - 58, left: -60, right: -60}}>{label}</div>
        </>
      )}
      <div style={{position: 'absolute', top: labelBelow, left: -80, right: -80, textAlign: 'center', fontFamily: FONT.mono, fontSize: 26, letterSpacing: 2, color: C.paper, opacity: 0.8 * Math.min(1, Math.max(0, p)), whiteSpace: 'nowrap'}}>
        {bar.label.toUpperCase()}
      </div>
      {bar.note ? (
        <div style={{position: 'absolute', top: labelBelow + 40, left: -100, right: -100, textAlign: 'center', fontFamily: FONT.title, fontSize: 24, color: C.gold, whiteSpace: 'nowrap', opacity: Math.min(1, Math.max(0, p))}}>{bar.note}</div>
      ) : null}
    </div>
  );
};

// ---------- Barre empilée ----------
type Part = {label: string; value: number; color?: string};
export const Stacked: React.FC<{title: string; total: string; parts: Part[]; prefix?: string; suffix?: string; decimals?: number; source?: string}> = ({
  title,
  total,
  parts,
  prefix = '',
  suffix = '',
  decimals = 1,
  source,
}) => {
  const sum = parts.reduce((a, b) => a + b.value, 0);
  const pTotal = useEnter(0.2);
  const pTrack = useEnter(0.35);
  return (
    <Frame title={title} source={source}>
      <div style={{...fade(pTotal), fontFamily: FONT.mono, fontWeight: 600, fontSize: 96, letterSpacing: -2, marginBottom: 50, ...glowText('amber')}}>
        <Odometer text={total} delay={0.25} />
      </div>
      <div style={{display: 'flex', height: 150, width: '100%', gap: 8, padding: 10, ...glass(), opacity: Math.min(1, pTrack)}}>
        {parts.map((part, i) => (
          <StackPart key={i} part={part} share={part.value / sum} delay={0.8 + i * 1.0} />
        ))}
      </div>
      <div style={{display: 'flex', width: '100%', gap: 8, marginTop: 36}}>
        {parts.map((part, i) => (
          <StackLabel key={i} part={part} share={part.value / sum} delay={1.0 + i * 1.0} prefix={prefix} suffix={suffix} decimals={decimals} />
        ))}
      </div>
    </Frame>
  );
};

const StackPart: React.FC<{part: Part; share: number; delay: number}> = ({part, share, delay}) => {
  const p = useEnter(delay, 26);
  const [lo, hi, halo] = gradOf(part.color);
  return (
    <div style={{width: `${share * 100}%`, display: 'flex'}}>
      <div style={{width: `${Math.min(1, Math.max(0, p)) * 100}%`, background: `linear-gradient(180deg, ${hi}, ${lo})`, borderRadius: 12, boxShadow: `0 0 40px ${halo}, inset 0 2px 0 rgba(255,255,255,0.3)`}} />
    </div>
  );
};

const StackLabel: React.FC<{part: Part; share: number; delay: number; prefix: string; suffix: string; decimals: number}> = ({part, share, delay, prefix, suffix, decimals}) => {
  const p = useEnter(delay);
  return (
    <div style={{...fade(p), width: `${share * 100}%`, minWidth: 0, paddingLeft: 12, borderLeft: `2px solid ${gradOf(part.color)[1]}`}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 48, ...glowText(part.color)}}>
        <Odometer text={`${prefix}${formatNumber(part.value, decimals)}${suffix}`} delay={delay} />
      </div>
      <div style={{fontFamily: FONT.title, fontSize: 28, color: C.paper, opacity: 0.8, marginTop: 10, lineHeight: 1.2}}>{part.label}</div>
    </div>
  );
};

// ---------- Courbe ----------
type Point = {x: string; y: number; label?: string};
export const Line: React.FC<{
  title: string;
  points: Point[];
  compare?: {name: string; points: Point[]; color?: string};
  name?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  min?: number;
  max?: number;
  color?: string;
  draw?: [number, number]; // début et fin du tracé, en secondes (pour suivre la narration)
  source?: string;
}> = ({title, points, compare, name, prefix = '', suffix = '', decimals = 0, min = 0, max, color = 'amber', draw: drawSpan = [0.5, 3.4], source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 1480;
  const H = 520;
  const all = [...points, ...(compare?.points ?? [])].map((p) => p.y);
  const top = max ?? Math.max(...all) * 1.18;
  const xs = (i: number, n: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const ys = (v: number) => H - ((v - min) / (top - min)) * H;
  const draw = interpolate(frame, [drawSpan[0] * fps, drawSpan[1] * fps], [0, 1], {...clamp, easing: drawSpan[1] - drawSpan[0] > 5 ? Easing.linear : Easing.inOut(Easing.cubic)});
  const drawCompare = interpolate(frame, [(drawSpan[1] + 0.2) * fps, (drawSpan[1] + 2.4) * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const grid = interpolate(frame, [0, 0.9 * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const path = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${xs(i, pts.length)} ${ys(p.y)}`).join(' ');
  const head = (pts: Point[], progress: number) => {
    const f = progress * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(f));
    const k = f - i;
    if (pts.length < 2) return {x: xs(0, 1), y: ys(pts[0].y)};
    return {x: xs(i, pts.length) + (xs(i + 1, pts.length) - xs(i, pts.length)) * k, y: ys(pts[i].y) + (ys(pts[i + 1].y) - ys(pts[i].y)) * k};
  };
  const series = (pts: Point[], key: string, progress: number, label: string | undefined, id: string) => {
    const [lo, hi, halo] = gradOf(key);
    const hd = head(pts, progress);
    return (
      <g>
        <defs>
          <linearGradient id={`area${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hi} stopOpacity={0.32} />
            <stop offset="100%" stopColor={hi} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`stroke${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={lo} />
            <stop offset="100%" stopColor={hi} />
          </linearGradient>
          <clipPath id={`clip${id}`}>
            <rect x={-20} y={-100} width={hd.x + 20} height={H + 200} />
          </clipPath>
        </defs>
        <path d={`${path(pts)} L ${xs(pts.length - 1, pts.length)} ${H} L ${xs(0, pts.length)} ${H} Z`} fill={`url(#area${id})`} clipPath={`url(#clip${id})`} />
        <path d={path(pts)} fill="none" stroke={hi} strokeOpacity={0.5} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#clip${id})`} style={{filter: 'blur(14px)'}} />
        <path d={path(pts)} fill="none" stroke={`url(#stroke${id})`} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#clip${id})`} />
        {pts.map((p, i) => {
          const at = pts.length === 1 ? 0 : i / (pts.length - 1);
          const local = (progress - at) * (pts.length - 1) * 2.2;
          if (local < 0) return null;
          const pop = Math.min(1, local);
          const ring = Math.min(1, local / 1.6);
          return (
            <g key={i}>
              <circle cx={xs(i, pts.length)} cy={ys(p.y)} r={10 + ring * 34} fill="none" stroke={hi} strokeOpacity={0.6 * (1 - ring)} strokeWidth={2} />
              <circle cx={xs(i, pts.length)} cy={ys(p.y)} r={11 * pop} fill={C.ink} stroke={hi} strokeWidth={5} />
              <text x={xs(i, pts.length)} y={ys(p.y) - 34} fill={C.paper} opacity={pop} fontFamily={FONT.mono} fontSize={30} fontWeight={600} textAnchor="middle">
                {p.label ?? `${prefix}${formatNumber(p.y, decimals)}${suffix}`}
              </text>
            </g>
          );
        })}
        {progress > 0 && progress < 1 ? <circle cx={hd.x} cy={hd.y} r={16} fill={C.goldLight} style={{filter: `drop-shadow(0 0 18px ${halo}) drop-shadow(0 0 30px ${hi})`}} /> : null}
        {label && progress > 0.98 ? (
          <text x={W + 34} y={ys(pts[pts.length - 1].y) + 12} fill={hi} fontFamily={FONT.title} fontWeight={800} fontSize={34} letterSpacing={1}>
            {label}
          </text>
        ) : null}
      </g>
    );
  };
  return (
    <Frame title={title} source={source}>
      <svg width={W + 280} height={H + 100} style={{overflow: 'visible', marginTop: 50}}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={0} x2={W * grid} y1={H - g * H} y2={H - g * H} stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
        ))}
        <line x1={0} y1={H} x2={W * grid} y2={H} stroke="rgba(240,181,78,0.55)" strokeWidth={2} />
        {points.map((p, i) => (
          <text key={i} x={xs(i, points.length)} y={H + 58} fill={C.paper} opacity={0.7 * grid} fontFamily={FONT.mono} fontSize={26} letterSpacing={2} textAnchor="middle">
            {p.x}
          </text>
        ))}
        {series(points, color, draw, name, 'a')}
        {compare ? series(compare.points, compare.color ?? 'teal', drawCompare, compare.name, 'b') : null}
      </svg>
    </Frame>
  );
};

// ---------- Liste de cartes ----------
type Item = {label: string; sub?: string; highlight?: boolean; icon?: string};
export const List: React.FC<{title: string; items: Item[]; stagger?: number; start?: number; columns?: number; source?: string}> = ({title, items, stagger = 1.2, start = 0.4, columns = 2, source}) => (
  <Frame title={title} source={source}>
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '30px 44px', perspective: 1600}}>
      {items.map((item, i) => (
        <ListItem key={i} item={item} index={i} delay={start + i * stagger} />
      ))}
    </div>
  </Frame>
);

const ListItem: React.FC<{item: Item; index: number; delay: number}> = ({item, index, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay * fps, fps, config: {damping: 20, mass: 0.8}});
  const q = Math.min(1, Math.max(0, p));
  const accent = item.highlight ? 'rgba(240,181,78,0.65)' : undefined;
  return (
    <div
      style={{
        ...glass(accent),
        padding: '28px 36px',
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        opacity: q,
        transform: `translateY(${(1 - p) * 60}px) rotateX(${(1 - p) * 35}deg)`,
        filter: q < 0.97 ? `blur(${(1 - q) * 8}px)` : undefined,
      }}
    >
      <div style={{fontFamily: FONT.mono, fontSize: 26, color: item.highlight ? C.gold : C.mute, letterSpacing: 2}}>{String(index + 1).padStart(2, '0')}</div>
      {item.icon && (icons as Record<string, unknown>)[item.icon] ? <IconDraw name={item.icon} size={52} delay={delay} uid={`li${index}${item.icon}`} color={item.highlight ? C.gold : C.paper} /> : null}
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 44, color: item.highlight ? C.goldLight : C.paper, letterSpacing: -0.5, textShadow: item.highlight ? '0 0 30px rgba(240,181,78,0.4)' : undefined}}>
          {item.label}
        </div>
        {item.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 28, color: C.paper, opacity: 0.75, marginTop: 8}}>{item.sub}</div> : null}
      </div>
    </div>
  );
};

// ---------- Ligne de temps ----------
type Event = {date: string; text: string; color?: string};
export const Timeline: React.FC<{title: string; events: Event[]; stagger?: number; source?: string}> = ({title, events, stagger = 1.6, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const line = interpolate(frame, [0.2 * fps, (0.4 + stagger * (events.length - 1)) * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 236, height: 3, background: 'rgba(255,255,255,0.08)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 235, height: 5, background: 'linear-gradient(90deg, #A8701E, #FFD27F)', transformOrigin: 'left', transform: `scaleX(${line})`, boxShadow: '0 0 24px rgba(240,181,78,0.6)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'space-between'}}>
        {events.map((e, i) => (
          <TimelineEvent key={i} event={e} delay={0.4 + i * stagger} />
        ))}
      </div>
    </Frame>
  );
};

const TimelineEvent: React.FC<{event: Event; delay: number}> = ({event, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = useEnter(delay);
  const ring = interpolate(frame, [delay * fps, (delay + 1.2) * fps], [0, 1], clamp);
  const [, hi, halo] = gradOf(event.color ?? 'amber');
  return (
    <div style={{width: 440, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <div style={{...fade(p), fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, color: hi, height: 80, textShadow: `0 0 26px ${halo}`}}>{event.date}</div>
      <div style={{position: 'relative', width: 34, height: 34, marginTop: 14}}>
        <div style={{position: 'absolute', inset: -40 * ring, borderRadius: '50%', border: `2px solid ${hi}`, opacity: (1 - ring) * 0.8}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.ink, border: `5px solid ${hi}`, transform: `scale(${Math.min(1, p)})`, boxShadow: `0 0 26px ${halo}`}} />
      </div>
      <div style={{...fade(useEnter(delay + 0.2)), fontFamily: FONT.title, fontWeight: 400, fontSize: 34, color: C.paper, marginTop: 40, lineHeight: 1.3}}>
        <RevealWords text={event.text} delay={delay + 0.2} stagger={0.04} />
      </div>
    </div>
  );
};

// ---------- Tuiles à icônes (activités, acteurs, régions), avec mise en avant éventuelle ----------
type Tile = {icon: string; label: string; sub?: string; value?: string; color?: string};
export const Tiles: React.FC<{title?: string; kicker?: string; items: Tile[]; focus?: number; stagger?: number; start?: number; source?: string}> = ({
  title,
  kicker,
  items,
  focus,
  stagger = 0.35,
  start = 0.2,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const focusP = focus === undefined ? 0 : spring({frame: frame - (start + items.length * stagger + 0.2) * fps, fps, config: {damping: 200}});
  const n = items.length;
  const w = Math.min(420, (1620 - (n - 1) * 36) / n);
  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', top: title ? -10 : 40, left: 0}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, perspective: 1800}}>
        {items.map((it, i) => {
          const delay = start + i * stagger;
          const p = spring({frame: frame - delay * fps, fps, config: {damping: 18, mass: 0.8}});
          const q = Math.min(1, Math.max(0, p));
          const isFocus = focus === i;
          const dim = focus !== undefined && !isFocus ? focusP : 0;
          const [, hi, halo] = gradOf(it.color ?? 'amber');
          return (
            <div
              key={i}
              style={{
                width: w,
                minHeight: 470,
                padding: '50px 34px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                ...glass(isFocus ? `rgba(240,181,78,${0.3 + 0.5 * focusP})` : undefined),
                opacity: q * (1 - 0.65 * dim),
                transform: `translateY(${(1 - p) * 80}px) rotateY(${(1 - p) * (i - (n - 1) / 2) * -12}deg) scale(${1 + (isFocus ? 0.07 * focusP : -0.05 * dim)})`,
                filter: q < 0.97 ? `blur(${(1 - q) * 8}px)` : dim > 0.05 ? `saturate(${1 - 0.6 * dim})` : undefined,
              }}
            >
              <div style={{position: 'relative', width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30}}>
                <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${halo} 0%, transparent 70%)`, opacity: 0.6}} />
                <div style={{position: 'absolute', inset: 10, borderRadius: '50%', border: `1.5px solid ${hi}55`}} />
                <IconDraw name={it.icon} size={84} delay={delay + 0.1} color={hi} uid={`tile${i}${it.icon}${n}`} />
              </div>
              <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: w > 360 ? 42 : 36, color: C.paper, letterSpacing: -0.5, lineHeight: 1.1}}>{it.label}</div>
              {it.value ? (
                <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 52, marginTop: 18, ...glowText(it.color ?? 'amber')}}>
                  <Odometer text={it.value} delay={delay + 0.2} />
                </div>
              ) : null}
              {it.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 26, color: C.paper, opacity: 0.75, marginTop: 14, lineHeight: 1.3}}>{it.sub}</div> : null}
            </div>
          );
        })}
      </div>
    </Frame>
  );
};

// ---------- Citation ----------
export const Quote: React.FC<{text: string; by: string; source?: string}> = ({text, by, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mark = spring({frame, fps, config: {damping: 14}});
  const words = text.split(/\s+/).length;
  const pBy = useEnter(0.4 + words * 0.08);
  return (
    <Frame source={source}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: FONT.display, fontSize: 360, lineHeight: 0.6, height: 170, ...glowText('amber'), opacity: Math.min(1, mark), transform: `scale(${0.6 + 0.4 * mark})`}}>“</div>
        <div style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: 140, lineHeight: 1.05, color: C.paper, maxWidth: 1500}}>
          <RevealWords text={text} delay={0.3} stagger={0.09} />
        </div>
        <div style={{...fade(pBy), marginTop: 50}}>
          <Kicker text={by} delay={0.4 + words * 0.08} />
        </div>
      </div>
    </Frame>
  );
};
