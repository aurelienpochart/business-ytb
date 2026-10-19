export type Segment = {
  id: string;
  chapter: number;
  chapter_title: string;
  text: string;
  start: number;
  end: number;
};

export type Timeline = {duration: number; ident: number | null; segments: Segment[]};

export type Visual = {at: string; type: string; props: Record<string, unknown>};

export type VideoProps = {timeline: Timeline; visuals: Visual[]; audio: string};
