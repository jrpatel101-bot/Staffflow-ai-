import { TranscriptionData } from '../types/music';

/**
 * Triggers clean sheet music printing / PDF export via browser print dialog formatted as an elegant score page.
 */
export function exportToPdf(transcription: TranscriptionData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const notesList = transcription.notes.map((n) => `${n.pitch} (${n.duration.toFixed(2)}s)`).join(' · ');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${transcription.title || 'StaffFlow AI Sheet Music'}</title>
  <style>
    @page { size: A4 portrait; margin: 20mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 20px; line-height: 1.5; }
    .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 25px; }
    .title { font-size: 28px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .subtitle { font-size: 14px; color: #555; margin-top: 5px; }
    .meta-grid { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    .staff-row { margin-bottom: 30px; background: #fff; padding: 10px 0; }
    .staff-lines { position: relative; height: 40px; border-top: 1px solid #333; border-bottom: 1px solid #333; }
    .staff-lines::before, .staff-lines::after { content: ''; position: absolute; left: 0; right: 0; height: 1px; background: #333; }
    .staff-lines::before { top: 10px; }
    .staff-lines::after { top: 20px; }
    .staff-middle { position: absolute; top: 30px; left: 0; right: 0; height: 1px; background: #333; }
    .clef { font-size: 32px; font-family: serif; position: absolute; left: 10px; top: -5px; }
    .notes-text { font-family: monospace; font-size: 12px; margin-top: 15px; line-height: 1.8; word-break: break-all; }
    .footer { position: fixed; bottom: 10mm; left: 0; right: 0; text-align: center; font-size: 10px; color: #777; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${transcription.title}</h1>
    <div class="subtitle">AI Transcribed Score · StaffFlow AI Studio</div>
  </div>
  <div class="meta-grid">
    <div>Key: ${transcription.keySignature}</div>
    <div>Time: ${transcription.timeSignature}</div>
    <div>Tempo: ${transcription.bpm} BPM</div>
    <div>Instrument: ${transcription.instrument.toUpperCase()}</div>
  </div>

  <div class="staff-row">
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Treble Staff (Melody)</div>
    <div class="staff-lines">
      <div class="clef">𝄞</div>
      <div class="staff-middle"></div>
    </div>
  </div>

  <div style="margin-top: 20px;">
    <h3 style="font-size: 14px; margin-bottom: 8px;">Transcribed Pitch Sequence (${transcription.notes.length} Notes):</h3>
    <div class="notes-text">${notesList}</div>
  </div>

  <div class="footer">
    Transcribed with StaffFlow AI · Private Session · Page 1 of 1
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
