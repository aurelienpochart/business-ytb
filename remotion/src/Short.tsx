import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {LayoutContext} from './components/common';
import {Atmosphere, Camera, FilmFinish, GoldText, LightSweep, SceneShell, gold} from './components/fx';
import {MediaContext, PhotoLayer} from './components/media';
import {LogoCurve} from './components/special';
import {renderVisual} from './Video';
import {AMB, C, FONT, applyTint} from './theme';
import {CaptionCard, Segment, Timeline, Visual} from './types';

// Short vertical (1080 x 1920) extrait d'une vidéo longue (charte 6.5) : mêmes blocs que la vidéo,
// mis en page en portrait dans la « scène », accroche en haut, sous-titres mot à mot au centre-bas,
// carte finale courte vers la vidéo complète.
export const SHORT_W = 1080;
export const SHORT_H = 1920;
export const END_CARD_SECONDS = 1.6;
// Zones (px) : accroche 130-330 ; scène 340-1270 ; sous-titres 1290-1460 ; en dessous et le long du bord
// droit, l'interface Shorts (titre, chaîne, boutons) : rien d'important n'y est placé.
const STAGE = {portrait: true, top: 340, height: 930};
const CAPTION = {top: 1290, height: 170, left: 60, width: 900};
const OVERLAP = 10;
// Le premier plan démarre 1,5 s « avant » l'image 0 : dès la première image (miniature du flux Shorts),
// ses entrées animées sont déjà presque terminées.
const PREROLL = 1.5;

export type ShortProps = {
  timeline: Timeline;
  visuals: Visual[];
  media?: {id: string; file?: string; license?: string; artist?: string}[];
  hook: string;
  longTitle: string;
  tint?: string;
  tintRegrade?: string[];
  audio: string;
};

// Instant (s) où la narration atteint `phrase` : début du mot correspondant (minutage mot à mot).
const phraseTime = (phrase: string, seg: Segment, all: Segment[]): number => {
  for (const s of [seg, ...all.filter((x) => x !== seg)]) {
    const i = s.text.indexOf(phrase);
    if (i < 0) continue;
    if (!s.words?.length) return s.start + (s.end - s.start) * (i / s.text.length);
    const k = s.text.slice(0, i).split(/\s+/).filter(Boolean).length;
    // Si la phrase commence au milieu d'un mot, ce mot est déjà compté : on prend son début.
    const mid = i > 0 && !/\s/.test(s.text[i - 1]);
    return s.words[Math.min(s.words.length - 1, mid ? k - 1 : k)].s;
  }
  throw new Error(`« ${phrase} » introuvable dans la narration du Short`);
};

// Remplace dans les props les repères {"$t": "phrase", "offset": x} par un délai en secondes depuis le
// début du plan : les animations (barres, tuiles, parts) suivent exactement la narration.
const resolveTimes = (x: unknown, from: number, seg: Segment, all: Segment[]): unknown => {
  if (Array.isArray(x)) return x.map((y) => resolveTimes(y, from, seg, all));
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>;
    if (typeof o.$t === 'string') return Math.max(0, phraseTime(o.$t, seg, all) - from + (Number(o.offset) || 0));
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, resolveTimes(v, from, seg, all)]));
  }
  return x;
};

const Hook: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 84, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, opacity: 0.8}}>
        <LogoCurve size={34} progress={1} glow={false} />
        <span style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 17, letterSpacing: 5, color: C.paper}}>THE COST CURVE</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 134, height: 196, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.display, fontSize: 80, lineHeight: 1.02, color: C.paper, textAlign: 'center', letterSpacing: -0.5, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>
          {text.split(/(\*[^*]+\*)/).map((part, i) =>
            part.startsWith('*') ? (
              <span key={i} style={{...gold(frame, fps, i * 7), filter: 'drop-shadow(0 0 22px rgba(240,181,78,0.35))'}}>
                {part.slice(1, -1)}
              </span>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            ),
          )}
        </div>
      </div>
      <div style={{position: 'absolute', left: 440, right: 440, top: 334, height: 2, background: 'linear-gradient(90deg, transparent, rgba(240,181,78,0.7), transparent)'}} />
    </AbsoluteFill>
  );
};

