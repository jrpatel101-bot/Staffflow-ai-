import React from 'react';
import { Sparkles, Waves, Disc, Music } from 'lucide-react';

export const HeroWorkspace: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#12121C] to-[#09090F] border border-[#292938] p-6 md:p-8 mb-8">
      {/* Restrained Violet Glow Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-violet-600/10 blur-[90px] pointer-events-none rounded-full"></div>
      <div className="absolute top-10 right-10 w-64 h-32 bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Text Content */}
        <div className="flex flex-col gap-2 max-w-2xl text-center md:text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 self-center md:self-start px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Music Workspace</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Turn any melody into music.
          </h1>

          {/* Supporting Text */}
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Transcribe audio recordings into editable sheet music, MIDI, and professional musical notation in seconds.
          </p>
        </div>

        {/* Animated Audio Waveform Graphic */}
        <div className="shrink-0 flex items-center justify-center p-4 rounded-xl bg-[#12121C]/80 border border-[#292938] shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          <div className="flex items-center gap-1.5 h-12 px-2">
            {[40, 70, 30, 90, 50, 100, 60, 30, 80, 45, 95, 35, 75, 50, 85, 40].map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-violet-600 to-lavender-highlight animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.8 + (i % 5) * 0.2}s`,
                  animationDelay: `${(i % 3) * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
