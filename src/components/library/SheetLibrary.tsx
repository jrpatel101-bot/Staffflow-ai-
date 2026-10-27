import React from 'react';
import { Library, Play, Download, Trash2, Music2, Clock } from 'lucide-react';
import { TranscriptionData } from '../../types/music';

interface SheetLibraryProps {
  recentTranscriptions: TranscriptionData[];
  onOpenTranscription: (data: TranscriptionData) => void;
  onClearLibrary: () => void;
}

export const SheetLibrary: React.FC<SheetLibraryProps> = ({
  recentTranscriptions,
  onOpenTranscription,
  onClearLibrary,
}) => {
  if (recentTranscriptions.length === 0) {
    return (
      <div className="w-full bg-[#12121C] rounded-2xl border border-[#292938] p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
          <Library className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No Transcriptions in Current Session</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          Transcribe an audio file or test with demo melodies to view saved in-memory session scores here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[#292938] pb-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-display font-semibold text-white">In-Memory Session Score Library</h2>
          <p className="text-xs text-slate-400">
            {recentTranscriptions.length} transcribed scores in current session memory.
          </p>
        </div>

        <button
          onClick={onClearLibrary}
          className="px-3 py-1.5 rounded-lg bg-[#181826] hover:bg-red-950/40 border border-[#292938] text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Memory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentTranscriptions.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenTranscription(item)}
            className="rounded-xl bg-[#12121C] border border-[#292938] hover:border-violet-500/50 p-5 cursor-pointer transition-all hover:bg-[#181826] group shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
                <Music2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono-data text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm text-white truncate group-hover:text-violet-300 transition-colors">
                {item.title}
              </h3>
              <span className="text-xs text-slate-400 font-mono-data">
                {item.keySignature} · {item.bpm} BPM · {item.notes.length} notes
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#292938] text-xs font-medium text-violet-400">
              <span>Open in DAW Editor</span>
              <Play className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