// Sous-titres : une carte de 1 à 3 mots ; le mot prononcé en or, les suivants atténués.
const Captions: React.FC<{cards: CaptionCard[]; until: number}> = ({cards, until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (t >= until) return null;
  const card = cards.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!card) return null;
  const pop = spring({frame: (t - card.start + 0.05) * fps, fps, config: {damping: 15, stiffness: 240, mass: 0.6}});
  return (
    <div style={{position: 'absolute', left: CAPTION.left, width: CAPTION.width, top: CAPTION.top, height: CAPTION.height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          textAlign: 'center',
          fontFamily: FONT.title,
          fontWeight: 800,
          fontSize: 74,
          lineHeight: 1.1,
          letterSpacing: -1.5,
          transform: `scale(${0.88 + 0.12 * pop}) translateY(${(1 - pop) * 14}px)`,
          opacity: Math.min(1, pop * 1.6),
        }}
      >
        {card.units.map((u, i) => {
          const next = card.units[i + 1];
          const active = t >= u.s - 0.04 && (!next || t < next.s - 0.04);
          const future = t < u.s - 0.04;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 0.14em',
                color: active ? '#FFD88A' : C.paper,
                opacity: future ? 0.5 : 1,
                textShadow: active
                  ? '0 0 28px rgba(240,181,78,0.55), 0 4px 22px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)'
                  : '0 4px 22px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
              }}
            >
              {u.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Carte finale (1,6 s) : renvoi vers la vidéo complète.
const EndCard: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bg = interpolate(frame, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const draw = interpolate(frame, [2, 0.7 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const p = spring({frame: frame - 3, fps, config: {damping: 200}});
  const p2 = spring({frame: frame - 8, fps, config: {damping: 200}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${C.navy} 0%, ${C.ink} 72%)`, opacity: bg * 0.985}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        <div style={{opacity: p}}>
          <LogoCurve size={230} progress={draw} dot={Math.min(1, Math.max(0, p2))} />
        </div>
        <div style={{fontFamily: FONT.display, fontSize: 92, lineHeight: 1.02, color: C.paper, marginTop: 40, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
          Full video
          <br />
          on the <GoldText>channel</GoldText>
        </div>
        <div
          style={{
            marginTop: 48,
            padding: '22px 34px',
            maxWidth: 900,
            borderRadius: 22,
            border: '1.5px solid rgba(240,181,78,0.45)',
            background: 'linear-gradient(140deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            boxShadow: '0 0 50px rgba(240,181,78,0.18)',
            fontFamily: FONT.title,
            fontWeight: 600,
            fontSize: 42,
            color: C.goldLight,
            opacity: p2,
            transform: `translateY(${(1 - p2) * 30}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Short: React.FC<ShortProps> = ({timeline, visuals, media = [], hook, longTitle, tint, tintRegrade, audio}) => {
  applyTint(tint, tintRegrade);
  const mediaById = Object.fromEntries(media.map((m) => [m.id, m]));
  const {fps, durationInFrames} = useVideoConfig();
  const segs = timeline.segments;
  const byId = new Map(segs.map((s) => [s.id, s]));
  const f = (t: number) => Math.round(t * fps);
  const narrationEnd = f(timeline.duration);

  const startOf = (v: Visual, i: number) => {
    const seg = byId.get(v.at);
    if (!seg) throw new Error(`Segment inconnu dans visuals.json : ${v.at}`);
    return {seg, from: i === 0 ? -f(PREROLL) : f(v.after ? phraseTime(v.after, seg, segs) : seg.start)};
  };
  // Un visuel de type "endcard" (facultatif, en dernier) avance la carte finale sur la dernière phrase
  // (« Full story on the channel ») ; sans lui, elle commence à la fin de la narration.
  const endVisual = visuals.length > 1 && visuals[visuals.length - 1].type === 'endcard' ? visuals[visuals.length - 1] : null;
  const endFrom = endVisual ? startOf(endVisual, visuals.length - 1).from : narrationEnd;
  const placed = (endVisual ? visuals.slice(0, -1) : visuals).map((v, i) => {
    const {seg, from} = startOf(v, i);
    return {v: {...v, props: resolveTimes(v.props, from / fps, seg, segs) as Record<string, unknown>}, from};
  });
  const scenesEnd = endVisual ? endFrom + OVERLAP : durationInFrames;

  return (
    <MediaContext.Provider value={mediaById}>
      <LayoutContext.Provider value={STAGE}>
        <AbsoluteFill style={{background: C.ink}}>
          <Atmosphere />
          {placed.map(({v, from}, i) => {
            const to = i + 1 < placed.length ? placed[i + 1].from : scenesEnd;
            const dur = Math.max(1, to - from) + (i + 1 < placed.length ? OVERLAP : 0);
            return (
              <Sequence key={i} from={from} durationInFrames={dur} name={`${v.at} ${v.type}`}>
                <SceneShell duration={dur} overlap={i + 1 < placed.length ? OVERLAP : 1} first={i === 0}>
                  <Camera duration={dur} index={i}>
                    {v.bg ? (
                      <AbsoluteFill style={{opacity: 0.55}}>
                        <PhotoLayer id={v.bg} dim={0.75} blur={3} />
                      </AbsoluteFill>
                    ) : null}
                    {renderVisual(v)}
                  </Camera>
                </SceneShell>
                {i > 0 ? <LightSweep strength={0.14} /> : null}
                {i > 0 ? (
                  <Sequence from={0} durationInFrames={fps * 2} layout="none">
                    <Audio src={staticFile('sfx/whoosh.wav')} volume={0.2} />
                  </Sequence>
                ) : null}
              </Sequence>
            );
          })}
          {/* Voiles de lisibilité : accroche en haut, sous-titres et interface Shorts en bas */}
          <AbsoluteFill
            style={{
              pointerEvents: 'none',
              background: `linear-gradient(180deg, rgba(${AMB.inkRgb},0.78) 0%, rgba(${AMB.inkRgb},0.45) 11%, transparent 19%, transparent 60%, rgba(${AMB.inkRgb},0.55) 68%, rgba(${AMB.inkRgb},0.8) 100%)`,
            }}
          />
          <Sequence from={0} durationInFrames={durationInFrames} name="accroche">
            <Hook text={hook} />
          </Sequence>
          <Sequence from={endFrom} durationInFrames={durationInFrames - endFrom} name="carte finale">
            <EndCard title={longTitle} />
            <Audio src={staticFile('sfx/whoosh-deep.wav')} volume={0.35} />
          </Sequence>
          {/* Après la carte finale : si elle commence avant la fin de la narration, la dernière phrase reste sous-titrée. */}
          <Captions cards={timeline.captions ?? []} until={timeline.duration} />
          <FilmFinish />
          <Audio src={staticFile(audio)} />
        </AbsoluteFill>
      </LayoutContext.Provider>
    </MediaContext.Provider>
  );
};
