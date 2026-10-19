import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, Highlight, fade, formatNumber, useEnter} from './common';

const colorOf = (name?: string) => (name ? (C as Record<string, string>)[name] ?? name : C.teal);

// Grande phrase centrée, avec mots en ambre entre *astérisques*.
export const Statement: React.FC<{kicker?: string; text: string; sub?: string; source?: string}> = ({
  kicker,
  text,
  sub,
  source,
}) => {
  const p = useEnter(0);
  const p2 = useEnter(0.5);
  return (
    <Frame source={source}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        {kicker ? (
          <div style={{...fade(p), fontFamily: FONT.mono, fontSize: 34, color: C.amber, letterSpacing: 4, marginBottom: 30}}>
            {kicker.toUpperCase()}
          </div>
        ) : null}
        <div style={{...fade(p), fontFamily: FONT.title, fontWeight: 900, fontSize: 96, lineHeight: 1.08, color: C.paper, maxWidth: 1550}}>
          <Highlight text={text} />
        </div>
        {sub ? (
          <div style={{...fade(p2), fontFamily: FONT.title, fontWeight: 400, fontSize: 44, color: C.paper, opacity: 0.8 * p2, marginTop: 40, maxWidth: 1400}}>
            <Highlight text={sub} />
          </div>
        ) : null}
      </div>
    </Frame>
  );
};

// Un ou deux grands chiffres qui défilent jusqu'à leur valeur.
type Num = {value: number; prefix?: string; suffix?: string; decimals?: number; label: string; color?: string};
export const BigNumbers: React.FC<{title?: string; items: Num[]; source?: string}> = ({title, items, source}) => {
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        {items.map((item, i) => (
          <NumberItem key={i} item={item} delay={i * 0.9} />
        ))}
      </div>
    </Frame>
  );
};

const NumberItem: React.FC<{item: Num; delay: number}> = ({item, delay}) => {
  const p = useEnter(delay);
  const count = useEnter(delay, 60);
  const v = item.value * Math.min(1, count);
  return (
    <div style={{...fade(p), textAlign: 'center'}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 150, color: colorOf(item.color ?? 'amber')}}>
        {item.prefix ?? ''}
        {formatNumber(v, item.decimals ?? 0)}
        {item.suffix ?? ''}
      </div>
      <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 40, color: C.paper, marginTop: 10, maxWidth: 700}}>
        {item.label}
      </div>
    </div>
  );
};

// Barres verticales animées ; les valeurs négatives descendent sous la ligne de base.
type Bar = {label: string; value: number; color?: string; note?: string};
const CHART_H = 640;
export const Bars: React.FC<{
  title: string;
  bars: Bar[];
  prefix?: string;
  suffix?: string;
  decimals?: number;
  max?: number;
  stagger?: number;
  source?: string;
}> = ({title, bars, prefix = '', suffix = '', decimals = 0, max, stagger = 0.35, source}) => {
  const posMax = Math.max(0, ...bars.map((b) => b.value));
  const negMax = Math.max(0, ...bars.map((b) => -b.value));
  const span = (max ?? posMax + negMax) * 1.15;
  const posH = (posMax / span) * CHART_H + (negMax ? 60 : 0);
  const negH = (negMax / span) * CHART_H + (negMax ? 60 : 0);
  const n = bars.length;
  const width = Math.min(220, 1400 / n - 30);
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, height: posH + negH}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: posH, borderTop: `3px solid ${C.slate}`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
          {bars.map((bar, i) => (
            <BarItem key={i} bar={bar} scale={CHART_H / span} base={posH} width={width} delay={0.3 + i * stagger}
              prefix={prefix} suffix={suffix} decimals={decimals} labelBelow={negMax > 0 ? posH + negH + 20 : posH + 18} />
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
  const p = useEnter(delay, 30);
  const grow = Math.max(0, Math.min(1.05, p));
  const h = grow * Math.abs(bar.value) * scale;
  const neg = bar.value < 0;
  const valueText = (
    <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: width > 150 ? 38 : 30, color: C.paper, opacity: Math.min(1, p), whiteSpace: 'nowrap', textAlign: 'center'}}>
      {bar.value < 0 ? '−' : ''}
      {prefix}
      {formatNumber(Math.abs(bar.value) * Math.min(1, p), decimals)}
      {suffix}
    </div>
  );
  return (
    <div style={{position: 'relative', width}}>
      {neg ? (
        <>
          <div style={{position: 'absolute', top: base, left: 0, width, height: h, background: colorOf(bar.color), borderRadius: '0 0 6px 6px'}} />
          <div style={{position: 'absolute', top: base - 56, left: -40, right: -40}}>{valueText}</div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', top: base - h, left: 0, width, height: h, background: colorOf(bar.color), borderRadius: '6px 6px 0 0'}} />
          <div style={{position: 'absolute', top: base - h - 54, left: -40, right: -40}}>{valueText}</div>
        </>
      )}
      <div style={{position: 'absolute', top: labelBelow, left: -60, right: -60, textAlign: 'center', fontFamily: FONT.mono, fontSize: 28, color: C.paper, opacity: 0.85, whiteSpace: 'nowrap'}}>
        {bar.label}
      </div>
      {bar.note ? (
        <div style={{position: 'absolute', top: labelBelow + 40, left: -80, right: -80, textAlign: 'center', fontFamily: FONT.title, fontSize: 24, color: C.amber, whiteSpace: 'nowrap'}}>{bar.note}</div>
      ) : null}
    </div>
  );
};

