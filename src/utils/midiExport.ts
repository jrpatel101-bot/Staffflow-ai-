import { Note } from '../types/music';

/**
 * Standard MIDI File (.mid) Exporter in pure TypeScript.
 * Generates valid binary Standard MIDI file (Type 0, 480 ticks per quarter note).
 */
export function exportToMidiFile(notes: Note[], bpm: number = 120, title: string = 'StaffFlow_Transcription'): void {
  const ticksPerQuarter = 480;
  const microsecondsPerQuarter = Math.round(60000000 / bpm);

  // Convert notes to MIDI events (Note On / Note Off) sorted by time
  interface MidiEvent {
    tick: number;
    type: 'on' | 'off';
    pitch: number;
    velocity: number;
  }

  const events: MidiEvent[] = [];

  notes.forEach((n) => {
    const startTick = Math.round((n.startTime * bpm / 60) * ticksPerQuarter);
    const endTick = Math.round(((n.startTime + n.duration) * bpm / 60) * ticksPerQuarter);
    const pitch = n.midiNote || 60;
    const velocity = Math.min(127, Math.max(1, n.velocity || 90));

    events.push({ tick: startTick, type: 'on', pitch, velocity });
    events.push({ tick: endTick, type: 'off', pitch, velocity: 0 });
  });

  // Sort events chronologically
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type === 'off' && b.type === 'on') return -1;
    return 0;
  });

  const trackBytes: number[] = [];

  // Write Set Tempo Meta Event (FF 51 03 tt tt tt)
  trackBytes.push(0); // Delta time 0
  trackBytes.push(0xFF, 0x51, 0x03);
  trackBytes.push((microsecondsPerQuarter >> 16) & 0xFF);
  trackBytes.push((microsecondsPerQuarter >> 8) & 0xFF);
  trackBytes.push(microsecondsPerQuarter & 0xFF);

  // Write Track Name Meta Event
  if (title) {
    trackBytes.push(0); // Delta 0
    trackBytes.push(0xFF, 0x03, title.length);
    for (let i = 0; i < title.length; i++) {
      trackBytes.push(title.charCodeAt(i));
    }
  }

  let lastTick = 0;

  events.forEach((ev) => {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;

    // Write Variable Length Delta Time
    writeVarLen(trackBytes, delta);

    if (ev.type === 'on') {
      trackBytes.push(0x90); // Note On channel 0
      trackBytes.push(ev.pitch & 0x7F);
      trackBytes.push(ev.velocity & 0x7F);
    } else {
      trackBytes.push(0x80); // Note Off channel 0
      trackBytes.push(ev.pitch & 0x7F);
      trackBytes.push(0);
    }
  });

  // End of Track Meta Event (FF 2F 00)
  writeVarLen(trackBytes, 0);
  trackBytes.push(0xFF, 0x2F, 0x00);

  // Build full MIDI binary file
  const fileBytes: number[] = [];

  // MThd Header
  fileBytes.push(0x4D, 0x54, 0x68, 0x64); // 'MThd'
  fileBytes.push(0x00, 0x00, 0x00, 0x06); // Header size 6
  fileBytes.push(0x00, 0x00);             // Format 0 (single track)
  fileBytes.push(0x00, 0x01);             // 1 track
  fileBytes.push((ticksPerQuarter >> 8) & 0xFF, ticksPerQuarter & 0xFF);

  // MTrk Track Header
  fileBytes.push(0x4D, 0x54, 0x72, 0x6B); // 'MTrk'
  const trackLen = trackBytes.length;
  fileBytes.push((trackLen >> 24) & 0xFF);
  fileBytes.push((trackLen >> 16) & 0xFF);
  fileBytes.push((trackLen >> 8) & 0xFF);
  fileBytes.push(trackLen & 0xFF);

  // Append Track Bytes
  fileBytes.push(...trackBytes);

  // Download Blob
  const uint8Array = new Uint8Array(fileBytes);
  const blob = new Blob([uint8Array], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9_-]/gi, '_')}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function writeVarLen(bytes: number[], value: number): void {
  let buffer = value & 0x7F;
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7F) | 0x80;
  }
  while (true) {
    bytes.push(buffer & 0xFF);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
}
