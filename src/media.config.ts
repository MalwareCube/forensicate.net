export type MediaType = 'talk' | 'workshop' | 'webcast' | 'video' | 'podcast' | 'slides' | 'live';

export type MediaCategory = 'Workshops' | 'Interviews' | 'Talks' | 'Webcasts' | 'Podcasts' | 'Panels' | 'Slides';

export interface MediaEntry {
  title: string;
  url: string;
  category: MediaCategory;
  type?: MediaType;
  date?: string;
  venue?: string;
  description?: string;
  embed?: boolean;
}

export const page = {
  title: 'Media',
  description: "Some of the places I've shown up talking shop.",
  intro: "Some of the places I've shown up talking shop. A mix of workshops, interviews, and anything that puts me in front of a camera or microphone.",
  empty: 'Nothing here yet.',
};

export const watchlist = {
  playlistId: 'PLlVwEJ24Vogipn42DXdiDdIYRRZH-MxJb',
  heading: '📺 Watchlist',
  venue: 'TCM Security',
  limit: 6,
};

export const categoryEmoji: Record<MediaCategory, string> = {
  Workshops: '🛠️',
  Interviews: '🎙️',
  Talks: '🎤',
  Webcasts: '📡',
  Podcasts: '🎧',
  Panels: '🗣️',
  Slides: '🖼️',
};

export const media: MediaEntry[] = [
  {
    title: 'Ransomware Investigation Workshop | Splunk BOTSv2',
    url: 'https://www.youtube.com/watch?v=_bIWoFIViZo',
    category: 'Workshops',
    type: 'live',
    date: '2024-09-11',
    venue: 'TCM Security',
  },
  {
    title: 'PowerShell Deobfuscation',
    url: 'https://www.youtube.com/watch?v=qdAb9dhVeBo',
    category: 'Workshops',
    type: 'live',
    date: '2025-04-23',
    venue: 'TCM Security',
  },
  {
    title: 'Conti Ransomware Investigation',
    url: 'https://www.youtube.com/watch?v=kdM4HBiXhsU',
    category: 'Workshops',
    type: 'live',
    date: '2025-06-04',
    venue: 'TCM Security',
  },
  {
    title: 'Memory Forensics',
    url: 'https://www.youtube.com/watch?v=ki64m0EpLLw',
    category: 'Workshops',
    type: 'live',
    date: '2025-07-02',
    venue: 'TCM Security',
  },
  {
    title: 'Interview with MyDFIR',
    url: 'https://www.youtube.com/watch?v=c9zUqg0iqH8',
    category: 'Interviews',
    type: 'video',
    date: '2025-02-12',
    venue: 'MyDFIR',
  },
];
