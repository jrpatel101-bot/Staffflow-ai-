import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Music2,
  ChevronRight,
  ChevronLeft,
  Volume2
} from 'lucide-react';
import { TranscriptionData, Note } from '../../types/music';
import { SheetMusicView } from './SheetMusicView';
import { PianoRollView } from './PianoRollView';
import { ExportPanel } from '../export/ExportPanel';
import { playNoteTone } from '../../utils/audio';

interface MusicEditorDAWProps {
  transcription: TranscriptionData;
  onUpdateTranscription: (updated: TranscriptionData) => void;
}

export const MusicEditorDAW: React.FC<MusicEditorDAWProps> = ({
  transcription,
  onUpdateTranscription,
}) => {
  const [notes, setNotes] = useState<Note[]>(transcription.notes);
  const [history, setHistory] = useState<Note[][]>([transcription.notes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(transcription.bpm || 120);
  const [keySignature, setKeySignature] = useState(transcription.keySignature || 'C Major');
  const [timeSignature, setTimeSignature] = useState(transcription.timeSignature || '4/4');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showProperties, setShowProperties] = useState(true);

  const playbackTimerRef = useRef<any>(null);

  // Sync state if prop changes
  useEffect(() => {
    setNotes(transcription.notes);
    setBpm(transcription.bpm || 120);
  }, [transcription]);

  // Total calculated duration from note list
  const totalDuration = Math.max(
    8,
    ...notes.map((n) => n.startTime + n.duration + 1)
  );

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 50; // 20 FPS tick
      playbackTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + intervalMs / 1000;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }

          // Trigger Web Audio tone synth for notes starting at current time
          notes.forEach((n) => {
            if (Math.abs(n.startTime - next) < 0.03) {
              playNoteTone(n.midiNote || 60, n.duration, n.velocity);
            }
          });

          return next;
        });
      }, intervalMs);
    } else {
      clearInterval(playbackTimerRef.current);
    }

    return () => clearInterval(playbackTimerRef.current);
  }, [isPlaying, notes, totalDuration]);

  // Note History Undo/Redo
  const updateNotesWithHistory = (newNotes: Note[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newNotes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setNotes(newNotes);

    onUpdateTranscription({
      ...transcription,
      notes: newNotes,
      bpm,
      keySignature,
      timeSignature,
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setNotes(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setNotes(history[nextIdx]);
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* DAW Top Control Toolbar */}
      <div className="w-full bg-[#12121C] rounded-2xl border border-[#292938] p-4 shadow-[0_0_25px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4">
        {/* Play / Transport Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              if (!isPlaying && currentTime >= totalDuration) setCurrentTime(0);
            }}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="p-2 rounded-lg bg-[#181826] hover:bg-[#292938] border border-[#292938] text-slate-400 hover:text-white transition-colors"
            title="Reset Playhead"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex flex-col font-mono-data text-xs text-slate-300 ml-1">
            <span>{currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s</span>
          </div>
        </div>

        {/* BPM & Musical Settings */}
        <div className="flex flex-wrap items-center gap-4">
          {/* BPM Slider */}
          <div className="flex items-center gap-2 bg-[#09090F] border border-[#292938] px-3 py-1.5 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-400">BPM:</span>
            <input
              type="number"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 120;
                setBpm(val);
                onUpdateTranscription({ ...transcription, bpm: val });
              }}
              className="w-12 bg-transparent text-xs font-mono-data text-white font-semibold focus:outline-none text-center"
            />
          </div>

          {/* Key Signature Selector */}
          <div className="flex items-center gap-2 bg-[#09090F] border border-[#292938] px-3 py-1.5 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-400">Key:</span>
            <select
              value={keySignature}
              onChange={(e) => {
                setKeySignature(e.target.value);
                onUpdateTranscription({ ...transcription, keySignature: e.target.value });
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              {['C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'F Major', 'Bb Major', 'A Minor', 'E Minor', 'D Minor'].map((k) => (
                <option key={k} value={k} className="bg-[#12121C] text-white">
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Time Signature */}
          <div className="flex items-center gap-2 bg-[#09090F] border border-[#292938] px-3 py-1.5 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-400">Time:</span>
            <select
              value={timeSignature}
              onChange={(e) => {
                setTimeSignature(e.target.value);
                onUpdateTranscription({ ...transcription, timeSignature: e.target.value });
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              {['4/4', '3/4', '2/4', '6/8'].map((ts) => (
                <option key={ts} value={ts} className="bg-[#12121C] text-white">
                  {ts}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Undo/Redo & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-lg bg-[#181826] border border-[#292938] transition-colors ${
              historyIndex <= 0 ? 'opacity-40 cursor-not-allowed text-slate-600' : 'text-slate-300 hover:text-white'
            }`}
            title="Undo Edit"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-lg bg-[#181826] border border-[#292938] transition-colors ${
              historyIndex >= history.length - 1 ? 'opacity-40 cursor-not-allowed text-slate-600' : 'text-slate-300 hover:text-white'
            }`}
            title="Redo Edit"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-[#292938] mx-1"></div>

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-2 rounded-lg bg-[#181826] border border-[#292938] text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-2 rounded-lg bg-[#181826] border border-[#292938] text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Grid Layout: DAW Canvas + Properties Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area: Sheet Music & Piano Roll (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* VexFlow Sheet Music Score Canvas */}
          <SheetMusicView
            transcription={{ ...transcription, notes, bpm, keySignature, timeSignature }}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
          />

          {/* Interactive Piano Roll Timeline */}
          <PianoRollView
            notes={notes}
            onChangeNotes={updateNotesWithHistory}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            currentTime={currentTime}
            duration={totalDuration}
            bpm={bpm}
            zoomLevel={zoomLevel}
          />
        </div>

        {/* Right Side Collapsible Note Properties Panel (1 col) */}
        <div className="lg:col-span-1 bg-[#12121C] rounded-2xl border border-[#292938] p-5 shadow-[0_0_25px_rgba(0,0,0,0.4)] flex flex-col gap-5 h-fit">
          <div className="flex items-center justify-between border-b border-[#292938] pb-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Inspector Panel</span>
            </h4>
          </div>

          {selectedNote ? (
            /* Selected Note Details Inspector */
            <div className="flex flex-col gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#09090F] border border-[#292938] flex items-center justify-between">
                <span className="text-slate-400">Selected Pitch:</span>
                <span className="font-mono-data font-bold text-sm text-violet-300">{selectedNote.pitch}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Start Offset (seconds):</label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedNote.startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    updateNotesWithHistory(
                      notes.map((n) => (n.id === selectedNote.id ? { ...n, startTime: val } : n))
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#09090F] border border-[#292938] rounded-lg text-white font-mono-data"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Duration (seconds):</label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedNote.duration}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0.1;
                    updateNotesWithHistory(
                      notes.map((n) => (n.id === selectedNote.id ? { ...n, duration: val } : n))
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#09090F] border border-[#292938] rounded-lg text-white font-mono-data"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Velocity Dynamics ({selectedNote.velocity}):</label>
                <input
                  type="range"
                  min="1"
                  max="127"
                  value={selectedNote.velocity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 90;
                    updateNotesWithHistory(
                      notes.map((n) => (n.id === selectedNote.id ? { ...n, velocity: val } : n))
                    );
                  }}
                  className="w-full h-1.5 bg-[#292938] accent-violet-500 rounded-lg cursor-pointer"
                />
              </div>

              <button
                onClick={() => playNoteTone(selectedNote.midiNote || 60, selectedNote.duration, selectedNote.velocity)}
                className="w-full py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audition Pitch</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 flex flex-col gap-2">
              <span>Select any note block on the Piano Roll timeline to inspect and edit note parameters.</span>
            </div>
          )}
        </div>
      </div>

      {/* Export Toolbar */}
      <ExportPanel
        transcription={{ ...transcription, notes, bpm, keySignature, timeSignature }}
      />
    </div>
  );
};
