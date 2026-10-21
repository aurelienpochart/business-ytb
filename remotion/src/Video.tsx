import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Bars, BigNumbers, Line, List, Quote, Stacked, Statement, Tiles, Timeline} from './components/blocks';
import {Atmosphere, Camera, FilmFinish, LightSweep, SceneShell} from './components/fx';
import {ChapterCard, CreditsFlow, EndScreen, Hud, Ident} from './components/special';
import {Hero, MediaContext, Photo, PhotoLayer} from './components/media';
import {Donut, Loop} from './components/diagrams';
import {Segment, VideoProps, Visual} from './types';
import {C, applyTint} from './theme';

export const END_SCREEN_SECONDS = 20;
const IDENT_SECONDS = 3;
const OVERLAP = 14; // images de fondu enchaîné entre deux plans
const CARD_LEAD = 0.9; // la carte de chapitre commence pendant la pause qui précède le chapitre
const CARD_SECONDS = 2.7;
const CARD_DELAY = 1.6; // le premier plan du chapitre démarre ses animations après la carte

const BLOCKS: Record<string, React.FC<any>> = {
  statement: Statement,
  numbers: BigNumbers,
  bars: Bars,
  stacked: Stacked,
  line: Line,
  list: List,
  timeline: Timeline,
  credits: CreditsFlow,
  tiles: Tiles,
  quote: Quote,
  photo: Photo,
  hero: Hero,
  donut: Donut,
  loop: Loop,
};

const renderVisual = (v: Visual) => {
  const Block = BLOCKS[v.type];
  if (!Block) throw new Error(`Type de visuel inconnu : ${v.type}`);
  return <Block {...v.props} />;
};

// Instant d'un visuel : début de son segment, ou moment estimé où la narration atteint `after`
// (au prorata des caractères du segment).
const timeOf = (v: Visual, seg: Segment) => {
  if (!v.after) return seg.start;
  const i = seg.text.indexOf(v.after);
  if (i < 0) throw new Error(`« ${v.after} » introuvable dans ${seg.id}`);
  return seg.start + (seg.end - seg.start) * (i / seg.text.length);
};

export const Video: React.FC<VideoProps> = ({timeline, visuals, audio, media = [], tint, tintRegrade}) => {
  applyTint(tint, tintRegrade);
  const mediaById = Object.fromEntries(media.map((m) => [m.id, m]));
  const {fps, durationInFrames} = useVideoConfig();
  const byId = new Map(timeline.segments.map((s) => [s.id, s]));
  const f = (t: number) => Math.round(t * fps);
  const narrationEnd = f(timeline.duration);

  // Début de chaque chapitre (premier segment).
  const chapters: {num: number; title: string; start: number}[] = [];
  for (const s of timeline.segments) {
    if (!chapters.find((c) => c.num === s.chapter)) chapters.push({num: s.chapter, title: s.chapter_title, start: s.start});
  }

  const placed = visuals.map((v, i) => {
    const seg = byId.get(v.at);
    if (!seg) throw new Error(`Segment inconnu dans visuals.json : ${v.at}`);
    const from = i === 0 ? 0 : f(timeOf(v, seg));
    const chapterStart = !v.after && chapters.some((c) => c.num > 0 && c.start === seg.start);
    return {v, seg, from, chapterStart};
  });
  // Photo de chaque carte de chapitre : premier fond ou première photo du chapitre.
  const chapterPhotos: Record<number, string | undefined> = {};
  for (const {v, seg} of placed) {
    const ph = v.bg ?? (v.props.photo as string | undefined);
    if (ph && chapterPhotos[seg.chapter] === undefined) chapterPhotos[seg.chapter] = ph;
  }
  const identFrom = timeline.ident !== null ? f(timeline.ident) : null;

  return (
    <MediaContext.Provider value={mediaById}>
    <AbsoluteFill style={{background: C.ink}}>
      <Atmosphere />
      {placed.map(({v, from, chapterStart}, i) => {
        let to = i + 1 < placed.length ? placed[i + 1].from : narrationEnd;
        if (identFrom !== null && from < identFrom && to > identFrom) to = identFrom;
        const dur = Math.max(1, to - from) + OVERLAP;
        const delay = chapterStart ? f(CARD_DELAY) : 0;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`${v.at} ${v.type}`}>
            <SceneShell duration={dur} overlap={OVERLAP} first={i === 0}>
              <Camera duration={dur} index={i}>
                {v.bg ? (
                  <AbsoluteFill style={{opacity: 0.55}}>
                    <PhotoLayer id={v.bg} dim={0.75} blur={3} />
                  </AbsoluteFill>
                ) : null}
                <Sequence from={delay} layout="none">
                  {renderVisual(v)}
                </Sequence>
              </Camera>
            </SceneShell>
            {i > 0 && !chapterStart ? <LightSweep strength={0.16} /> : null}
            {i > 0 ? (
              <Sequence from={0} durationInFrames={fps * 2} layout="none">
                <Audio src={staticFile(chapterStart ? 'sfx/whoosh-deep.wav' : 'sfx/whoosh.wav')} volume={chapterStart ? 0.5 : 0.28} />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}
      {chapters
        .filter((c) => c.num > 0)
        .map((c) => (
          <Sequence key={c.num} from={f(c.start - CARD_LEAD)} durationInFrames={f(CARD_SECONDS)} name={`chapitre ${c.num}`}>
            <ChapterCard num={c.num} title={c.title} duration={f(CARD_SECONDS)} photo={chapterPhotos[c.num]} />
          </Sequence>
        ))}
      <Sequence from={0} durationInFrames={narrationEnd} name="habillage">
        <Hud chapters={chapters} total={timeline.duration} />
      </Sequence>
      {identFrom !== null ? (
        <Sequence from={identFrom} durationInFrames={IDENT_SECONDS * fps} name="ident">
          <Ident />
          <Audio src={staticFile('sfx/ident.wav')} volume={0.55} />
        </Sequence>
      ) : null}
      <Sequence from={narrationEnd} durationInFrames={durationInFrames - narrationEnd} name="fin">
        <SceneShell duration={durationInFrames - narrationEnd} overlap={1}>
          <EndScreen />
        </SceneShell>
      </Sequence>
      <FilmFinish />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
    </MediaContext.Provider>
  );
};
