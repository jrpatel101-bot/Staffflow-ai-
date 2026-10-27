import React from 'react';
import { Loader2, AlertCircle, RefreshCw, X, Disc3, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProcessingStage, InstrumentId } from '../../types/music';

interface TranscriptionProcessorProps {
  stage: ProcessingStage;
  progressPercent: number;
  instrument: InstrumentId;
  errorMessage?: string;
  onCancel: () => void;
  onRetry: () => void;
}

export const TranscriptionProcessor: React.FC<TranscriptionProcessorProps> = ({
  stage,
  progressPercent,
  instrument,
  errorMessage,
  onCancel,
  onRetry,
}) => {
  const getStageLabel = () => {
    switch (stage) {
      case 'uploading':
        return 'Preparing Audio Buffer...';
      case 'reading_audio':
        return 'Analyzing Spectral Frequencies & Harmonics...';
      case 'detecting_pitch':
        return 'Extracting Polyphonic Pitch & Velocity Sequences...';
      case 'extracting_harmonics':
        return 'Aligning Key Signature, Time Signature & Measures...';
      case 'formatting_notation':
        return 'Formatting Sheet Music Staves & MIDI Tracks...';
      case 'completed':
        return 'Transcription Completed!';
      case 'error':
        return 'Transcription Failed';
      default:
        return 'Processing Audio...';
    }
  };

  const stagesList = [
    { key: 'reading_audio', label: 'Audio Analysis' },
    { key: 'detecting_pitch', label: 'Pitch & Velocity Detection' },
    { key: 'extracting_harmonics', label: 'Harmonic Alignment' },
    { key: 'formatting_notation', label: 'Score & MIDI Generation' },
  ];

  if (stage === 'error') {
    return (
      <div className="rounded-2xl bg-red-950/20 border border-red-500/30 p-8 my-8 flex flex-col items-center justify-center gap-4 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Transcription Error</h3>
        <p className="text-xs text-red-300 leading-relaxed max-w-md">
          {errorMessage || 'Failed to process audio transcription. Please ensure the audio recording is clear and try again.'}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Transcription</span>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-[#181826] border border-[#292938] text-xs text-slate-300 hover:text-white"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#12121C] border border-[#292938] p-8 my-8 shadow-[0_0_40px_rgba(139,92,246,0.15)] flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#292938] pb-4">
        <div className="flex items-center gap-3">
          <Disc3 className="w-6 h-6 text-violet-400 animate-spin" />
          <div className="flex flex-col">
            <h3 className="font-display font-semibold text-white text-base">StaffFlow AI Transcriber</h3>
            <span className="text-xs text-slate-400">Target Profile: {instrument.toUpperCase()}</span>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-[#181826] border border-[#292938] text-slate-400 hover:text-white transition-colors"
          title="Cancel Transcription"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Status */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-violet-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {getStageLabel()}
          </span>
          <span className="text-slate-400 font-mono-data">{progressPercent}%</span>
        </div>

        {/* Outer Bar */}
        <div className="w-full h-2.5 bg-[#09090F] rounded-full overflow-hidden border border-[#292938]">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 transition-all duration-300 shadow-[0_0_12px_#8B5CF6]"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Animated Waveform Visualizer */}
      <div className="h-16 bg-[#09090F] rounded-xl border border-[#292938] flex items-center justify-center gap-1.5 px-6">
        {[20, 45, 75, 30, 90, 60, 100, 40, 80, 50, 95, 35, 70, 85, 40, 65, 30, 90].map((h, idx) => (
          <div
            key={idx}
            className="w-1.5 bg-gradient-to-t from-violet-600 to-cyan-400 rounded-full animate-pulse"
            style={{
              height: `${h}%`,
              animationDuration: `${0.6 + (idx % 4) * 0.2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Stages Checklist */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {stagesList.map((stg, i) => {
          const isDone = progressPercent >= (i + 1) * 25;
          const isCurrent = progressPercent >= i * 25 && progressPercent < (i + 1) * 25;
          return (
            <div
              key={stg.key}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-violet-950/30 border-violet-500/40 text-violet-200'
                  : 'bg-[#09090F] border-[#292938] text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></div>
              )}
              <span className="font-medium truncate">{stg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
