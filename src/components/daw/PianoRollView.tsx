import React, { useState, useRef } from 'react';
import { Note } from '../../types/music';
import { midiToPitchName, playNoteTone } from '../../utils/audio';
import { Plus, Trash2, Volume2 } from 'lucide-react';

interface PianoRollViewProps {
  notes: Note[];
  onChangeNotes: (updatedNotes: Note[]) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  currentTime: number;
  duration: number;
  bpm: number;
  zoomLevel: number;
}

export const PianoRollView: React.FC<PianoRollViewProps> = ({
  notes,
  onChangeNotes,
  selectedNoteId,
  onSelectNote,
  currentTime,
  duration,
  bpm,
  zoomLevel,
}) => {
  const [hoveredMidi, setHoveredMidi] = useState<number | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate Octave Range for Keyboard (C3 to C6, MIDI 48 to 84)
  const midiRange: number[] = [];
  for (let m = 84; m >= 48; m--) {
    midiRange.push(m);
  }

  const isBlackKey = (midi: number) => {
    const noteInOctave = midi % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const pxPerSecond = 100 * zoomLevel;
  const totalWidthPx = Math.max(800, (duration || 8) * pxPerSecond);

  // Play audio preview when piano key clicked
  const handleKeyClick = (midi: number) => {
    playNoteTone(midi, 0.4);
  };

  // Add new note on grid click
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, midi: number) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const startTime = Math.max(0, clickX / pxPerSecond);

    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      pitch: midiToPitchName(midi),
      midiNote: midi,
      startTime: parseFloat(startTime.toFixed(2)),
      duration: 0.5,
      velocity: 95,
      track: 'Melody',
    };

    onChangeNotes([...notes, newNote]);
    onSelectNote(newNote.id);
    playNoteTone(midi, 0.5);
  };

  // Delete note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeNotes(notes.filter((n) => n.id !== id));
    if (selectedNoteId === id) onSelectNote(null);
  };

  return (
    <div className="w-full bg-[#12121C] rounded-2xl border border-[#292938] p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white tracking-wide">Interactive Piano-Roll DAW Timeline</h3>
          <span className="text-xs text-slate-400 font-mono-data">
            {notes.length} Notes · Double-click grid to add note
          </span>
        </div>

        {selectedNoteId && (
          <button
            onClick={(e) => handleDeleteNote(selectedNoteId, e)}
            className="px-3 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 hover:text-red-200 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Note</span>
          </button>
        )}
      </div>

      {/* Main Timeline Workspace */}
      <div className="relative border border-[#292938] rounded-xl bg-[#09090F] overflow-hidden flex h-[400px]">
        {/* Left: Interactive Piano Keyboard */}
        <div className="w-20 shrink-0 bg-[#12121C] border-r border-[#292938] overflow-y-auto z-20 select-none">
          {midiRange.map((midi) => {
            const black = isBlackKey(midi);
            const pitchName = midiToPitchName(midi);
            return (
              <div
                key={midi}
                onClick={() => handleKeyClick(midi)}
                className={`h-7 px-2 flex items-center justify-between text-[10px] font-mono-data font-medium cursor-pointer transition-colors border-b border-[#292938]/40 ${
                  black
                    ? 'bg-[#181826] text-slate-400 hover:bg-violet-900/40 hover:text-white'
                    : 'bg-[#212130] text-slate-200 hover:bg-violet-600/30 hover:text-white'
                }`}
              >
                <span>{pitchName}</span>
                {pitchName.startsWith('C') && !pitchName.includes('#') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Grid Canvas & Timeline Notes */}
        <div
          ref={gridRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative select-none"
        >
          {/* Measure Time Grid Lines */}
          <div
            className="relative"
            style={{ width: `${totalWidthPx}px`, height: `${midiRange.length * 28}px` }}
          >
            {/* Horizontal Pitch Row Grids */}
            {midiRange.map((midi, rowIdx) => {
              const black = isBlackKey(midi);
              return (
                <div
                  key={midi}
                  onClick={(e) => handleGridClick(e, midi)}
                  className={`absolute left-0 right-0 h-7 border-b border-[#292938]/30 cursor-crosshair ${
                    black ? 'bg-[#09090F]' : 'bg-[#12121C]/40'
                  }`}
                  style={{ top: `${rowIdx * 28}px` }}
                ></div>
              );
            })}

            {/* Vertical Measure Beat Line Overlays */}
            {Array.from({ length: Math.ceil((duration || 8) * 2) }).map((_, beatIdx) => {
              const leftPx = (beatIdx * 0.5) * pxPerSecond;
              const isMajorBar = beatIdx % 4 === 0;
              return (
                <div
                  key={beatIdx}
                  className={`absolute top-0 bottom-0 pointer-events-none ${
                    isMajorBar ? 'border-r border-[#292938] font-mono-data text-[9px] text-slate-600 pl-1 pt-0.5' : 'border-r border-[#292938]/30'
                  }`}
                  style={{ left: `${leftPx}px` }}
                >
                  {isMajorBar && `${Math.floor(beatIdx / 4) + 1}.1`}
                </div>
              );
            })}

            {/* Playhead Scrubber */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_10px_#06B6D4] z-30 pointer-events-none transition-all"
              style={{ left: `${currentTime * pxPerSecond}px` }}
            >
              <div className="w-3 h-3 bg-cyan-400 rotate-45 -ml-1.25 -mt-1 shadow-md"></div>
            </div>

            {/* Render Note Blocks */}
            {notes.map((note) => {
              const midi = note.midiNote || 60;
              const rowIndex = midiRange.indexOf(midi);
              if (rowIndex === -1) return null;

              const topPx = rowIndex * 28 + 2;
              const leftPx = note.startTime * pxPerSecond;
              const widthPx = Math.max(16, note.duration * pxPerSecond);
              const isSelected = selectedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNote(note.id);
                    playNoteTone(midi, note.duration, note.velocity);
                  }}
                  className={`absolute h-6 rounded-md px-2 flex items-center justify-between text-[10px] font-mono-data font-semibold cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white border-white shadow-[0_0_15px_rgba(139,92,246,0.6)] z-20'
                      : 'bg-violet-600/80 hover:bg-violet-500 text-violet-100 border-violet-400/50 shadow-sm z-10'
                  }`}
                  style={{
                    top: `${topPx}px`,
                    left: `${leftPx}px`,
                    width: `${widthPx}px`,
                  }}
                >
                  <span className="truncate">{note.pitch}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
