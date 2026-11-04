import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {icons} from 'lucide-react';
import {AMB, C, FONT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter} from './common';
import {GoldText, Kicker, RevealWords} from './fx';
import {Logo} from './media';

// ---------- Gabarit The Question ----------
// Trois blocs propres à ce gabarit :
// - Trails : le tableau de la question. La question en haut, les fausses pistes en cartes, une carte « ? »
//   pour la vraie réponse. Une piste examinée reçoit un tampon (« PARTLY TRUE »), la carte « ? » se retourne
//   sur la réponse au moment voulu. Revient à chaque chapitre, comme le parcours de The Journey.
// - Parcels : un conteneur (droits payés) contre des milliers de petits colis (aucun droit).
// - Chain : une chaîne de maillons (usine → … → client) ; des maillons peuvent être barrés (intermédiaires
//   supprimés) et une ou deux notes peuvent soutenir la chaîne (« financé par… »).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const unit = (p: number) => Math.min(1, Math.max(0, p));
const Ico: React.FC<{name?: string; size: number; color: string; stroke?: number; glow?: string}> = ({name, size, color, stroke = 1.6, glow}) => {
  const I = name ? (icons as Record<string, React.FC<any>>)[name] : undefined;
  return I ? <I size={size} color={color} strokeWidth={stroke} style={glow ? {filter: `drop-shadow(0 0 12px ${glow})`} : undefined} /> : null;
};

type Trail = {label: string; icon?: string; sub?: string};

