export type InstrumentId =
  | 'piano'
  | 'guitar'
  | 'bass'
  | 'violin'
  | 'flute'
  | 'trumpet'
  | 'saxophone'
  | 'drums'
  | 'vocals'
  | 'multi';

export type PianoCoverLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InstrumentOption {
  id: InstrumentId;
  name: string;
  category: 'Keyboards' | 'Strings' | 'Winds' | 'Percussion' | 'Voice' | 'Ensemble';
  description: string;
  polyphonic: boolean;
  recommendedClef: 'treble' | 'bass' | 'grand' | 'percussion';
  icon: string;
}

export interface Note {
  id: string;
  pitch: string; // e.g., "C4", "G#4", "Bb3"
  midiNote: number; // e.g., 60 for C4
  startTime: number; // in seconds
  duration: number; // in seconds
  velocity: number; // 0-127
  track?: string; // e.g. "Melody", "Harmony", "Bass"
  hand?: 'RH' | 'LH'; // Right Hand (Treble) or Left Hand (Bass) for Piano
  selected?: boolean;
}

export interface ChordMarker {
  name: string;
  timestamp: number;
}

export interface TranscriptionData {
  id: string;
  title: string;
  createdAt: number;
  keySignature: string; // e.g., "C Major", "A Minor"
  timeSignature: string; // e.g., "4/4", "3/4"
  bpm: number;
  clef: 'treble' | 'bass' | 'grand';
  confidenceScore: number;
  summary: string;
  notes: Note[];
  chords: ChordMarker[];
  instrument: InstrumentId;
  pianoCoverLevel?: PianoCoverLevel;
}

export interface AudioFileMeta {
  name: string;
  size: number;
  duration: number;
  type: string;
  url: string;
  buffer?: AudioBuffer;
}

export type ActiveTab = 'workspace' | 'editor' | 'library' | 'settings';

export type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'reading_audio'
  | 'detecting_pitch'
  | 'extracting_harmonics'
  | 'formatting_notation'
  | 'completed'
  | 'error';