// Barre horizontale empilée (répartition d'un total).
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
  return (
    <Frame title={title} source={source}>
      <div style={{...fade(pTotal), fontFamily: FONT.mono, fontSize: 64, color: C.amber, marginBottom: 50}}>{total}</div>
      <div style={{display: 'flex', height: 170, width: '100%', gap: 6}}>
        {parts.map((part, i) => (
          <StackPart key={i} part={part} share={part.value / sum} delay={0.6 + i * 0.9} />
        ))}
      </div>
      <div style={{display: 'flex', width: '100%', gap: 6, marginTop: 30}}>
        {parts.map((part, i) => (
          <StackLabel key={i} part={part} share={part.value / sum} delay={0.6 + i * 0.9} prefix={prefix} suffix={suffix} decimals={decimals} />
        ))}
      </div>
    </Frame>
  );
};

const StackPart: React.FC<{part: Part; share: number; delay: number}> = ({part, share, delay}) => {
  const p = useEnter(delay, 40);
  return (
    <div style={{width: `${share * 100}%`, display: 'flex'}}>
      <div style={{width: `${Math.min(1, p) * 100}%`, background: colorOf(part.color), borderRadius: 6}} />
    </div>
  );
};

const StackLabel: React.FC<{part: Part; share: number; delay: number; prefix: string; suffix: string; decimals: number}> = ({
  part,
  share,
  delay,
  prefix,
  suffix,
  decimals,
}) => {
  const p = useEnter(delay + 0.3);
  return (
    <div style={{...fade(p), width: `${share * 100}%`, minWidth: 0}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 46, color: colorOf(part.color)}}>
        {prefix}
        {formatNumber(part.value, decimals)}
        {suffix}
      </div>
      <div style={{fontFamily: FONT.title, fontSize: 30, color: C.paper, marginTop: 8, lineHeight: 1.2}}>{part.label}</div>
    </div>
  );
};

