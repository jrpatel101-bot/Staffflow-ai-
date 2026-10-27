import React from 'react';
import { Sliders, ShieldCheck, Cpu, Radio, Sparkles } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#12121C] rounded-2xl border border-[#292938] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-[#292938] pb-4">
        <Sliders className="w-6 h-6 text-violet-400" />
        <div className="flex flex-col">
          <h2 className="text-lg font-display font-semibold text-white">Audio Engine Configuration</h2>
          <p className="text-xs text-slate-400">Manage StaffFlow AI model profiles and DSP processing.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Model Engine */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#09090F] border border-[#292938]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI Transcription Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-violet-600/20 text-violet-300 font-mono-data">
              gemini-3.5-transcribe
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-precision polyphonic pitch and harmonic detection with automated key signature and measure alignment.
          </p>
        </div>

        {/* DSP Sample Rate */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#09090F] border border-[#292938]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-violet-400" />
              Web Audio Synthesis
            </span>
            <span className="text-xs font-mono-data text-slate-300">44.1 kHz / 16-bit PCM</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time Web Audio API oscillator synthesis with ADSR envelopes for piano roll auditioning.
          </p>
        </div>

        {/* Privacy & Storage */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Zero Storage Privacy Policy
            </span>
            <span className="text-xs font-mono-data text-emerald-400">Strict In-Memory</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All audio uploads, micro-recordings, and transcribed scores remain strictly in volatile memory. No audio or note data is written to permanent storage, localStorage, or databases.
          </p>
        </div>
      </div>
    </div>
  );
};
