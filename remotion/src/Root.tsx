import React from 'react';
import {Composition, Still, staticFile} from 'remotion';
import './theme';
import {FPS, HEIGHT, WIDTH} from './theme';
import {Thumbnail, ThumbProps} from './Thumbnail';
import {ThumbnailVariant} from './ThumbnailVariants';
import {Timeline, Visual, VideoProps} from './types';
import {END_SCREEN_SECONDS, Video} from './Video';
import {END_CARD_SECONDS, SHORT_H, SHORT_W, Short, ShortProps} from './Short';

// Les fichiers de la vidéo en cours (timeline.json, visuals.json, narration.wav, thumbnail.json, metadata.json)
// sont copiés dans public/ par le workflow de production.
const load = async <T,>(name: string): Promise<T> => (await fetch(staticFile(name))).json();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Video"
      component={Video}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={FPS * 60}
      defaultProps={{timeline: {duration: 1, ident: null, segments: []}, visuals: [], audio: 'narration.wav'} as VideoProps}
      calculateMetadata={async ({props}) => {
        const timeline = await load<Timeline>('timeline.json');
        const visuals = await load<Visual[]>('visuals.json');
        const media = await load<VideoProps['media']>('media.json').catch(() => []);
        const meta = await load<{tint?: string; tint_regrade?: string[]}>('metadata.json').catch(() => ({tint: undefined, tint_regrade: undefined}));
        return {
          durationInFrames: Math.ceil((timeline.duration + END_SCREEN_SECONDS) * FPS),
          props: {...props, timeline, visuals, media, tint: meta.tint, tintRegrade: meta.tint_regrade},
        };
      }}
    />
    {/* Short vertical : public/ contient alors les fichiers du Short (pipeline/remotion_public_short.sh). */}
    <Composition
      id="Short"
      component={Short}
      fps={FPS}
      width={SHORT_W}
      height={SHORT_H}
      durationInFrames={FPS * 30}
      defaultProps={{timeline: {duration: 1, ident: null, segments: []}, visuals: [], audio: 'narration.wav', hook: '', longTitle: ''} as ShortProps}
      calculateMetadata={async ({props}) => {
        const timeline = await load<Timeline>('timeline.json');
        const visuals = await load<Visual[]>('visuals.json');
        const media = await load<ShortProps['media']>('media.json').catch(() => []);
        const short = await load<{hook: string; longTitle: string; tint?: string; tintRegrade?: string[]}>('short.json');
        return {
          durationInFrames: Math.ceil((timeline.duration + END_CARD_SECONDS) * FPS),
          props: {...props, timeline, visuals, media, ...short},
        };
      }}
    />
    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
      defaultProps={{words: 'Thumbnail'} as ThumbProps}
      calculateMetadata={async ({props}) => {
        const {tint} = await load<{tint?: string}>('metadata.json').catch(() => ({tint: undefined}));
        return {props: {...props, ...(await load<ThumbProps>('thumbnail.json')), tint}};
      }}
    />
    <Still id="ThumbnailVariant" component={ThumbnailVariant} width={1280} height={720} defaultProps={{variant: 'or' as const}} />
  </>
);