// Courbe qui se dessine, avec points et valeurs.
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
  source?: string;
}> = ({title, points, compare, name, prefix = '', suffix = '', decimals = 0, min = 0, max, color = 'amber', source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 1560;
  const H = 560;
  const all = [...points, ...(compare?.points ?? [])].map((p) => p.y);
  const top = max ?? Math.max(...all) * 1.15;
  const xs = (i: number, n: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const ys = (v: number) => H - ((v - min) / (top - min)) * H;
  const draw = interpolate(frame, [0.4 * fps, 3.2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const drawCompare = interpolate(frame, [3.4 * fps, 5.6 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const path = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${xs(i, pts.length)} ${ys(p.y)}`).join(' ');
  const series = (pts: Point[], col: string, progress: number, label?: string) => (
    <g>
      <path d={path(pts)} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
      {pts.map((p, i) => {
        const visible = progress >= (pts.length === 1 ? 0 : i / (pts.length - 1)) - 0.001;
        return visible ? (
          <g key={i}>
            <circle cx={xs(i, pts.length)} cy={ys(p.y)} r={13} fill={col} />
            <text x={xs(i, pts.length)} y={ys(p.y) - 30} fill={C.paper} fontFamily={FONT.mono} fontSize={30} fontWeight={600} textAnchor="middle">
              {p.label ?? `${prefix}${formatNumber(p.y, decimals)}${suffix}`}
            </text>
          </g>
        ) : null;
      })}
      {label && progress > 0.98 ? (
        <text x={W + 30} y={ys(pts[pts.length - 1].y) + 10} fill={col} fontFamily={FONT.title} fontWeight={800} fontSize={34}>
          {label}
        </text>
      ) : null}
    </g>
  );
  return (
    <Frame title={title} source={source}>
      <svg width={W + 260} height={H + 90} style={{overflow: 'visible', marginTop: 40}}>
        <line x1={0} y1={H} x2={W} y2={H} stroke={C.slate} strokeWidth={3} />
        {points.map((p, i) => (
          <text key={i} x={xs(i, points.length)} y={H + 55} fill={C.paper} opacity={0.8} fontFamily={FONT.mono} fontSize={28} textAnchor="middle">
            {p.x}
          </text>
        ))}
        {series(points, colorOf(color), draw, name)}
        {compare ? series(compare.points, colorOf(compare.color ?? 'teal'), drawCompare, compare.name) : null}
      </svg>
    </Frame>
  );
};

// Liste d'éléments qui apparaissent un par un (objectifs, étapes, faits).
type Item = {label: string; sub?: string; highlight?: boolean; icon?: string};
export const List: React.FC<{title: string; items: Item[]; stagger?: number; columns?: number; source?: string}> = ({
  title,
  items,
  stagger = 1.2,
  columns = 2,
  source,
}) => (
  <Frame title={title} source={source}>
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '34px 60px'}}>
      {items.map((item, i) => (
        <ListItem key={i} item={item} delay={0.4 + i * stagger} />
      ))}
    </div>
  </Frame>
);

const ListItem: React.FC<{item: Item; delay: number}> = ({item, delay}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        ...fade(p),
        background: item.highlight ? 'rgba(242,163,58,0.14)' : C.navyLight,
        border: `3px solid ${item.highlight ? C.amber : 'transparent'}`,
        borderRadius: 14,
        padding: '26px 34px',
      }}
    >
      <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 46, color: item.highlight ? C.amber : C.paper}}>
        {item.icon ? <span style={{marginRight: 18}}>{item.icon}</span> : null}
        {item.label}
      </div>
      {item.sub ? <div style={{fontFamily: FONT.title, fontSize: 28, color: C.paper, opacity: 0.75, marginTop: 8}}>{item.sub}</div> : null}
    </div>
  );
};

// Ligne de temps horizontale.
type Event = {date: string; text: string; color?: string};
export const Timeline: React.FC<{title: string; events: Event[]; stagger?: number; source?: string}> = ({title, events, stagger = 1.6, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const line = interpolate(frame, [0.2 * fps, (0.2 + stagger * events.length) * fps], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, height: 6, background: C.slate, transformOrigin: 'left', transform: `scaleX(${line})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'space-between'}}>
        {events.map((e, i) => (
          <TimelineEvent key={i} event={e} delay={0.4 + i * stagger} />
        ))}
      </div>
    </Frame>
  );
};

const TimelineEvent: React.FC<{event: Event; delay: number}> = ({event, delay}) => {
  const p = useEnter(delay);
  return (
    <div style={{...fade(p), width: 420, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, color: colorOf(event.color ?? 'amber'), height: 80}}>{event.date}</div>
      <div style={{width: 30, height: 30, borderRadius: 15, background: colorOf(event.color ?? 'amber'), marginTop: 15}} />
      <div style={{fontFamily: FONT.title, fontSize: 34, color: C.paper, marginTop: 40, lineHeight: 1.25}}>
        <Highlight text={event.text} />
      </div>
    </div>
  );
};
