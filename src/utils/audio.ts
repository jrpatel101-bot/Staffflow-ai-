/**
 * Web Audio API Utilities for StaffFlow AI
 * Real waveform extraction, Web Audio tone synthesizer, and audio recording.
 */

let audioCtxInstance: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtxInstance || audioCtxInstance.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxInstance = new AudioContextClass();
  }
  if (audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume();
  }
  return audioCtxInstance;
}

/**
 * Extracts REAL peak levels from an AudioBuffer for accurate waveform rendering.
 * Never displays fabricated waveforms.
 */
export function extractWaveformPeaks(buffer: AudioBuffer, numSamples: number = 100): number[] {
  const channelData = buffer.getChannelData(0);
  const step = Math.floor(channelData.length / numSamples);
  const peaks: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step && start + j < channelData.length; j++) {
      const datum = Math.abs(channelData[start + j]);
      if (datum > max) {
        max = datum;
      }
    }
    // Normalize slightly
    peaks.push(Math.min(1.0, max * 1.2));
  }

  return peaks;
}

/**
 * Converts MIDI note number (0-127) to frequency in Hertz.
 * Standard A4 = 440 Hz = MIDI note 69.
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Converts MIDI note number to note name string (e.g., 60 -> "C4").
 */
export function midiToPitchName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Converts pitch name string (e.g. "C4", "F#5", "Bb3") to MIDI note number.
 */
export function pitchNameToMidi(pitch: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4,
    'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9,
    'A#': 10, 'BB': 10, 'B': 11
  };
  
  const match = pitch.trim().toUpperCase().match(/^([A-G][#B]?)(-?\d+)$/);
  if (!match) return 60; // Default C4

  const name = match[1];
  const octave = parseInt(match[2], 10);
  const noteOffset = noteMap[name] ?? 0;
  return (octave + 1) * 12 + noteOffset;
}

/**
 * Plays a realistic synthesized piano/instrument note tone via Web Audio API.
 */
export function playNoteTone(midiNote: number, durationSec: number = 0.5, velocity: number = 90): void {
  try {
    const ctx = getAudioContext();
    const freq = midiToFrequency(midiNote);
    const now = ctx.currentTime;

    // Gain node for ADSR envelope
    const gainNode = ctx.createGain();
    const gainVal = (velocity / 127) * 0.4;

    // Fundamental oscillator (triangle/sine blend)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Sub-harmonic for warmth
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(gainVal * 0.25, now);

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainVal, now + 0.02); // Attack
    gainNode.gain.exponentialRampToValueAtTime(gainVal * 0.6, now + 0.1); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.15, durationSec)); // Release

    osc.connect(gainNode);
    osc2.connect(gain2);
    gain2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + durationSec + 0.1);
    osc2.stop(now + durationSec + 0.1);
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}

/**
 * Encodes audio buffer data to WAV Blob format in memory.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const result = intercalateChannels(buffer);
  const dataLength = result.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk size */
  view.setUint32(4, 36 + dataLength, true);
  /* WAVE identifier */
  writeString(view, 8, 'WAVE');
  /* fmt subchunk identifier */
  writeString(view, 12, 'fmt ');
  /* format subchunk size */
  view.setUint32(16, 16, true);
  /* audio format (1 = PCM) */
  view.setUint16(20, format, true);
  /* number of channels */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate */
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  /* block align */
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data subchunk identifier */
  writeString(view, 36, 'data');
  /* data subchunk length */
  view.setUint32(40, dataLength, true);

  // Write PCM sample data
  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function intercalateChannels(buffer: AudioBuffer): Float32Array {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels;
  const result = new Float32Array(length);

  for (let c = 0; c < numChannels; c++) {
    const channel = buffer.getChannelData(c);
    for (let i = 0; i < buffer.length; i++) {
      result[i * numChannels + c] = channel[i];
    }
  }
  return result;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Creates a synthetic demo audio buffer (Für Elise melody) for immediate testing.
 */
export async function generateDemoAudioBlob(): Promise<{ blob: Blob; buffer: AudioBuffer }> {
  const sampleRate = 44100;
  const duration = 5; // 5 seconds
  const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);

  // Notes for Für Elise theme (E5, D#5, E5, D#5, E5, B4, D5, C5, A4)
  const notes = [
    { pitch: 76, start: 0.0, dur: 0.3 }, // E5
    { pitch: 75, start: 0.3, dur: 0.3 }, // D#5
    { pitch: 76, start: 0.6, dur: 0.3 }, // E5
    { pitch: 75, start: 0.9, dur: 0.3 }, // D#5
    { pitch: 76, start: 1.2, dur: 0.3 }, // E5
    { pitch: 71, start: 1.5, dur: 0.3 }, // B4
    { pitch: 74, start: 1.8, dur: 0.3 }, // D5
    { pitch: 72, start: 2.1, dur: 0.3 }, // C5
    { pitch: 69, start: 2.4, dur: 0.8 }, // A4
    { pitch: 60, start: 3.2, dur: 0.4 }, // C4
    { pitch: 64, start: 3.6, dur: 0.4 }, // E4
    { pitch: 69, start: 4.0, dur: 0.8 }, // A4
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = midiToFrequency(n.pitch);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, n.start);

    gain.gain.setValueAtTime(0, n.start);
    gain.gain.linearRampToValueAtTime(0.3, n.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, n.start + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(n.start);
    osc.stop(n.start + n.dur);
  });

  const renderedBuffer = await ctx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  return { blob: wavBlob, buffer: renderedBuffer };
}
