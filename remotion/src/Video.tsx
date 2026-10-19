import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Bars, BigNumbers, Line, List, Stacked, Statement, Timeline} from './components/blocks';
import {Background, ChapterLabel, CreditsFlow, EndScreen, Ident} from './components/special';
import {VideoProps, Visual} from './types';

export const END_SCREEN_SECONDS = 20;
const IDENT_SECONDS = 3;

const BLOCKS: Record<string, React.FC<any>> = {
  statement: Statement,
  numbers: BigNumbers,
  bars: Bars,
  stacked: Stacked,
  line: Line,
  list: List,
  timeline: Timeline,
  credits: CreditsFlow,
};

const renderVisual = (v: Visual) => {
  const Block = BLOCKS[v.type];
  if (!Block) throw new Error(`Type de visuel inconnu : ${v.type}`);
  return <Block {...v.props} />;
};

export const Video: React.FC<VideoProps> = ({timeline, visuals, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const byId = new Map(timeline.segments.map((s) => [s.id, s]));
  const f = (t: number) => Math.round(t * fps);
  const narrationEnd = f(timeline.duration);

  // Chaque visuel commence au début de son segment et dure jusqu'au visuel suivant.
  const placed = visuals.map((v, i) => {
    const seg = byId.get(v.at);
    if (!seg) throw new Error(`Segment inconnu dans visuals.json : ${v.at}`);
    return {v, seg, from: f(seg.start) - (i === 0 ? f(seg.start) : 0)};
  });
  const identFrom = timeline.ident !== null ? f(timeline.ident) : null;

  return (
    <AbsoluteFill>
      <Background />
      {placed.map(({v, seg, from}, i) => {
        let to = i + 1 < placed.length ? placed[i + 1].from : narrationEnd;
        if (identFrom !== null && from < identFrom && to > identFrom) to = identFrom;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} name={`${v.at} ${v.type}`}>
            {renderVisual(v)}
            <ChapterLabel num={seg.chapter} title={seg.chapter_title} />
          </Sequence>
        );
      })}
      {identFrom !== null ? (
        <Sequence from={identFrom} durationInFrames={IDENT_SECONDS * fps} name="ident">
          <Ident />
        </Sequence>
      ) : null}
      <Sequence from={narrationEnd} durationInFrames={durationInFrames - narrationEnd} name="fin">
        <EndScreen />
      </Sequence>
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
