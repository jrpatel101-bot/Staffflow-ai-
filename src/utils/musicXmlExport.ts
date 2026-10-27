import { Note, TranscriptionData } from '../types/music';

/**
 * Generates formatted MusicXML (.musicxml) string for score software like Sibelius, Finale, or MuseScore.
 */
export function exportToMusicXml(transcription: TranscriptionData): void {
  const { title, keySignature, timeSignature, bpm, notes } = transcription;

  const beats = timeSignature.split('/')[0] || '4';
  const beatType = timeSignature.split('/')[1] || '4';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(title || 'StaffFlow AI Transcription')}</work-title>
  </work>
  <identification>
    <creator type="composer">Transcribed by StaffFlow AI</creator>
    <encoding>
      <software>StaffFlow AI Workstation</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>${escapeXml(transcription.instrument.toUpperCase())}</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>${beats}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <sound tempo="${bpm || 120}"/>\n`;

  notes.slice(0, 100).forEach((n, idx) => {
    const pitchLetter = n.pitch.charAt(0) || 'C';
    const isSharp = n.pitch.includes('#');
    const isFlat = n.pitch.includes('b');
    const octave = n.pitch.slice(-1) || '4';

    xml += `      <note>
        <pitch>
          <step>${pitchLetter}</step>
          ${isSharp ? '<alter>1</alter>' : isFlat ? '<alter>-1</alter>' : ''}
          <octave>${octave}</octave>
        </pitch>
        <duration>${Math.max(1, Math.round(n.duration * 4))}</duration>
        <type>quarter</type>
      </note>\n`;
  });

  xml += `    </measure>
  </part>
</score-partwise>`;

  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(title || 'StaffFlow_Sheet').replace(/[^a-z0-9_-]/gi, '_')}.musicxml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
