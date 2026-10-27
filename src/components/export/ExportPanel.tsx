import React, { useState } from 'react';
import { Download, FileText, Music2, FileCode, Check, Sparkles } from 'lucide-react';
import { TranscriptionData } from '../../types/music';
import { exportToMidiFile } from '../../utils/midiExport';
import { exportToMusicXml } from '../../utils/musicXmlExport';
import { exportToPdf } from '../../utils/pdfExport';

interface ExportPanelProps {
  transcription: TranscriptionData | null;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ transcription }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!transcription) return null;

  const triggerMidiDownload = () => {
    setDownloadingFormat('midi');
    exportToMidiFile(transcription.notes, transcription.bpm, transcription.title);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  const triggerMusicXmlDownload = () => {
    setDownloadingFormat('xml');
    exportToMusicXml(transcription);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  const triggerPdfDownload = () => {
    setDownloadingFormat('pdf');
    exportToPdf(transcription);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  const triggerJsonDownload = () => {
    setDownloadingFormat('json');
    const jsonStr = JSON.stringify(transcription, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcription.title.replace(/[^a-z0-9_-]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  return (
    <div className="w-full bg-[#12121C] rounded-2xl border border-[#292938] p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#292938] pb-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Export & DAW Integration Panel</span>
          </h3>
          <p className="text-xs text-slate-400">
            Export standard formats for Ableton, Logic Pro, FL Studio, Sibelius, and MuseScore.
          </p>
        </div>
      </div>

      {/* Export Toolbar Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Download MIDI */}
        <button
          onClick={triggerMidiDownload}
          className="p-4 rounded-xl bg-[#181826] hover:bg-violet-600/20 border border-[#292938] hover:border-violet-500/50 text-white transition-all flex flex-col gap-2 group shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center">
              <Music2 className="w-4 h-4" />
            </div>
            {downloadingFormat === 'midi' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-violet-300 transition-colors" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs text-white">Download MIDI (.mid)</span>
            <span className="text-[10px] text-slate-400">Standard MIDI file for all DAWs</span>
          </div>
        </button>

        {/* Export PDF Sheet Music */}
        <button
          onClick={triggerPdfDownload}
          className="p-4 rounded-xl bg-[#181826] hover:bg-violet-600/20 border border-[#292938] hover:border-violet-500/50 text-white transition-all flex flex-col gap-2 group shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            {downloadingFormat === 'pdf' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 transition-colors" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs text-white">Export PDF Score</span>
            <span className="text-[10px] text-slate-400">Printable sheet music PDF score</span>
          </div>
        </button>

        {/* Export MusicXML */}
        <button
          onClick={triggerMusicXmlDownload}
          className="p-4 rounded-xl bg-[#181826] hover:bg-violet-600/20 border border-[#292938] hover:border-violet-500/50 text-white transition-all flex flex-col gap-2 group shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-300 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            {downloadingFormat === 'xml' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs text-white">Export MusicXML</span>
            <span className="text-[10px] text-slate-400">Sibelius, Finale & MuseScore</span>
          </div>
        </button>

        {/* Export JSON Data */}
        <button
          onClick={triggerJsonDownload}
          className="p-4 rounded-xl bg-[#181826] hover:bg-violet-600/20 border border-[#292938] hover:border-violet-500/50 text-white transition-all flex flex-col gap-2 group shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-300 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            {downloadingFormat === 'json' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition-colors" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs text-white">Export JSON Data</span>
            <span className="text-[10px] text-slate-400">Raw note events and metadata</span>
          </div>
        </button>
      </div>
    </div>
  );
};
