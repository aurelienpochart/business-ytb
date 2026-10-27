import React from 'react';
import {Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GOLD_TEXT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter, useLayout} from './common';
import {Kicker, Odometer, RevealWords} from './fx';
import {useMedia} from './media';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const unit = (p: number) => Math.min(1, Math.max(0, p));

// Délai d'apparition de l'étape k (k = 0 : billet ; puis une tranche par part, la part ajoutée, le résultat).
// Les étapes déjà « montrées » (< shown) sont affichées d'emblée ; les suivantes s'animent à leur délai.
const stepDelay = (k: number, shown: number, delays?: number[], stagger = 1.2, start = 0.35) =>
  k < shown ? -10 : delays?.[k - shown] ?? start + (k - shown) * stagger;

// ---------- Cascade d'un billet ----------
// Un billet stylisé (pas une reproduction) se découpe en tranches proportionnelles à leur valeur ; chaque tranche
// descend sur sa ligne, en gardant sa place, avec sa valeur à droite. Une part « ajoutée » vient se coller à côté
// de la dernière tranche (ex. les cotisations), puis un résultat peut regrouper les deux.
type CascadePart = {label: string; value: number; display: string; color?: string; sub?: string};
export const Cascade: React.FC<{
  title?: string;
  total: {label: string; display: string; value?: number; sub?: string};
  parts: CascadePart[];
  extra?: CascadePart; // part ajoutée à côté de la dernière tranche
  result?: {label: string; display: string; sub?: string}; // regroupe la dernière tranche et la part ajoutée
  shown?: number; // étapes déjà visibles au début du plan
  show?: number; // étapes visibles à la fin du plan (défaut : toutes)
  delays?: number[]; // délais des étapes animées (shown, shown+1, ...)
  stagger?: number;
  start?: number;
  focus?: 'extra' | 'result' | number; // élément mis en avant (pulsation)
  source?: string;
}> = ({title, total, parts, extra, result, shown = 0, show, delays, stagger, start, focus, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const P = L.portrait;
  const steps = 1 + parts.length + (extra ? 1 : 0) + (result ? 1 : 0);
  const last = Math.min(steps, show ?? steps);
  const sum = total.value ?? parts.reduce((a, b) => a + b.value, 0);
  // Géométrie : largeur du billet, colonne des libellés à droite.
  const BW = P ? 480 : 860;
  const BH = P ? 150 : 132;
  const RH = P ? 116 : 96;
  const GAP = P ? 28 : 18;
  const LABEL = P ? 510 : 910;
  const RIGHT = P ? 980 : 1700;
  const rowY = (r: number) => (r === 0 ? 0 : BH + GAP + (r - 1) * (RH + GAP));
  const xs: number[] = [];
  let acc = 0;
  for (const p of parts) {
    xs.push((acc / sum) * BW);
    acc += p.value;
  }
  const wOf = (v: number) => Math.max(P ? 9 : 10, (v / sum) * BW);
  const delayOf = (k: number) => stepDelay(k, shown, delays, stagger, start);
  const prog = (k: number, damping = 18) => (k >= last ? 0 : spring({frame: frame - delayOf(k) * fps, fps, config: {damping, mass: 0.9, stiffness: 90}}));
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 3.2);
  const lastRow = parts.length; // ligne de la dernière tranche
  const extraRow = parts.length + 1; // la part ajoutée descend sur sa propre ligne, à droite de la dernière tranche
  const resultRow = parts.length + (extra ? 2 : 1);
  const pBill = prog(0, 200);

  // Billet stylisé dessiné à la taille BW x BH ; chaque tranche en montre la portion [x, x + w].
  const Bill: React.FC<{x: number; w: number; tint?: string; strength?: number}> = ({x, w, tint, strength = 0}) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: '100%', overflow: 'hidden', borderRadius: 6}}>
      <div style={{position: 'absolute', left: -x, top: '50%', width: BW, height: BH, transform: 'translateY(-50%)'}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #3A4A3C 0%, #233126 55%, #18221A 100%)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(115deg, rgba(255,231,176,0.05) 0 2px, transparent 2px 9px), repeating-linear-gradient(65deg, rgba(255,231,176,0.04) 0 2px, transparent 2px 11px)'}} />
        <div style={{position: 'absolute', inset: P ? 8 : 10, border: '2px solid rgba(240,181,78,0.55)', borderRadius: 6}} />
        <div style={{position: 'absolute', inset: P ? 14 : 18, border: '1px solid rgba(240,181,78,0.25)', borderRadius: 4}} />
        {[0, 1].map((side) => (
          <div key={side} style={{position: 'absolute', top: 0, bottom: 0, [side ? 'right' : 'left']: P ? 22 : 34, display: 'flex', alignItems: 'center', fontFamily: FONT.display, fontSize: P ? 84 : 104, lineHeight: 1, backgroundImage: GOLD_TEXT, backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
            100
          </div>
        ))}
        <div style={{position: 'absolute', left: BW / 2 - BH * 0.36, top: BH * 0.14, width: BH * 0.72, height: BH * 0.72, borderRadius: '50%', border: '2px solid rgba(240,181,78,0.5)', background: 'radial-gradient(circle at 40% 35%, rgba(255,231,176,0.18), rgba(0,0,0,0.25))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: P ? 14 : 20, textAlign: 'center', fontFamily: FONT.mono, fontSize: P ? 13 : 17, letterSpacing: P ? 4 : 7, color: 'rgba(255,231,176,0.75)'}}>ONE HUNDRED DOLLARS</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: P ? 14 : 20, textAlign: 'center', fontFamily: FONT.mono, fontSize: P ? 12 : 15, letterSpacing: P ? 4 : 6, color: 'rgba(255,231,176,0.55)'}}>SPENT AT THE CHECKOUT</div>
        {tint ? <div style={{position: 'absolute', inset: 0, background: tint, opacity: strength, mixBlendMode: 'hard-light'}} /> : null}
      </div>
    </div>
  );

  const Label: React.FC<{row: number; display: string; label: string; sub?: string; color?: string; p: number; delay: number; big?: boolean}> = ({row, display, label, sub, color, p, delay, big}) => {
    const [, hi, halo] = gradOf(color ?? 'amber');
    const h = row === 0 ? BH : RH;
    return (
      <div style={{position: 'absolute', left: LABEL, top: rowY(row), height: h, width: RIGHT - LABEL, display: 'flex', flexDirection: 'column', justifyContent: 'center', ...fade(p)}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: P ? 0 : 20, flexDirection: P ? 'column' : 'row'}}>
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? (big ? 80 : 70) : big ? 66 : 58, letterSpacing: -1.5, color: hi, textShadow: `0 0 30px ${halo}`, whiteSpace: 'nowrap'}}>
            <Odometer text={display} delay={delay + 0.1} />
          </div>
          <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: P ? 34 : 31, color: C.paper, lineHeight: 1.15, marginTop: P ? 2 : 0, whiteSpace: P ? 'normal' : 'nowrap'}}>{label}</div>
        </div>
        {sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: P ? 27 : 25, color: C.paper, opacity: 0.75, marginTop: 4, lineHeight: 1.2, whiteSpace: P ? 'normal' : 'nowrap'}}>{sub}</div> : null}
      </div>
    );
  };

  // Lignes pointillées de guidage, de la tranche à son libellé.
  const leader = (row: number, x0: number, p: number, color?: string) => {
    const y = rowY(row) + (row === 0 ? BH : RH) / 2;
    const [, hi] = gradOf(color ?? 'amber');
    return <div key={`l${row}`} style={{position: 'absolute', left: x0 + 14, top: y - 1, width: Math.max(0, (LABEL - 24 - x0 - 14) * unit(p)), height: 2, backgroundImage: `linear-gradient(90deg, ${hi}aa 50%, transparent 50%)`, backgroundSize: '10px 2px', opacity: 0.7}} />;
  };

  const H = rowY(result ? resultRow : extra ? extraRow : parts.length) + RH;
  const pExtra = extra ? prog(1 + parts.length) : 0;
  const pResult = result ? prog(1 + parts.length + (extra ? 1 : 0), 200) : 0;
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 0, right: 0, top: P ? Math.max(0, (L.height - 160 - H) / 2) : Math.max(0, (700 - H) / 2), height: H}}>
        {/* Billet : la partie encore « dans le billet » s'estompe à mesure que les tranches descendent */}
        <div style={{position: 'absolute', left: 0, top: 0, width: BW, height: BH, borderRadius: 8, boxShadow: '0 30px 70px rgba(0,0,0,0.5), 0 0 60px rgba(240,181,78,0.12)', opacity: unit(pBill), transform: `translateY(${(1 - pBill) * -40}px)`}}>
          {parts.map((part, i) => {
            const pi = prog(1 + i);
            return (
              <div key={i} style={{position: 'absolute', left: xs[i], top: 0, height: BH, width: wOf(part.value), opacity: 1 - 0.78 * unit(pi)}}>
                <Bill x={xs[i]} w={wOf(part.value)} />
              </div>
            );
          })}
          <div style={{position: 'absolute', inset: 0, borderRadius: 8, border: '1.5px solid rgba(255,231,176,0.35)'}} />
        </div>
        <Label row={0} display={total.display} label={total.label} sub={total.sub} color="paper" p={pBill} delay={delayOf(0)} big />
        {/* Tranches */}
        {parts.map((part, i) => {
          const k = 1 + i;
          const p = prog(k);
          if (k >= last) return null;
          const [lo, hi, halo] = gradOf(part.color ?? 'slate');
          const isFocus = focus === i;
          const y = interpolate(p, [0, 1], [0, rowY(1 + i)]);
          const w = wOf(part.value);
          return (
            <React.Fragment key={i}>
              {leader(1 + i, xs[i] + w, interpolate(frame, [(delayOf(k) + 0.4) * fps, (delayOf(k) + 1) * fps], [0, 1], clamp), part.color)}
              <div
                style={{
                  position: 'absolute',
                  left: xs[i],
                  top: y,
                  width: w,
                  height: interpolate(unit(p), [0, 1], [BH, RH]),
                  borderRadius: 6,
                  opacity: unit(p * 3),
                  boxShadow: `0 0 ${40 + (isFocus ? 30 * pulse : 0)}px ${halo}, 0 18px 40px rgba(0,0,0,0.45)`,
                  outline: `1.5px solid ${hi}`,
                }}
              >
                <Bill x={xs[i]} w={w} tint={`linear-gradient(180deg, ${hi}, ${lo})`} strength={0.85 * unit(p)} />
              </div>
              <Label row={1 + i} display={part.display} label={part.label} sub={part.sub} color={part.color ?? 'slate'} p={prog(k, 200)} delay={delayOf(k)} />
            </React.Fragment>
          );
        })}
        {/* Part ajoutée : sa propre ligne, juste à droite de la dernière tranche, avec son libellé sur la même ligne */}
        {extra && 1 + parts.length < last ? (() => {
          const k = 1 + parts.length;
          const [lo, hi, halo] = gradOf(extra.color ?? 'amber');
          const x = BW;
          const w = wOf(extra.value);
          const isFocus = focus === 'extra';
          return (
            <>
              {leader(extraRow, x + w, interpolate(frame, [(delayOf(k) + 0.4) * fps, (delayOf(k) + 1) * fps], [0, 1], clamp), extra.color ?? 'amber')}
              <div
                style={{
                  position: 'absolute',
                  left: x + interpolate(unit(pExtra), [0, 1], [P ? 260 : 420, 0]),
                  top: rowY(extraRow),
                  width: w,
                  height: RH,
                  borderRadius: 6,
                  opacity: unit(pExtra * 2),
                  background: `linear-gradient(180deg, ${hi}, ${lo})`,
                  boxShadow: `0 0 ${50 + (isFocus ? 40 * pulse : 0)}px ${halo}, inset 0 2px 0 rgba(255,255,255,0.4)`,
                }}
              />
              <div style={{position: 'absolute', left: x - 40, top: rowY(extraRow), height: RH, width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.title, fontWeight: 800, fontSize: P ? 40 : 44, color: hi, opacity: unit(pExtra), textShadow: `0 0 16px ${halo}`}}>+</div>
              <Label row={extraRow} display={`+ ${extra.display}`} label={extra.label} sub={extra.sub} color={extra.color ?? 'amber'} p={prog(k, 200)} delay={delayOf(k)} />
            </>
          );
        })() : null}
        {/* Résultat : la dernière tranche et la part ajoutée réunies */}
        {result && 1 + parts.length + (extra ? 1 : 0) < last ? (() => {
          const x0 = xs[parts.length - 1];
          const w = BW + (extra ? wOf(extra.value) : 0) - x0;
          const k = 1 + parts.length + (extra ? 1 : 0);
          const isFocus = focus === 'result';
          return (
            <>
              <div style={{position: 'absolute', left: x0, top: rowY(resultRow), width: w, height: RH, borderRadius: 6, opacity: unit(pResult), transform: `translateY(${(1 - pResult) * -50}px)`, backgroundImage: GOLD_TEXT, backgroundSize: '300% 100%', boxShadow: `0 0 ${60 + (isFocus ? 40 * pulse : 0)}px rgba(240,181,78,0.6)`}} />
              <div style={{position: 'absolute', left: LABEL, top: rowY(resultRow), height: RH, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: RIGHT - LABEL, ...fade(pResult)}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: P ? 0 : 20, flexDirection: P ? 'column' : 'row'}}>
                  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? 64 : 66, letterSpacing: -1.5, color: C.goldLight, textShadow: '0 0 34px rgba(240,181,78,0.6)', whiteSpace: 'nowrap'}}>
                    <Odometer text={`= ${result.display}`} delay={delayOf(k) + 0.1} />
                  </div>
                  <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: P ? 28 : 31, color: C.paper, whiteSpace: P ? 'normal' : 'nowrap'}}>{result.label}</div>
                </div>
                {result.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: P ? 24 : 25, color: C.paper, opacity: 0.75, marginTop: 4, whiteSpace: P ? 'normal' : 'nowrap'}}>{result.sub}</div> : null}
              </div>
            </>
          );
        })() : null}
      </div>
    </Frame>
  );
};

