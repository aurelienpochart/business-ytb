import React from 'react';
import {Composition, Still, staticFile} from 'remotion';
import './theme';
import {FPS, HEIGHT, WIDTH} from './theme';
import {Thumbnail, ThumbProps} from './Thumbnail';
import {Timeline, Visual, VideoProps} from './types';
import {END_SCREEN_SECONDS, Video} from './Video';

// Les fichiers de la vidéo en cours (timeline.json, visuals.json, narration.wav, thumbnail.json)
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
        return {
          durationInFrames: Math.ceil((timeline.duration + END_SCREEN_SECONDS) * FPS),
          props: {...props, timeline, visuals},
        };
      }}
    />
    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
      defaultProps={{words: 'Thumbnail'} as ThumbProps}
      calculateMetadata={async ({props}) => ({props: {...props, ...(await load<ThumbProps>('thumbnail.json'))}})}
    />
  </>
);