export const Trails: React.FC<{
  question: string;
  kicker?: string;
  trails: Trail[];
  answer?: Trail;
  current?: number; // piste examinée dans ce plan (−1 : aucune)
  stamped?: number[]; // pistes déjà tamponnées au début du plan
  stampAt?: number; // instant (s) où la piste `current` reçoit son tampon (absent : pas de tampon)
  stampText?: string;
  revealAt?: number; // instant (s) où la carte « ? » se retourne sur `answer`
  revealed?: boolean; // réponse déjà visible au début du plan
  source?: string;
}> = ({question, kicker, trails, answer, current = -1, stamped = [], stampAt, stampText = 'PARTLY TRUE', revealAt, revealed = false, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pQ = useEnter(0.05);
  const cards = [...trails, answer ?? {label: '?'}];
  const n = cards.length;
  const W = 1620;
  const gap = 34;
  const cw = (W - gap * (n - 1)) / n;
  const flip = revealed ? 1 : revealAt !== undefined ? interpolate(t, [revealAt, revealAt + 0.9], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}) : 0;
  return (
    <Frame source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: -20, ...fade(pQ)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: kicker ? 50 : 10, textAlign: 'center', fontFamily: FONT.display, fontSize: 104, lineHeight: 1.04, color: C.paper, letterSpacing: -1}}>
        <RevealWords text={question} delay={0.1} stagger={0.06} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, height: 420, display: 'flex', gap}}>
        {cards.map((c, i) => {
          const isAnswer = i === n - 1;
          const appear = spring({frame: frame - (0.5 + i * 0.18) * fps, fps, config: {damping: 200}});
          const isCur = i === current;
          const wasStamped = stamped.includes(i);
          const stampP = wasStamped ? 1 : isCur && stampAt !== undefined ? spring({frame: frame - stampAt * fps, fps, config: {damping: 11, mass: 0.7}}) : 0;
          const dim = (!isCur && current >= 0 && !isAnswer) || wasStamped ? 0.55 : 1;
          const pulse = isCur ? 0.5 + 0.5 * Math.sin(frame / 9) : 0;
          const showFront = !isAnswer || flip < 0.5;
          const rot = isAnswer ? flip * 180 : 0;
          const ans = isAnswer && flip >= 0.5;
          const accent = ans ? 'rgba(240,181,78,0.75)' : isCur ? 'rgba(240,181,78,0.55)' : undefined;
          return (
            <div key={i} style={{position: 'relative', width: cw, height: 420, opacity: unit(appear) * (ans ? 1 : dim), transform: `translateY(${(1 - unit(appear)) * 40}px) perspective(1400px) rotateY(${rot}deg) scale(${isCur ? 1.04 : 1})`}}>
              {isCur ? <div style={{position: 'absolute', inset: -10 - pulse * 4, borderRadius: 30, border: `2px solid rgba(240,181,78,${0.5 - pulse * 0.25})`, boxShadow: '0 0 50px rgba(240,181,78,0.25)'}} /> : null}
              <div style={{position: 'absolute', inset: 0, ...glass(accent), background: ans ? `radial-gradient(circle at 50% 30%, rgba(255,215,140,0.22), rgba(${AMB.inkRgb},0.85) 75%)` : `linear-gradient(160deg, rgba(255,255,255,0.08), rgba(${AMB.inkRgb},0.75))`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px', transform: ans ? 'rotateY(180deg)' : undefined}}>
                {showFront && isAnswer ? (
                  <div style={{fontFamily: FONT.display, fontSize: 230, color: C.gold, lineHeight: 1, textShadow: '0 0 40px rgba(240,181,78,0.45)', opacity: 0.85 + 0.15 * Math.sin(frame / 12)}}>?</div>
                ) : (
                  <>
                    <div style={{fontFamily: FONT.mono, fontSize: 21, letterSpacing: 5, color: ans ? C.gold : C.mute, marginBottom: 24}}>{ans ? 'THE REAL ANSWER' : `FALSE TRAIL ${i + 1}`}</div>
                    <Ico name={c.icon} size={ans ? 120 : 104} color={ans || isCur ? C.gold : C.paper} glow={ans || isCur ? 'rgba(240,181,78,0.6)' : undefined} />
                    <div style={{marginTop: 26, fontFamily: FONT.title, fontWeight: 800, fontSize: ans ? 46 : 40, lineHeight: 1.1, textAlign: 'center', color: C.paper}}>{ans ? <GoldText>{c.label}</GoldText> : c.label}</div>
                    {c.sub ? <div style={{marginTop: 12, fontFamily: FONT.title, fontWeight: 300, fontSize: 26, lineHeight: 1.25, textAlign: 'center', color: C.paper, opacity: 0.75}}>{c.sub}</div> : null}
                  </>
                )}
              </div>
              {stampP > 0.01 && !isAnswer ? (
                <div style={{position: 'absolute', left: '50%', top: '40%', transform: `translate(-50%,-50%) rotate(-14deg) scale(${interpolate(stampP, [0, 1], [2.2, 1])})`, opacity: unit(stampP * 1.4), padding: '10px 22px', border: `5px solid ${C.brick}`, borderRadius: 12, fontFamily: FONT.mono, fontWeight: 600, fontSize: 36, letterSpacing: 4, color: C.brick, whiteSpace: 'nowrap', background: `rgba(${AMB.inkRgb},0.55)`, boxShadow: `0 0 30px ${C.brick}55`}}>
                  {stampText}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Frame>
  );
};

// ---------- Un conteneur contre des milliers de colis ----------
type Side = {label: string; value: string; sub?: string; color?: string};

export const Parcels: React.FC<{
  title?: string;
  left: Side;
  right: Side;
  count?: number; // petits colis dessinés (défaut 120)
  splitAt?: number; // instant (s) où les colis se dispersent
  source?: string;
}> = ({title, left, right, count = 120, splitAt = 2.2, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pL = useEnter(0.3);
  const pR = useEnter(splitAt - 0.4);
  const spread = interpolate(t, [splitAt, splitAt + 2.4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const Box = icons.Package as React.FC<any>;
  const Container = icons.Container as React.FC<any>;
  const cols = 15;
  const rows = Math.ceil(count / cols);
  const [, lTop, lHalo] = gradOf(left.color ?? 'brick');
  const [, rTop, rHalo] = gradOf(right.color ?? 'teal');
  const Panel: React.FC<{side: Side; top: string; halo: string; p: number; x: number}> = ({side, top, halo, p, x}) => (
    <div style={{position: 'absolute', left: x, top: 470, width: 740, display: 'flex', flexDirection: 'column', alignItems: 'center', ...fade(p)}}>
      <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 5, color: C.mute}}>{side.label.toUpperCase()}</div>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 92, letterSpacing: -2, color: top, textShadow: `0 0 36px ${halo}`, marginTop: 4}}>{side.value}</div>
      {side.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 30, color: C.paper, opacity: 0.8, marginTop: 2, textAlign: 'center'}}>{side.sub}</div> : null}
    </div>
  );
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 810, top: 20, bottom: 40, width: 2, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)'}} />
      <div style={{position: 'absolute', left: 180, top: 40, width: 400, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fade(pL)}}>
        <div style={{position: 'absolute', inset: 30, borderRadius: '50%', background: `radial-gradient(circle, ${lHalo}, transparent 70%)`, opacity: 0.6}} />
        <Container size={300} color={C.paper} strokeWidth={1.1} style={{filter: `drop-shadow(0 0 24px ${lHalo})`}} />
      </div>
      <Panel side={left} top={lTop} halo={lHalo} p={pL} x={60} />
      <div style={{position: 'absolute', left: 880, top: 30, width: 740, height: 400}}>
        {Array.from({length: count}, (_, k) => {
          const c = k % cols;
          const r = Math.floor(k / cols);
          // Départ : tous empilés au centre ; arrivée : grille aérée, légèrement désordonnée.
          const jx = Math.sin(k * 12.9898) * 10;
          const jy = Math.cos(k * 78.233) * 8;
          const gx = (c / (cols - 1)) * 690 + jx;
          const gy = (r / Math.max(1, rows - 1)) * 350 + jy;
          const x = 345 + (gx - 345) * spread;
          const y = 175 + (gy - 175) * spread;
          const d = unit((t - splitAt + 0.3 - (k % 17) * 0.02) * 2);
          return (
            <div key={k} style={{position: 'absolute', left: x - 17, top: y - 17, opacity: 0.25 + 0.75 * d}}>
              <Box size={34} color={rTop} strokeWidth={1.6} />
            </div>
          );
        })}
      </div>
      <Panel side={right} top={rTop} halo={rHalo} p={pR} x={880} />
    </Frame>
  );
};

// ---------- Chaîne de maillons ----------
type ChainNode = {label: string; icon?: string; logo?: string; sub?: string; cut?: boolean; strong?: boolean; color?: string};
type ChainRow = {label?: string; nodes: ChainNode[]; dim?: boolean};
type ChainNote = {text: string; icon?: string; logo?: string; under?: [number, number]}; // maillons couverts par la note (rangée 0)

export const Chain: React.FC<{
  title?: string;
  kicker?: string;
  rows: ChainRow[];
  notes?: ChainNote[];
  start?: number;
  stagger?: number;
  cutAt?: number; // instant (s) où les maillons « cut » sont barrés et s'effacent
  notesAt?: number;
  source?: string;
}> = ({title, kicker, rows, notes = [], start = 0.4, stagger = 0.35, cutAt, notesAt, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const W = 1620;
  const pK = useEnter(0.05);
  const rowH = rows.length > 1 ? 300 : 340;
  const top0 = rows.length > 1 ? (notes.length ? 10 : 60) : notes.length ? 110 : 210;
  const cut = cutAt !== undefined ? interpolate(t, [cutAt, cutAt + 0.6], [0, 1], clamp) : 0;
  const Arrow = icons.ChevronRight as React.FC<any>;
  let counter = 0;
  const geo = rows.map((row, ri) => {
    const n = row.nodes.length;
    const labelW = row.label ? 190 : 0;
    const avail = W - labelW;
    const step = avail / n;
    return {ri, n, labelW, step, y: top0 + ri * rowH};
  });
  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: -20, ...fade(pK)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      {rows.map((row, ri) => {
        const g = geo[ri];
        return (
          <div key={ri} style={{position: 'absolute', left: 0, top: g.y, width: W, height: rowH, opacity: row.dim ? 0.55 : 1}}>
            {row.label ? (
              <div style={{position: 'absolute', left: 0, top: 70, width: g.labelW - 20, fontFamily: FONT.mono, fontSize: 22, letterSpacing: 4, color: C.gold, ...fade(spring({frame: frame - (start + ri * 1.2) * fps, fps, config: {damping: 200}}))}}>{row.label.toUpperCase()}</div>
            ) : null}
            {row.nodes.map((nd, k) => {
              const idx = counter++;
              const p = spring({frame: frame - (start + idx * stagger) * fps, fps, config: {damping: 200}});
              const cx = g.labelW + g.step * (k + 0.5);
              const isCut = !!nd.cut;
              const fadeCut = isCut ? 1 - cut * 0.7 : 1;
              const [, top, halo] = gradOf(nd.color ?? (nd.strong ? 'amber' : 'teal'));
              const size = 150;
              return (
                <React.Fragment key={k}>
                  {k > 0 ? (
                    <div style={{position: 'absolute', left: cx - g.step / 2 - 22, top: 52, opacity: unit(p) * 0.7}}>
                      <Arrow size={44} color={C.gold} strokeWidth={2} />
                    </div>
                  ) : null}
                  <div style={{position: 'absolute', left: cx - g.step / 2 + 20, width: g.step - 40, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', ...fade(p), opacity: unit(p) * fadeCut}}>
                    <div style={{position: 'relative', width: size, height: size, borderRadius: '50%', ...glass(nd.strong ? 'rgba(240,181,78,0.6)' : undefined), background: nd.strong ? 'radial-gradient(circle at 35% 30%, rgba(255,215,140,0.25), rgba(0,0,0,0.6) 70%)' : `rgba(${AMB.inkRgb},0.7)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {nd.logo ? <Logo id={nd.logo} height={46} width={118} color={nd.strong ? 'gold' : 'white'} /> : <Ico name={nd.icon} size={70} color={nd.strong ? C.gold : top} glow={nd.strong ? 'rgba(240,181,78,0.6)' : halo} />}
                      {isCut ? (
                        <svg width={size + 40} height={size + 40} style={{position: 'absolute', left: -20, top: -20, overflow: 'visible'}}>
                          <line x1={20} y1={size + 20} x2={20 + (size) * cut} y2={size + 20 - size * cut} stroke={C.brick} strokeWidth={8} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${C.brick})`}} />
                        </svg>
                      ) : null}
                    </div>
                    <div style={{marginTop: 18, fontFamily: FONT.title, fontWeight: nd.strong ? 800 : 600, fontSize: 30, lineHeight: 1.15, textAlign: 'center', color: C.paper, textDecoration: isCut && cut > 0.5 ? 'line-through' : undefined, textDecorationColor: C.brick}}>{nd.label}</div>
                    {nd.sub ? <div style={{marginTop: 6, fontFamily: FONT.title, fontWeight: 300, fontSize: 23, lineHeight: 1.25, textAlign: 'center', color: C.paper, opacity: 0.72}}>{nd.sub}</div> : null}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
      {notes.map((nt, i) => {
        const g = geo[0];
        const [a, b] = nt.under ?? [0, g.n - 1];
        const x0 = g.labelW + g.step * a + 30;
        const x1 = g.labelW + g.step * (b + 1) - 30;
        const p = spring({frame: frame - ((notesAt ?? start + counter * stagger + 0.4) + i * 0.8) * fps, fps, config: {damping: 200}});
        const y = top0 + rows.length * rowH + i * 120 - 10;
        return (
          <div key={i} style={{position: 'absolute', left: x0, width: x1 - x0, top: y, height: 92, ...glass('rgba(240,181,78,0.4)'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, ...fade(p)}}>
            {nt.logo ? <Logo id={nt.logo} height={40} width={170} color="gold" /> : <Ico name={nt.icon} size={44} color={C.gold} glow="rgba(240,181,78,0.6)" />}
            <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 32, color: C.paper}}>{nt.text}</div>
          </div>
        );
      })}
    </Frame>
  );
};