// ---------- Ticket de caisse ----------
// Ticket stylisé (illustration, pas un vrai ticket) qui s'imprime ligne par ligne ; un trait de surligneur
// doré marque les lignes `mark`. À gauche, une phrase facultative (kicker + text).
type ReceiptLine = {label: string; value?: string; strong?: boolean; mark?: boolean; rule?: boolean};
export const Receipt: React.FC<{
  header?: string;
  subheader?: string;
  lines: ReceiptLine[];
  shown?: number;
  delays?: number[];
  stagger?: number;
  start?: number;
  kicker?: string;
  text?: string;
  sub?: string;
  footer?: string;
  source?: string;
}> = ({header = 'RECEIPT', subheader, lines, shown = 0, delays, stagger = 0.55, start = 0.5, kicker, text, sub, footer, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const P = useLayout().portrait;
  const W = P ? 760 : 740;
  const lineH = (l: ReceiptLine) => (l.rule ? 28 : l.strong ? (P ? 74 : 78) : P ? 56 : 60);
  const pPaper = useEnter(0.05);
  const delayOf = (i: number) => (i < shown ? -10 : delays?.[i - shown] ?? start + (i - shown) * stagger);
  // Hauteur visible : en-tête + lignes déjà imprimées (le papier « sort » de l'imprimante).
  const headH = P ? 150 : 156;
  let printed = headH;
  lines.forEach((l, i) => {
    const p = spring({frame: frame - delayOf(i) * fps, fps, config: {damping: 200}});
    printed += lineH(l) * unit(p);
  });
  const total = headH + lines.reduce((a, l) => a + lineH(l), 0) + (footer ? 70 : 30);
  const visible = Math.min(total, printed + (footer ? 70 : 30) * unit(spring({frame: frame - (delayOf(lines.length - 1) + 0.4) * fps, fps, config: {damping: 200}})));
  const tilt = Math.sin(frame / fps / 2.2) * 1.2;
  const zig = Array.from({length: 33}, (_, i) => `${(i / 32) * 100}% ${i % 2 ? 100 : 'calc(100% - 14px)'}`).join(', ');
  const word = (text ?? '').replace(/\*/g, '').split(/\s+/).length;
  const pSub = useEnter(0.4 + word * 0.07);
  return (
    <Frame source={source}>
      {text && !P ? (
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 820, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {kicker ? (
            <div style={{marginBottom: 34}}>
              <Kicker text={kicker} />
            </div>
          ) : null}
          <div style={{fontFamily: FONT.display, fontSize: 112, lineHeight: 1.02, color: C.paper, letterSpacing: -1}}>
            <RevealWords text={text} delay={0.15} stagger={0.075} />
          </div>
          {sub ? <div style={{...fade(pSub), fontFamily: FONT.title, fontWeight: 300, fontSize: 38, color: C.paper, opacity: 0.78 * unit(pSub), marginTop: 34, lineHeight: 1.3}}>{sub}</div> : null}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: P ? (940 - W) / 2 : text ? 880 : (1620 - W) / 2,
          top: P ? 10 : Math.max(-40, (790 - total) / 2),
          width: W,
          perspective: 1600,
          opacity: unit(pPaper * 1.5),
        }}
      >
        <div style={{transform: `rotateX(8deg) rotateZ(${-2 + tilt}deg) translateY(${(1 - pPaper) * -80}px)`, transformOrigin: '50% 0%', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(240,181,78,0.12))'}}>
          <div style={{position: 'relative', height: visible, overflow: 'hidden', background: 'linear-gradient(180deg, #F7F3EA 0%, #EFE9DC 100%)', clipPath: `polygon(0 0, 100% 0, ${zig}, 0 calc(100% - 14px))`}}>
            {/* grain du papier thermique */}
            <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 4px)'}} />
            <div style={{position: 'relative', padding: P ? '34px 46px 0' : '30px 44px 0', color: '#1E1B16', fontFamily: FONT.mono}}>
              <div style={{textAlign: 'center', fontWeight: 600, fontSize: P ? 34 : 36, letterSpacing: 8}}>{header}</div>
              {subheader ? <div style={{textAlign: 'center', fontSize: P ? 21 : 22, letterSpacing: 2, marginTop: 10, opacity: 0.7}}>{subheader}</div> : null}
              <div style={{borderTop: '2px dashed rgba(30,27,22,0.45)', margin: P ? '24px 0 10px' : '22px 0 8px'}} />
              {lines.map((l, i) => {
                const d = delayOf(i);
                const p = spring({frame: frame - d * fps, fps, config: {damping: 200}});
                const mark = l.mark ? interpolate(frame, [(d + 0.35) * fps, (d + 0.85) * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 0;
                if (l.rule) return <div key={i} style={{height: lineH(l), display: 'flex', alignItems: 'center', opacity: unit(p)}}><div style={{flex: 1, borderTop: '2px dashed rgba(30,27,22,0.45)'}} /></div>;
                return (
                  <div key={i} style={{position: 'relative', height: lineH(l), display: 'flex', alignItems: 'center', gap: 12, opacity: unit(p), transform: `translateY(${(1 - unit(p)) * -10}px)`}}>
                    {l.mark ? <div style={{position: 'absolute', left: -14, right: -14, top: '18%', bottom: '18%', background: 'linear-gradient(90deg, rgba(240,181,78,0.75), rgba(255,210,127,0.6))', borderRadius: 6, transformOrigin: 'left', transform: `scaleX(${mark}) skewX(-8deg)`}} /> : null}
                    <div style={{position: 'relative', fontSize: l.strong ? (P ? 32 : 34) : P ? 27 : 29, fontWeight: l.strong ? 600 : 400, letterSpacing: 1.5, whiteSpace: 'nowrap'}}>{l.label.toUpperCase()}</div>
                    <div style={{position: 'relative', flex: 1, borderBottom: '2px dotted rgba(30,27,22,0.35)', transform: 'translateY(8px)'}} />
                    <div style={{position: 'relative', fontSize: l.strong ? (P ? 38 : 42) : P ? 27 : 29, fontWeight: 600, whiteSpace: 'nowrap'}}>{l.value ?? ''}</div>
                  </div>
                );
              })}
              {footer ? <div style={{textAlign: 'center', fontSize: P ? 20 : 21, letterSpacing: 4, marginTop: 22, opacity: 0.6}}>{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
};

// ---------- Étiquettes de prix ----------
// Ancien prix barré d'un trait rouge, flèche, nouveau prix en or ; photo ou icône facultative.
type PriceItem = {name: string; sub?: string; from: string; to: string; image?: string};
export const PriceTags: React.FC<{title?: string; kicker?: string; items: PriceItem[]; delays?: number[]; stagger?: number; start?: number; source?: string}> = ({title, kicker, items, delays, stagger = 2.2, start = 0.3, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const P = useLayout().portrait;
  const n = items.length;
  const W = P ? 860 : Math.min(720, (1620 - (n - 1) * 60) / n);
  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', top: P ? 0 : 0, left: 0}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: kicker ? 70 : 0, bottom: 0, display: 'flex', flexDirection: P ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: P ? 40 : 60, perspective: 1800}}>
        {items.map((it, i) => {
          const d = delays?.[i] ?? start + i * stagger;
          const p = spring({frame: frame - d * fps, fps, config: {damping: 18, mass: 0.8}});
          const strike = interpolate(frame, [(d + 0.7) * fps, (d + 1.1) * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const pNew = spring({frame: frame - (d + 1.1) * fps, fps, config: {damping: 14, stiffness: 120}});
          const swing = Math.sin((frame / fps) * 1.3 + i) * 2;
          return (
            <div key={i} style={{width: W, display: 'flex', flexDirection: P ? 'row' : 'column', alignItems: 'center', gap: P ? 36 : 0, padding: P ? '30px 40px' : '40px 40px 46px', ...glass('rgba(240,181,78,0.35)'), opacity: unit(p), transform: `translateY(${(1 - p) * 80}px) rotateZ(${swing * unit(p)}deg) rotateY(${(1 - p) * (i ? -20 : 20)}deg)`, transformOrigin: '50% 0%'}}>
              {it.image ? <PriceImage id={it.image} size={P ? 210 : 250} /> : null}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: P ? 'flex-start' : 'center', flex: P ? 1 : undefined}}>
                <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: P ? 40 : 44, color: C.paper, marginTop: P ? 0 : 26, textAlign: P ? 'left' : 'center', lineHeight: 1.1}}>{it.name}</div>
                {it.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 26, color: C.paper, opacity: 0.75, marginTop: 8}}>{it.sub}</div> : null}
                <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: P ? 18 : 28}}>
                  <div style={{position: 'relative', fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? 50 : 56, color: C.paper, opacity: 1 - 0.45 * strike}}>
                    {it.from}
                    <div style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 6, borderRadius: 3, background: C.brick, boxShadow: `0 0 14px ${C.brick}`, transformOrigin: 'left', transform: `scaleX(${strike}) rotate(-8deg)`}} />
                  </div>
                  <div style={{fontFamily: FONT.title, fontSize: 44, color: C.gold, opacity: unit(pNew)}}>→</div>
                  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? 78 : 86, color: C.goldLight, textShadow: '0 0 36px rgba(240,181,78,0.6)', transform: `scale(${0.6 + 0.4 * unit(pNew)})`, opacity: unit(pNew)}}>{it.to}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
};

const PriceImage: React.FC<{id: string; size: number}> = ({id, size}) => {
  const m = useMedia(id);
  if (!m) return null;
  return (
    <div style={{width: size, height: size, borderRadius: 20, overflow: 'hidden', flexShrink: 0, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.15)'}}>
      <Img src={m.src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.05)'}} />
    </div>
  );
};

// ---------- Densité : surface d'un magasin et nombre de références ----------
// Chaque magasin est un plan au sol dont l'aire est proportionnelle à sa surface ; un carré = `perDot` références.
type DensityItem = {label: string; area: number; count: number; areaLabel: string; countLabel: string; color?: string};
export const Density: React.FC<{title?: string; items: DensityItem[]; perDot: number; legend?: string; delays?: number[]; stagger?: number; start?: number; source?: string}> = ({title, items, perDot, legend, delays, stagger = 3, start = 0.3, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const P = useLayout().portrait;
  const maxArea = Math.max(...items.map((i) => i.area));
  const BIG = P ? {w: 780, h: 330} : {w: 760, h: 430};
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: P ? 'column' : 'row', alignItems: P ? 'center' : 'flex-end', justifyContent: 'center', gap: P ? 50 : 110, paddingBottom: P ? 0 : 60}}>
        {items.map((it, i) => {
          const d = delays?.[i] ?? start + i * stagger;
          const k = Math.sqrt(it.area / maxArea);
          const w = BIG.w * k;
          const h = BIG.h * k;
          const p = spring({frame: frame - d * fps, fps, config: {damping: 200}});
          const dots = Math.max(1, Math.round(it.count / perDot));
          // Grille de carrés répartie sur toute la surface, ordre d'apparition pseudo-aléatoire.
          const cols = Math.max(1, Math.round(Math.sqrt((dots * w) / h)));
          const rows = Math.ceil(dots / cols);
          const size = Math.min(14, (w / cols) * 0.55, (h / rows) * 0.55);
          const [, hi, halo] = gradOf(it.color ?? 'amber');
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: P ? 'center' : 'flex-start', ...fade(p)}}>
              <div style={{position: 'relative', width: w, height: h, borderRadius: 10, ...glass(`${hi}66`), transform: 'perspective(1400px) rotateX(28deg)', transformOrigin: '50% 100%'}}>
                {Array.from({length: dots}, (_, j) => {
                  const c = j % cols;
                  const r = Math.floor(j / cols);
                  const appear = d + 0.5 + random(`dot${i}-${j}`) * 1.6;
                  const q = spring({frame: frame - appear * fps, fps, config: {damping: 14, stiffness: 160}});
                  return <div key={j} style={{position: 'absolute', left: ((c + 0.5) / cols) * w - size / 2, top: ((r + 0.5) / rows) * h - size / 2, width: size, height: size, borderRadius: 2, background: hi, boxShadow: `0 0 10px ${halo}`, opacity: unit(q), transform: `scale(${unit(q)})`}} />;
                })}
              </div>
              <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? 54 : 58, color: hi, textShadow: `0 0 30px ${halo}`, marginTop: P ? 20 : 36}}>
                <Odometer text={it.countLabel} delay={d + 0.4} />
              </div>
              <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: P ? 32 : 34, color: C.paper, marginTop: 8}}>{it.label}</div>
              <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: P ? 26 : 28, color: C.paper, opacity: 0.75, marginTop: 6}}>{it.areaLabel}</div>
            </div>
          );
        })}
      </div>
      {legend ? <div style={{position: 'absolute', right: 0, top: P ? -10 : -20, fontFamily: FONT.mono, fontSize: 22, letterSpacing: 2, color: C.mute, display: 'flex', alignItems: 'center', gap: 12}}><span style={{width: 14, height: 14, borderRadius: 2, background: C.gold, display: 'inline-block'}} />{legend}</div> : null}
    </Frame>
  );
};
