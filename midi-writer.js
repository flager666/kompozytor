/**
 * Harmonic Forge - Pure JavaScript Standard MIDI File (SMF Type 1) Binary Writer
 * Encodes multi-track MIDI with Program Change (General MIDI instruments) and zero external dependencies.
 */

function encodeVLQ(value) {
  let buffer = value & 0x7f;
  const bytes = [];
  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
  return bytes;
}

function writeString(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

function writeUInt32BE(val) {
  return [
    (val >>> 24) & 0xff,
    (val >>> 16) & 0xff,
    (val >>> 8) & 0xff,
    val & 0xff
  ];
}

function writeUInt16BE(val) {
  return [
    (val >>> 8) & 0xff,
    val & 0xff
  ];
}

export const GM_INSTRUMENTS = {
  // Lead
  piano: 0,
  rhodes: 4,
  synth_lead: 81,
  chiptune: 80,
  pluck: 12,
  vibraphone: 11,
  flute: 73,
  guitar: 24,

  // Pad
  warm_analog: 89,
  shimmer: 91,
  strings: 48,
  brass: 62,
  organ: 19,
  lofi: 5,

  // Bass
  moog: 38,
  sub: 39,
  upright: 32,
  picked: 34,
  acid: 38,
  boom808: 39
};

export class MidiTrackBuilder {
  constructor(name = '', channel = 0) {
    this.name = name;
    this.channel = channel;
    this.events = [];
    this.programNumber = undefined;
  }

  setProgram(prog) {
    this.programNumber = Math.min(127, Math.max(0, prog));
  }

  addNote(pitch, startTick, durationTicks, velocity = 90) {
    this.events.push({
      tick: startTick,
      type: 'note_on',
      pitch: Math.min(127, Math.max(0, pitch)),
      velocity: Math.min(127, Math.max(1, velocity))
    });
    this.events.push({
      tick: startTick + durationTicks,
      type: 'note_off',
      pitch: Math.min(127, Math.max(0, pitch)),
      velocity: 0
    });
  }

  buildTrackData() {
    this.events.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'note_off' && b.type !== 'note_off') return -1;
      if (a.type !== 'note_off' && b.type === 'note_off') return 1;
      return 0;
    });

    const trackBytes = [];

    // Track Name Meta Event
    if (this.name) {
      const nameBytes = writeString(this.name);
      trackBytes.push(0x00, 0xff, 0x03, nameBytes.length, ...nameBytes);
    }

    // Program Change event at delta 0
    if (this.programNumber !== undefined) {
      trackBytes.push(0x00, 0xc0 | (this.channel & 0x0f), this.programNumber & 0x7f);
    }

    let lastTick = 0;
    for (const ev of this.events) {
      const delta = ev.tick - lastTick;
      lastTick = ev.tick;

      trackBytes.push(...encodeVLQ(delta));
      if (ev.type === 'note_on') {
        trackBytes.push(0x90 | (this.channel & 0x0f), ev.pitch, ev.velocity);
      } else if (ev.type === 'note_off') {
        trackBytes.push(0x80 | (this.channel & 0x0f), ev.pitch, 0);
      }
    }

    // End of Track
    trackBytes.push(0x00, 0xff, 0x2f, 0x00);

    return [
      ...writeString('MTrk'),
      ...writeUInt32BE(trackBytes.length),
      ...trackBytes
    ];
  }
}

export class MidiFileWriter {
  constructor(bpm = 120, ticksPerBeat = 480) {
    this.bpm = bpm;
    this.ticksPerBeat = ticksPerBeat;
    this.tracks = [];
  }

  addTrack(track) {
    this.tracks.push(track);
  }

  buildConductorTrack() {
    const trackBytes = [];
    trackBytes.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);

    const mpqn = Math.round(60000000 / this.bpm);
    trackBytes.push(
      0x00, 0xff, 0x51, 0x03,
      (mpqn >>> 16) & 0xff,
      (mpqn >>> 8) & 0xff,
      mpqn & 0xff
    );

    trackBytes.push(0x00, 0xff, 0x2f, 0x00);

    return [
      ...writeString('MTrk'),
      ...writeUInt32BE(trackBytes.length),
      ...trackBytes
    ];
  }

  buildUint8Array() {
    const totalTracks = this.tracks.length + 1;
    const headerBytes = [
      ...writeString('MThd'),
      ...writeUInt32BE(6),
      ...writeUInt16BE(1),
      ...writeUInt16BE(totalTracks),
      ...writeUInt16BE(this.ticksPerBeat)
    ];

    const fileBytes = [
      ...headerBytes,
      ...this.buildConductorTrack()
    ];

    for (const track of this.tracks) {
      fileBytes.push(...track.buildTrackData());
    }

    return new Uint8Array(fileBytes);
  }

  download(filename = 'harmonic_melody.mid') {
    const uint8 = this.buildUint8Array();
    const blob = new Blob([uint8], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export function exportCompositionToMidi(composition, filename = 'generated_melody.mid', options = {}) {
  const { melodyNotes, chordNotes, bassNotes, bpm } = composition;
  const ticksPerBeat = 480;
  const writer = new MidiFileWriter(bpm || 120, ticksPerBeat);

  // Track 1: Melody Lead
  const melodyTrack = new MidiTrackBuilder('Melody Lead', 0);
  const leadProg = GM_INSTRUMENTS[options.leadInstrument || 'piano'] ?? 0;
  melodyTrack.setProgram(leadProg);

  melodyNotes.forEach(n => {
    melodyTrack.addNote(
      n.pitch,
      Math.round(n.startBeat * ticksPerBeat),
      Math.round(n.durationBeats * ticksPerBeat),
      n.velocity
    );
  });
  writer.addTrack(melodyTrack);

  // Track 2: Harmony Pad
  if (options.includeChords !== false && chordNotes && chordNotes.length > 0) {
    const chordTrack = new MidiTrackBuilder('Harmony Pad', 1);
    const padProg = GM_INSTRUMENTS[options.padInstrument || 'warm_analog'] ?? 89;
    chordTrack.setProgram(padProg);

    chordNotes.forEach(n => {
      chordTrack.addNote(
        n.pitch,
        Math.round(n.startBeat * ticksPerBeat),
        Math.round(n.durationBeats * ticksPerBeat),
        n.velocity
      );
    });
    writer.addTrack(chordTrack);
  }

  // Track 3: Bass Line
  if (options.includeBass !== false && bassNotes && bassNotes.length > 0) {
    const bassTrack = new MidiTrackBuilder('Bass Line', 2);
    const bassProg = GM_INSTRUMENTS[options.bassInstrument || 'moog'] ?? 38;
    bassTrack.setProgram(bassProg);

    bassNotes.forEach(n => {
      bassTrack.addNote(
        n.pitch,
        Math.round(n.startBeat * ticksPerBeat),
        Math.round(n.durationBeats * ticksPerBeat),
        n.velocity
      );
    });
    writer.addTrack(bassTrack);
  }

  writer.download(filename);
}
