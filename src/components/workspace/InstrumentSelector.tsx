import React from 'react';
import {
  Piano,
  Guitar,
  Music4,
  Drum,
  Mic2,
  Sparkles,
  Check,
  Layers,
  Wind
} from 'lucide-react';
import { InstrumentId, PianoCoverLevel, InstrumentOption } from '../../types/music';

interface InstrumentSelectorProps {
  selectedInstrument: InstrumentId;
  onSelectInstrument: (id: InstrumentId) => void;
  pianoCoverMode: boolean;
  setPianoCoverMode: (enabled: boolean) => void;
  pianoCoverLevel: PianoCoverLevel;
  setPianoCoverLevel: (level: PianoCoverLevel) => void;
}

export const INSTRUMENTS: InstrumentOption[] = [
  {
    id: 'piano',
    name: 'Piano',
    category: 'Keyboards',
    description: 'Grand piano, keyboard melody & chord polyphony',
    polyphonic: true,
    recommendedClef: 'grand',
    icon: 'piano',
  },
  {
    id: 'guitar',
    name: 'Guitar',
    category: 'Strings',
    description: 'Acoustic, electric, lead & rhythm tabs',
    polyphonic: true,
    recommendedClef: 'treble',
    icon: 'guitar',
  },
  {
    id: 'bass',
    name: 'Bass',
    category: 'Strings',
    description: 'Electric & upright basslines',
    polyphonic: false,
    recommendedClef: 'bass',
    icon: 'bass',
  },
  {
    id: 'violin',
    name: 'Violin',
    category: 'Strings',
    description: 'Classical & solo violin lines',
    polyphonic: false,
    recommendedClef: 'treble',
    icon: 'violin',
  },
  {
    id: 'flute',
    name: 'Flute',
    category: 'Winds',
    description: 'Woodwind & flute solos',
    polyphonic: false,
    recommendedClef: 'treble',
    icon: 'flute',
  },
  {
    id: 'trumpet',
    name: 'Trumpet',
    category: 'Winds',
    description: 'Brass lead & trumpet lines',
    polyphonic: false,
    recommendedClef: 'treble',
    icon: 'trumpet',
  },
  {
    id: 'saxophone',
    name: 'Saxophone',
    category: 'Winds',
    description: 'Alto/Tenor saxophone solos',
    polyphonic: false,
    recommendedClef: 'treble',
    icon: 'saxophone',
  },
  {
    id: 'drums',
    name: 'Drums',
    category: 'Percussion',
    description: 'Rhythm, beat & drum kit transcription',
    polyphonic: true,
    recommendedClef: 'percussion',
    icon: 'drums',
  },
  {
    id: 'vocals',
    name: 'Vocals',
    category: 'Voice',
    description: 'Lead vocal melody & pitch tracking',
    polyphonic: false,
    recommendedClef: 'treble',
    icon: 'vocals',
  },
  {
    id: 'multi',
    name: 'Multi-instrument',
    category: 'Ensemble',
    description: 'Full arrangement stem separation & multi-track score',
    polyphonic: true,
    recommendedClef: 'grand',
    icon: 'multi',
  },
];

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstrument,
  onSelectInstrument,
  pianoCoverMode,
  setPianoCoverMode,
  pianoCoverLevel,
  setPianoCoverLevel,
}) => {
  const renderInstrumentIcon = (id: InstrumentId) => {
    switch (id) {
      case 'piano':
        return <Piano className="w-6 h-6" />;
      case 'guitar':
        return <Guitar className="w-6 h-6" />;
      case 'bass':
        return <Music4 className="w-6 h-6 text-indigo-400" />;
      case 'violin':
        return <Music4 className="w-6 h-6 text-purple-400" />;
      case 'flute':
      case 'trumpet':
      case 'saxophone':
        return <Wind className="w-6 h-6 text-cyan-400" />;
      case 'drums':
        return <Drum className="w-6 h-6" />;
      case 'vocals':
        return <Mic2 className="w-6 h-6" />;
      case 'multi':
        return <Layers className="w-6 h-6 text-violet-400" />;
      default:
        return <Piano className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full mb-8 flex flex-col gap-6">
      {/* Title & Piano Cover Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            Target Instrument & Arrangement
          </h2>
          <p className="text-xs text-slate-400">
            Select the instrument profile to optimize pitch detection and score formatting.
          </p>
        </div>

        {/* Piano Cover Mode Switch */}
        <div className="flex items-center gap-3 p-1.5 rounded-xl bg-[#12121C] border border-[#292938]">
          <button
            onClick={() => setPianoCoverMode(!pianoCoverMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              pianoCoverMode
                ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Piano Cover Mode</span>
          </button>

          {pianoCoverMode && (
            <div className="flex items-center gap-1 border-l border-[#292938] pl-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as PianoCoverLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setPianoCoverLevel(lvl)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    pianoCoverLevel === lvl
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instrument Tile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {INSTRUMENTS.map((inst) => {
          const isSelected = selectedInstrument === inst.id;
          return (
            <div
              key={inst.id}
              onClick={() => onSelectInstrument(inst.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectInstrument(inst.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              className={`relative rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 border outline-none ${
                isSelected
                  ? 'bg-[#181826] border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] text-white'
                  : 'bg-[#12121C] border-[#292938] text-slate-400 hover:text-slate-200 hover:border-violet-500/40 hover:bg-[#181826]'
              }`}
            >
              {/* Checkmark Badge if selected */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-violet-600/20 text-violet-300' : 'bg-[#181826] text-slate-400'
                }`}
              >
                {renderInstrumentIcon(inst.id)}
              </div>

              {/* Title & Category */}
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-white leading-snug">{inst.name}</span>
                <span className="text-[10px] text-slate-500">{inst.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
