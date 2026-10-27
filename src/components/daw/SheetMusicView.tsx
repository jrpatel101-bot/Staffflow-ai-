import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Accidental, Voice, Formatter } from 'vexflow';
import { TranscriptionData } from '../../types/music';

interface SheetMusicViewProps {
  transcription: TranscriptionData;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export const SheetMusicView: React.FC<SheetMusicViewProps> = ({
  transcription,
  selectedNoteId,
  onSelectNote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const renderer = new Renderer(
        containerRef.current,
        Renderer.Backends.SVG
      );

      const width = Math.max(800, containerRef.current.clientWidth - 32);
      renderer.resize(width, 220);
      const context = renderer.getContext();
      context.setFont('Arial', 10, '');
      context.setStrokeStyle('#B9A0FF');
      context.setFillStyle('#F1F5F9');

      // Stave 1 (Treble Clef)
      const stave = new Stave(10, 40, width - 20);
      stave.addClef(transcription.clef === 'bass' ? 'bass' : 'treble');
      stave.addTimeSignature(transcription.timeSignature || '4/4');
      
      // Clean key signature format
      const cleanKey = (transcription.keySignature || 'C').split(' ')[0];
      try {
        stave.addKeySignature(cleanKey);
      } catch (e) {
        // Fallback
      }

      stave.setContext(context).draw();

      // Convert transcription notes into VexFlow StaveNote objects
      const staveNotes: StaveNote[] = [];

      const displayNotes = transcription.notes.slice(0, 16); // First 16 notes for measure display

      displayNotes.forEach((n) => {
        // Format pitch e.g. "C/4"
        const p = n.pitch.replace(/([A-G][#b]?)(-?\d)/i, '$1/$2');
        const keys = [p || 'c/4'];
        
        // Determine duration e.g. "q" (quarter), "h" (half), "e" (eighth)
        let duration = 'q';
        if (n.duration >= 1.5) duration = 'h';
        else if (n.duration <= 0.4) duration = '8';

        try {
          const staveNote = new StaveNote({
            keys,
            duration,
            clef: transcription.clef === 'bass' ? 'bass' : 'treble',
          });

          if (n.pitch.includes('#')) {
            staveNote.addModifier(new Accidental('#'), 0);
          } else if (n.pitch.includes('b')) {
            staveNote.addModifier(new Accidental('b'), 0);
          }

          staveNotes.push(staveNote);
        } catch (e) {
          console.warn('VexNote formatting fallback:', p);
        }
      });

      if (staveNotes.length > 0) {
        // Create voice and format notes
        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables(staveNotes);

        const formatter = new Formatter();
        formatter.joinVoices([voice]).format([voice], width - 100);
        voice.draw(context, stave);
      }
    } catch (err) {
      console.error('VexFlow rendering error:', err);
    }
  }, [transcription]);

  return (
    <div className="w-full bg-[#12121C] rounded-2xl border border-[#292938] p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col gap-4 overflow-x-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
          <span>Sheet Music Score Canvas</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 font-mono-data">
            {transcription.keySignature} · {transcription.timeSignature} · {transcription.bpm} BPM
          </span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">Standard VexFlow Notation</span>
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        className="w-full bg-[#09090F] rounded-xl border border-[#292938] p-4 min-h-[220px] flex items-center justify-center overflow-x-auto"
      ></div>
    </div>
  );
};
