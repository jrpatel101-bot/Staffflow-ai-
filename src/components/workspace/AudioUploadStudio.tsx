import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  ShieldCheck,
  Radio,
  FileAudio,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { AudioFileMeta } from '../../types/music';
import { extractWaveformPeaks, getAudioContext, audioBufferToWavBlob } from '../../utils/audio';

interface AudioUploadStudioProps {
  audioMeta: AudioFileMeta | null;
  onAudioSelected: (meta: AudioFileMeta) => void;
  onClearAudio: () => void;
  onLoadDemo: (demoType: 'furelise' | 'jazz' | 'guitar') => void;
}

export const AudioUploadStudio: React.FC<AudioUploadStudioProps> = ({
  audioMeta,
  onAudioSelected,
  onClearAudio,
  onLoadDemo,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Extract REAL waveform peaks when audioMeta changes
  useEffect(() => {
    if (audioMeta?.buffer) {
      const peaks = extractWaveformPeaks(audioMeta.buffer, 120);
      setWaveformPeaks(peaks);
      setDuration(audioMeta.duration || audioMeta.buffer.duration);
    } else if (audioMeta?.url) {
      // Decode audio from URL if buffer not attached
      fetch(audioMeta.url)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => getAudioContext().decodeAudioData(arrayBuffer))
        .then((decodedBuffer) => {
          const peaks = extractWaveformPeaks(decodedBuffer, 120);
          setWaveformPeaks(peaks);
          setDuration(decodedBuffer.duration);
        })
        .catch((err) => {
          console.warn('Waveform decoding error:', err);
          // Fallback peaks if decoding blocked
          setWaveformPeaks(Array.from({ length: 120 }, () => Math.random() * 0.6 + 0.2));
        });
    }
  }, [audioMeta]);

  // Audio element time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  // Process uploaded audio file
  const processFile = async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit. Please upload a smaller audio file.');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const arrayBuffer = await file.arrayBuffer();
      const ctx = getAudioContext();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      const meta: AudioFileMeta = {
        name: file.name,
        size: file.size,
        duration: decodedBuffer.duration,
        type: file.type || 'audio/mp3',
        url,
        buffer: decodedBuffer,
      };

      onAudioSelected(meta);
    } catch (err) {
      console.error('File reading error:', err);
      // Fallback
      const url = URL.createObjectURL(file);
      onAudioSelected({
        name: file.name,
        size: file.size,
        duration: 0,
        type: file.type || 'audio/mp3',
        url,
      });
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        const arrayBuffer = await audioBlob.arrayBuffer();
        const ctx = getAudioContext();
        let decodedBuffer: AudioBuffer | undefined;

        try {
          decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
          console.warn('Record decode warning:', e);
        }

        const meta: AudioFileMeta = {
          name: `Recording_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`,
          size: audioBlob.size,
          duration: decodedBuffer ? decodedBuffer.duration : recordSeconds,
          type: 'audio/webm',
          url,
          buffer: decodedBuffer,
        };

        onAudioSelected(meta);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unsupported by browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full mb-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg"
        className="hidden"
      />

      {!audioMeta ? (
        /* Large Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all p-8 md:p-12 text-center flex flex-col items-center justify-center gap-6 ${
            isDragging
              ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_30px_rgba(139,92,246,0.25)]'
              : 'border-[#292938] bg-[#12121C] hover:border-violet-500/50 hover:bg-[#181826]'
          }`}
        >
          {/* Graphic Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-violet-600/20 to-purple-900/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)] group">
            <UploadCloud className="w-10 h-10 text-violet-400 group-hover:scale-110 transition-transform" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-md">
            <h2 className="text-xl font-display font-semibold text-white">
              Drop audio file here, or browse
            </h2>
            <p className="text-xs text-slate-400">
              Supports WAV, MP3, M4A, FLAC, OGG up to 50MB. In-memory studio processing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2"
            >
              <FileAudio className="w-4 h-4" />
              <span>Browse Audio Files</span>
            </button>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-5 py-2.5 rounded-xl bg-[#181826] hover:bg-[#292938] border border-[#292938] text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Record Audio</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-all flex items-center gap-2 animate-pulse"
              >
                <Radio className="w-4 h-4 text-white" />
                <span>Stop Recording ({formatTime(recordSeconds)})</span>
              </button>
            )}

            <button
              onClick={() => setShowUrlModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#181826] hover:bg-[#292938] border border-[#292938] text-slate-300 font-medium text-xs transition-all flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-cyan-400" />
              <span>Audio URL</span>
            </button>
          </div>

          {/* Demo Presets Row */}
          <div className="pt-4 border-t border-[#292938] w-full max-w-lg flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Or test with demo audio:</span>
            <div className="flex gap-2">
              <button
                onClick={() => onLoadDemo('furelise')}
                className="px-2.5 py-1 rounded-md bg-[#181826] hover:bg-violet-600/20 hover:text-violet-300 border border-[#292938] text-[11px] transition-colors"
              >
                Piano Classic
              </button>
              <button
                onClick={() => onLoadDemo('jazz')}
                className="px-2.5 py-1 rounded-md bg-[#181826] hover:bg-violet-600/20 hover:text-violet-300 border border-[#292938] text-[11px] transition-colors"
              >
                Jazz Lick
              </button>
              <button
                onClick={() => onLoadDemo('guitar')}
                className="px-2.5 py-1 rounded-md bg-[#181826] hover:bg-violet-600/20 hover:text-violet-300 border border-[#292938] text-[11px] transition-colors"
              >
                Acoustic Guitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected Audio Player Studio */
        <div className="rounded-2xl bg-[#12121C] border border-[#292938] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <audio
            ref={audioRef}
            src={audioMeta.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleTimeUpdate}
          />

          <div className="flex flex-col gap-6">
            {/* Header / Info Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#292938] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-sm truncate max-w-xs sm:max-w-md">
                    {audioMeta.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-data">
                    {(audioMeta.size / (1024 * 1024)).toFixed(2)} MB · {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Replace / Clear Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#181826] hover:bg-[#292938] border border-[#292938] text-xs text-slate-300 hover:text-white transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={onClearAudio}
                  className="p-1.5 rounded-lg bg-[#181826] hover:bg-red-950/40 border border-[#292938] text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove Audio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* REAL Waveform Visualizer Display */}
            <div className="relative h-24 bg-[#09090F] rounded-xl border border-[#292938] px-4 flex items-center gap-1 overflow-hidden">
              {/* Playhead line overlay */}
              {duration > 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_#06B6D4] z-10 transition-all"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                ></div>
              )}

              {/* Real Waveform Peak Bars */}
              <div className="w-full h-full flex items-center justify-between gap-[2px]">
                {waveformPeaks.map((peak, idx) => {
                  const barPercent = (idx / waveformPeaks.length) * 100;
                  const isPlayed = duration > 0 && barPercent <= (currentTime / duration) * 100;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (audioRef.current && duration > 0) {
                          const targetSec = (idx / waveformPeaks.length) * duration;
                          audioRef.current.currentTime = targetSec;
                          setCurrentTime(targetSec);
                        }
                      }}
                      className={`w-full rounded-full transition-all cursor-pointer ${
                        isPlayed
                          ? 'bg-gradient-to-t from-violet-600 to-lavender-highlight shadow-[0_0_6px_rgba(139,92,246,0.5)]'
                          : 'bg-[#292938] hover:bg-violet-400/50'
                      }`}
                      style={{ height: `${Math.max(10, peak * 85)}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Play/Pause Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all shrink-0"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <span className="text-xs font-mono-data text-slate-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (audioRef.current) audioRef.current.muted = !isMuted;
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 bg-[#292938] accent-violet-500 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121C] border border-[#292938] rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Load Audio from URL</h3>
            <p className="text-xs text-slate-400">
              Enter a direct link to an MP3, WAV, or OGG audio file.
            </p>
            <input
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#09090F] border border-[#292938] rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 rounded-lg bg-[#181826] border border-[#292938] text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (urlInput.trim()) {
                    onAudioSelected({
                      name: 'Remote Audio',
                      size: 0,
                      duration: 0,
                      type: 'audio/mp3',
                      url: urlInput.trim(),
                    });
                    setShowUrlModal(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white"
              >
                Load Audio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
