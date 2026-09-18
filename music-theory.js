/**
 * Harmonic Forge - Enhanced Music Theory Engine V2.0
 * Comprehensive computational music theory:
 * - 26+ curated harmonic progressions & custom chord parser
 * - Melodic contour shapes: Arch, Ascending, Descending, Wave
 * - Rhythmic density: Spacious, Balanced, Dense/Virtuosic
 * - Rhythmic feel: Straight, Syncopated, Triplets
 * - Rest / Breathing spaces
 * - Motific variations: Sequences, Inversions, Arpeggiated flourishes
 * - Accompaniment styles: Sustained Pad, Classical Arpeggio, Rhythmic Comping
 * - Articulation: Staccato to Legato
 */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_ALIASES = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
};

export const SCALES = {
  major: { name: 'Dur (Major / Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor: { name: 'Moll naturalny (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmonic_minor: { name: 'Moll harmoniczny', intervals: [0, 2, 3, 5, 7, 8, 11] },
  melodic_minor: { name: 'Moll melodyczny (jazzowy)', intervals: [0, 2, 3, 5, 7, 9, 11] },
  dorian: { name: 'Dorycka (Dorian)', intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { name: 'Frygijska (Phrygian)', intervals: [0, 1, 3, 5, 7, 8, 10] },
  lydian: { name: 'Lidyjska (Lydian)', intervals: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian: { name: 'Miksolidyjska (Mixolydian)', intervals: [0, 2, 4, 5, 7, 9, 10] },
  locrian: { name: 'Lokrycka (Locrian)', intervals: [0, 1, 3, 5, 6, 8, 10] },
  pentatonic_major: { name: 'Pentatonika durowa', intervals: [0, 2, 4, 7, 9] },
  pentatonic_minor: { name: 'Pentatonika mollowa', intervals: [0, 3, 5, 7, 10] },
  blues: { name: 'Skala bluesowa', intervals: [0, 3, 5, 6, 7, 10] }
};

export const CHORD_TYPES = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus4: [0, 5, 7],
  sus2: [0, 2, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  '9': [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14]
};

export const PROGRESSION_PRESETS = {
  // --- KLASYKA, BAROK I RENESANS ---
  classical_canon: {
    category: 'Klasyka & Barok',
    name: 'Kanon Pachelbela (I - V - vi - iii - IV - I - IV - V)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'vi', bars: 1 }, { roman: 'iii', bars: 1 },
      { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'V', bars: 1 }
    ]
  },
  circle_of_fifths: {
    category: 'Klasyka & Barok',
    name: 'Koło Kwintowe (I - IV - vii° - iii - vi - ii - V - I)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'vii°', bars: 1 }, { roman: 'iii', bars: 1 },
      { roman: 'vi', bars: 1 }, { roman: 'ii', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },
  andalusian_cadence: {
    category: 'Klasyka & Barok',
    name: 'Kadencja Andaluzyjska / La Folia (i - bVII - bVI - V)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'V', bars: 1 }
    ]
  },
  neapolitan_cadence: {
    category: 'Klasyka & Barok',
    name: 'Kadencja Neapolitańska (i - bII - V7 - i)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'iv', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'V7', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'i', bars: 1 }
    ]
  },
  chaconne_baroque: {
    category: 'Klasyka & Barok',
    name: 'Barokowa Chaconne (i - V - bVI - V)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'iv', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'i', bars: 1 }
    ]
  },

  // --- JAZZ, BEBOP & NEO-SOUL ---
  jazz_turnaround: {
    category: 'Jazz & Neo-Soul',
    name: 'Jazz Standards Turnaround (ii7 - V7 - Imaj7 - VI7)',
    chords: [
      { roman: 'ii7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'Imaj7', bars: 1 }, { roman: 'VI7', bars: 1 },
      { roman: 'ii7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'Imaj7', bars: 2 }
    ]
  },
  minor_jazz_two_five: {
    category: 'Jazz & Neo-Soul',
    name: 'Minor ii-V-i (iiø7 - V7alt - i7 - i7)',
    chords: [
      { roman: 'm7b5', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'i7', bars: 2 },
      { roman: 'm7b5', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'i7', bars: 2 }
    ]
  },
  coltrane_changes: {
    category: 'Jazz & Neo-Soul',
    name: 'Coltrane Changes (Giant Steps Modulations)',
    chords: [
      { roman: 'Imaj7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'bVImaj7', bars: 1 }, { roman: 'V7', bars: 1 },
      { roman: 'IIImaj7', bars: 1 }, { roman: 'ii7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'Imaj7', bars: 1 }
    ]
  },
  rhythm_changes: {
    category: 'Jazz & Neo-Soul',
    name: 'Rhythm Changes A-Part (I - vi - ii - V - iii - VI - ii - V)',
    chords: [
      { roman: 'Imaj7', bars: 0.5 }, { roman: 'vi7', bars: 0.5 }, { roman: 'ii7', bars: 0.5 }, { roman: 'V7', bars: 0.5 },
      { roman: 'iii7', bars: 0.5 }, { roman: 'VI7', bars: 0.5 }, { roman: 'ii7', bars: 0.5 }, { roman: 'V7', bars: 0.5 },
      { roman: 'Imaj7', bars: 1 }, { roman: 'IV7', bars: 1 }, { roman: 'ii7', bars: 1 }, { roman: 'Imaj7', bars: 1 }
    ]
  },
  neo_soul: {
    category: 'Jazz & Neo-Soul',
    name: 'Neo-Soul & R&B (ii9 - V13 - Imaj9)',
    chords: [
      { roman: 'ii7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'Imaj7', bars: 1 }, { roman: 'vi7', bars: 1 },
      { roman: 'ii7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'Imaj7', bars: 2 }
    ]
  },
  jazz_blues_12bar: {
    category: 'Jazz & Neo-Soul',
    name: 'Jazz Blues (I7 - IV7 - I7 - V7)',
    chords: [
      { roman: 'I7', bars: 1 }, { roman: 'IV7', bars: 1 }, { roman: 'I7', bars: 1 }, { roman: 'I7', bars: 1 },
      { roman: 'IV7', bars: 1 }, { roman: 'IV7', bars: 1 }, { roman: 'I7', bars: 1 }, { roman: 'VI7', bars: 1 }
    ]
  },

  // --- POP, ROCK & WSPÓŁCZESNE HITY ---
  pop_anthemic: {
    category: 'Pop & Rock',
    name: '4 Chords of Pop (I - V - vi - IV)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },
  royal_road: {
    category: 'Pop & Rock',
    name: 'Royal Road / Odo Saboro (IVmaj7 - V7 - iii7 - vi)',
    chords: [
      { roman: 'IVmaj7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'iii7', bars: 1 }, { roman: 'vi7', bars: 1 },
      { roman: 'IVmaj7', bars: 1 }, { roman: 'V7', bars: 1 }, { roman: 'Imaj7', bars: 2 }
    ]
  },
  anthem_rock: {
    category: 'Pop & Rock',
    name: 'Anthem Emo / Arena Rock (vi - IV - I - V)',
    chords: [
      { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'ii', bars: 1 }, { roman: 'V', bars: 1 }
    ]
  },
  doo_wop_50s: {
    category: 'Pop & Rock',
    name: 'Doo-Wop 50s Ballad (I - vi - IV - V)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },
  indie_folk: {
    category: 'Pop & Rock',
    name: 'Indie Folk (I - IV - vi - V)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'vi', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },
  sad_ballad: {
    category: 'Pop & Rock',
    name: 'Nastrojowa Ballada Mollowa (vi - IV - I - V)',
    chords: [
      { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'vi', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'ii', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },

  // --- FILMOWE, GRY I EPOS (CINEMATIC) ---
  cinematic_epic: {
    category: 'Filmowe & Gry',
    name: 'Epicki Marsz Mollowy (i - bVI - bIII - bVII)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'bIII', bars: 1 }, { roman: 'bVII', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'v', bars: 1 }, { roman: 'i', bars: 1 }
    ]
  },
  hollywood_heroic: {
    category: 'Filmowe & Gry',
    name: 'Hollywoodzki Bohater (I - bVII - IV - I)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'V', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },
  space_fantasy: {
    category: 'Filmowe & Gry',
    name: 'Space Fantasy / Zimmer (i - bVI - iv - V)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'iv', bars: 1 }, { roman: 'V', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'ii°', bars: 1 }, { roman: 'i', bars: 1 }
    ]
  },
  dark_souls_gothic: {
    category: 'Filmowe & Gry',
    name: 'Gotycki Mrok (i - v - bVI - iv)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'v', bars: 1 }, { roman: 'bVI', bars: 1 }, { roman: 'iv', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'v', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'i', bars: 1 }
    ]
  },
  phrygian_epic: {
    category: 'Filmowe & Gry',
    name: 'Dramatyczny Frygijski (i - bII - v - i)',
    chords: [
      { roman: 'i', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'v', bars: 1 }, { roman: 'i', bars: 1 },
      { roman: 'i', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'i', bars: 1 }
    ]
  },
  post_rock_ambient: {
    category: 'Filmowe & Gry',
    name: 'Ambient z Mollową Subdominantą (I - iii - IV - iv)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'iii', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'iv', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'iii', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },

  // --- MODALNE VAMPI I KOLORY ---
  dorian_groove: {
    category: 'Modalne Vampi',
    name: 'Dorycki Soul/Funk Vamp (i7 - IV7 - i7 - IV7)',
    chords: [
      { roman: 'i7', bars: 1 }, { roman: 'IV7', bars: 1 }, { roman: 'i7', bars: 1 }, { roman: 'IV7', bars: 1 },
      { roman: 'i7', bars: 1 }, { roman: 'IV7', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'i7', bars: 1 }
    ]
  },
  lydian_wonder: {
    category: 'Modalne Vampi',
    name: 'Lidyjska Przestrzeń (Imaj7 - II7 - Imaj7 - II7)',
    chords: [
      { roman: 'Imaj7', bars: 1 }, { roman: 'II7', bars: 1 }, { roman: 'Imaj7', bars: 1 }, { roman: 'II7', bars: 1 },
      { roman: 'Imaj7', bars: 1 }, { roman: 'II7', bars: 1 }, { roman: 'IVmaj7', bars: 1 }, { roman: 'Imaj7', bars: 1 }
    ]
  },
  mixolydian_rock: {
    category: 'Modalne Vampi',
    name: 'Miksolidyjski Klasyczny Rock (I - bVII - IV - I)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'bVII', bars: 1 }, { roman: 'IV', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  },
  phrygian_dominant_orient: {
    category: 'Modalne Vampi',
    name: 'Frygijska Dominanta / Oriental (I - bII - I - bII)',
    chords: [
      { roman: 'I', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'I', bars: 1 }, { roman: 'bII', bars: 1 },
      { roman: 'I', bars: 1 }, { roman: 'bII', bars: 1 }, { roman: 'iv', bars: 1 }, { roman: 'I', bars: 1 }
    ]
  }
};

export function midiToNoteName(midi) {
  const pc = midi % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${oct}`;
}

export function parseNoteNameToPc(name) {
  let clean = name.trim();
  if (NOTE_ALIASES[clean]) clean = NOTE_ALIASES[clean];
  const idx = NOTE_NAMES.indexOf(clean);
  return idx !== -1 ? idx : 0;
}

/**
 * Parses either a Roman numeral (e.g. 'ii7', 'bVI', 'IVmaj7') OR absolute chord name (e.g. 'Dm7', 'G7', 'Cmaj7')
 */
export function parseRomanToChord(token, keyRoot, scaleIntervals, durationBeats = 4) {
  let clean = token.trim();

  // Check if it's an absolute chord name like Dm, G7, Cmaj7, F#m7
  const matchAbsolute = clean.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (matchAbsolute && !clean.match(/^[ivIV]+/) && !clean.startsWith('bI') && !clean.startsWith('bv')) {
    const rawNote = matchAbsolute[1];
    const rawSuffix = matchAbsolute[2] || '';
    const rootPc = parseNoteNameToPc(rawNote);

    let chordType = 'maj';
    if (rawSuffix.startsWith('m') && !rawSuffix.startsWith('maj')) chordType = 'min';
    if (rawSuffix.includes('maj7') || rawSuffix.includes('M7')) chordType = 'maj7';
    else if (rawSuffix.includes('min7') || rawSuffix.includes('m7')) chordType = 'min7';
    else if (rawSuffix.includes('7')) chordType = '7';
    else if (rawSuffix.includes('dim') || rawSuffix.includes('°')) chordType = 'dim';
    else if (rawSuffix.includes('m7b5') || rawSuffix.includes('ø')) chordType = 'm7b5';
    else if (rawSuffix.includes('sus4')) chordType = 'sus4';
    else if (rawSuffix.includes('sus2')) chordType = 'sus2';

    const intervals = CHORD_TYPES[chordType] || [0, 4, 7];
    const pitchesPc = intervals.map(i => (rootPc + i) % 12);

    return {
      roman: token,
      rootPc,
      chordType,
      name: `${NOTE_NAMES[rootPc]}${chordType === 'maj' ? '' : chordType}`,
      durationBeats,
      intervals,
      pitchesPc,
      isChordTone(pitch) { return pitchesPc.includes(pitch % 12); },
      getVoicing(octave = 4) {
        const rootMidi = (octave + 1) * 12 + rootPc;
        return intervals.map(i => rootMidi + i);
      }
    };
  }

  // Parse Roman numeral
  const isFlat = clean.startsWith('b');
  if (isFlat) clean = clean.substring(1);

  let base = '';
  let suffix = '';
  for (const ch of clean) {
    if ('ivIV'.includes(ch)) base += ch;
    else suffix += ch;
  }

  const degMap = { i: 0, I: 0, ii: 1, II: 1, iii: 2, III: 2, iv: 3, IV: 3, v: 4, V: 4, vi: 5, VI: 5, vii: 6, VII: 6 };
  const deg = degMap[base] ?? 0;
  let semitones = scaleIntervals[deg % scaleIntervals.length];
  if (isFlat) semitones -= 1;

  const rootPc = (keyRoot + semitones) % 12;
  const isMinor = base.toLowerCase() === base;
  let chordType = isMinor ? 'min' : 'maj';

  if (suffix.includes('maj7') || suffix.includes('M7')) chordType = 'maj7';
  else if (suffix.includes('7')) chordType = isMinor ? 'min7' : '7';
  else if (suffix.includes('dim') || suffix.includes('°')) chordType = 'dim';
  else if (suffix.includes('m7b5') || suffix.includes('ø')) chordType = 'm7b5';
  else if (suffix.includes('sus4')) chordType = 'sus4';
  else if (suffix.includes('sus2')) chordType = 'sus2';

  const intervals = CHORD_TYPES[chordType] || [0, 4, 7];
  const pitchesPc = intervals.map(i => (rootPc + i) % 12);

  return {
    roman: token,
    rootPc,
    chordType,
    name: `${NOTE_NAMES[rootPc]}${chordType === 'maj' ? '' : chordType}`,
    durationBeats,
    intervals,
    pitchesPc,
    isChordTone(pitch) { return pitchesPc.includes(pitch % 12); },
    getVoicing(octave = 4) {
      const rootMidi = (octave + 1) * 12 + rootPc;
      return intervals.map(i => rootMidi + i);
    }
  };
}

/**
 * Parses arbitrary user-provided chord strings, e.g. "Dm7 - G7 - Cmaj7 - A7" or "I - IV - V - I"
 */
export function parseCustomProgression(inputString, keyRoot, scaleIntervals) {
  if (!inputString || !inputString.trim()) {
    return PROGRESSION_PRESETS.pop_anthemic.chords;
  }
  const tokens = inputString.split(/[-–—,>\s|]+/).map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) {
    return PROGRESSION_PRESETS.pop_anthemic.chords;
  }
  return tokens.map(tok => ({ roman: tok, bars: 1 }));
}

export class MelodicEngine {
  constructor(options = {}) {
    this.key = options.key || 'C';
    this.keyRoot = NOTE_NAMES.indexOf(this.key);
    if (this.keyRoot === -1) this.keyRoot = 0;

    this.scaleKey = options.scale || 'major';
    const scaleObj = SCALES[this.scaleKey] || SCALES.major;
    this.scaleIntervals = scaleObj.intervals;
    this.scalePcs = this.scaleIntervals.map(i => (this.keyRoot + i) % 12);

    this.progressionKey = options.progression || 'pop_anthemic';
    this.customProgressionText = options.customProgressionText || '';
    this.bpm = options.bpm || 120;

    // Advanced Melodic Manipulation Controls
    this.contour = options.contour || 'arch'; // 'arch', 'ascending', 'descending', 'wave'
    this.density = options.density || 'balanced'; // 'spacious', 'balanced', 'dense'
    this.rhythmFeel = options.rhythmFeel || 'straight'; // 'straight', 'syncopated', 'triplets'
    this.restProbability = options.restProbability ?? 0.12; // 12% breathing space
    this.motificSequence = options.motificSequence ?? true; // Transposition sequence in bar 3
    this.motificInversion = options.motificInversion ?? false; // Mirror intervals in bar 5
    this.arpeggiatedFlourishes = options.arpeggiatedFlourishes ?? true; // Chord arpeggios
    this.articulation = options.articulation ?? 0.90; // 0.3 (staccato) to 0.98 (legato)
    this.melodicRange = options.melodicRange || 'medium'; // 'narrow', 'medium', 'wide'
    this.accompanimentStyle = options.accompanimentStyle || 'pad'; // 'pad', 'arpeggio', 'rhythmic_comp'

    this.stepToLeapRatio = options.stepToLeapRatio ?? 0.75;
    this.gapFillEnabled = options.gapFillEnabled ?? true;
    this.nctDensity = options.nctDensity ?? 0.35;

    // Calculate tessitura based on range setting
    if (this.melodicRange === 'narrow') {
      this.pitchMin = 60; // 1 octave
      this.pitchMax = 72;
    } else if (this.melodicRange === 'wide') {
      this.pitchMin = 55; // ~2.5 octaves
      this.pitchMax = 86;
    } else {
      this.pitchMin = 60; // 1.5-2 octaves
      this.pitchMax = 81;
    }
  }

  getValidScalePitches() {
    const pitches = [];
    for (let p = this.pitchMin; p <= this.pitchMax; p++) {
      if (this.scalePcs.includes(p % 12)) pitches.push(p);
    }
    return pitches.length > 0 ? pitches : [60, 62, 64, 65, 67, 69, 71, 72];
  }

  generate(totalBars = 8) {
    const validPitches = this.getValidScalePitches();

    // 1. Build Chords for all bars
    let chordTokens;
    if (this.progressionKey === 'custom') {
      chordTokens = parseCustomProgression(this.customProgressionText, this.keyRoot, this.scaleIntervals);
    } else {
      const preset = PROGRESSION_PRESETS[this.progressionKey] || PROGRESSION_PRESETS.pop_anthemic;
      chordTokens = preset.chords;
    }

    const chords = [];
    let barCount = 0;
    while (barCount < totalBars) {
      for (const item of chordTokens) {
        const chord = parseRomanToChord(item.roman, this.keyRoot, this.scaleIntervals, (item.bars || 1) * 4);
        chords.push(chord);
        barCount += (item.bars || 1);
        if (barCount >= totalBars) break;
      }
    }

    // 2. Generate Accompaniment & Bass Track based on accompanimentStyle
    const chordNotes = [];
    const bassNotes = [];
    let curBeat = 0;

    chords.forEach(chord => {
      const dur = chord.durationBeats;
      const voicing = chord.getVoicing(4);

      if (this.accompanimentStyle === 'arpeggio') {
        // Classical Alberti / Flowing Arpeggio (8th notes across chord tones)
        const stepBeats = 0.5; // 8th note
        const steps = Math.floor(dur / stepBeats);
        for (let i = 0; i < steps; i++) {
          const pitch = voicing[i % voicing.length];
          chordNotes.push({
            pitch,
            startBeat: curBeat + (i * stepBeats),
            durationBeats: stepBeats * 0.95,
            velocity: 60 + ((i % 2 === 0) ? 8 : -4),
            role: 'harmony_arpeggio'
          });
        }
      } else if (this.accompanimentStyle === 'rhythmic_comp') {
        // Modern Pop / Neo-Soul rhythmic stabs on off-beats
        const compTimes = [0.0, 1.5, 2.5, 3.5];
        compTimes.forEach(t => {
          if (t < dur) {
            voicing.forEach(p => {
              chordNotes.push({
                pitch: p,
                startBeat: curBeat + t,
                durationBeats: 0.65,
                velocity: 68,
                role: 'harmony_comp'
              });
            });
          }
        });
      } else {
        // Sustained Warm Pad
        voicing.forEach(pitch => {
          chordNotes.push({
            pitch,
            startBeat: curBeat,
            durationBeats: dur,
            velocity: 64,
            role: 'harmony_pad'
          });
        });
      }

      // Bass line: Root on 1, 5th or passing on 3
      let bassRoot = 36 + chord.rootPc;
      if (bassRoot < 36) bassRoot += 12;

      if (dur >= 4) {
        bassNotes.push({
          pitch: bassRoot,
          startBeat: curBeat,
          durationBeats: 1.85,
          velocity: 90,
          role: 'bass_root'
        });
        const fifthPc = (chord.rootPc + 7) % 12;
        let fifthPitch = 36 + fifthPc;
        bassNotes.push({
          pitch: fifthPitch,
          startBeat: curBeat + 2,
          durationBeats: 1.85,
          velocity: 82,
          role: 'bass_fifth'
        });
      } else {
        bassNotes.push({
          pitch: bassRoot,
          startBeat: curBeat,
          durationBeats: dur * 0.9,
          velocity: 88,
          role: 'bass_root'
        });
      }
      curBeat += dur;
    });

    // 3. Generate Melody using Advanced Musical Transformations
    const melodyNotes = [];

    // Rhythmic Cells based on Density and RhythmFeel
    let rhythmicCells;
    if (this.density === 'spacious') {
      rhythmicCells = [
        [2.0, 2.0],
        [1.5, 0.5, 2.0],
        [1.0, 1.0, 2.0],
        [3.0, 1.0]
      ];
    } else if (this.density === 'dense') {
      rhythmicCells = [
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
        [0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 1.0],
        [0.5, 0.25, 0.25, 0.5, 0.5, 1.0, 1.0],
        [0.75, 0.25, 0.5, 0.5, 1.0, 1.0]
      ];
    } else {
      // Balanced
      if (this.rhythmFeel === 'syncopated') {
        rhythmicCells = [
          [0.5, 1.0, 0.5, 1.0, 1.0],
          [1.5, 0.5, 1.0, 1.0],
          [0.5, 1.0, 1.5, 1.0],
          [1.0, 0.5, 1.5, 1.0]
        ];
      } else if (this.rhythmFeel === 'triplets') {
        rhythmicCells = [
          [0.66, 0.67, 0.67, 1.0, 1.0],
          [1.0, 0.66, 0.67, 0.67, 1.0],
          [1.33, 0.67, 2.0]
        ];
      } else {
        rhythmicCells = [
          [1.0, 1.0, 0.5, 0.5, 1.0],
          [1.5, 0.5, 1.0, 1.0],
          [0.5, 0.5, 1.0, 0.5, 0.5, 1.0],
          [1.0, 0.5, 0.5, 2.0]
        ];
      }
    }

    const initialMotifRhythm = rhythmicCells[Math.floor(Math.random() * rhythmicCells.length)];

    // Target Climax Point depending on Contour
    let climaxTargetBeat = totalBars * 4 * 0.72; // default golden ratio
    if (this.contour === 'ascending') climaxTargetBeat = totalBars * 4 * 0.90;
    else if (this.contour === 'descending') climaxTargetBeat = totalBars * 4 * 0.15;
    else if (this.contour === 'wave') climaxTargetBeat = totalBars * 4 * 0.60;

    const climaxPitch = validPitches[validPitches.length - (this.melodicRange === 'narrow' ? 1 : 2)];
    let climaxAchieved = false;

    // Starting pitch near tonic
    let prevPitch = 60 + this.keyRoot;
    while (prevPitch < 62) prevPitch += 12;
    while (prevPitch > 74) prevPitch -= 12;

    let prevLeap = 0;
    let savedMotifPitches = [];

    for (let barIdx = 0; barIdx < totalBars; barIdx++) {
      const barStartBeat = barIdx * 4;
      const isAntecedentEnd = barIdx === 3;
      const isConsequentEnd = barIdx === totalBars - 1;
      const isMotifBar = barIdx === 0;
      const isSequenceBar = (barIdx === 2 && this.motificSequence);
      const isConsequentStart = (barIdx === 4 && this.motificInversion);

      // Select bar rhythm
      let durations;
      if (isAntecedentEnd || isConsequentEnd) {
        durations = [2.0, 2.0];
      } else if (isMotifBar) {
        durations = initialMotifRhythm;
      } else if (isSequenceBar) {
        durations = initialMotifRhythm; // Repeat rhythm for sequence!
      } else {
        durations = rhythmicCells[Math.floor(Math.random() * rhythmicCells.length)];
      }

      // Scale to fit 4 beats
      const sumDur = durations.reduce((a, b) => a + b, 0);
      const scaledDurations = durations.map(d => (d / sumDur) * 4);

      let measureBeat = 0;
      for (let noteIdx = 0; noteIdx < scaledDurations.length; noteIdx++) {
        const dur = scaledDurations[noteIdx];
        const currentGlobalBeat = barStartBeat + measureBeat;
        const isDownbeat = (measureBeat % 2 === 0);

        // Breathing space / Rest insertion (never on cadence notes or climax)
        if (!isAntecedentEnd && !isConsequentEnd && noteIdx > 0 && Math.random() < this.restProbability) {
          measureBeat += dur;
          continue; // Skip note to create musical breath!
        }

        // Find current chord
        let activeChord = chords[0];
        let cTime = 0;
        for (const c of chords) {
          if (cTime <= currentGlobalBeat && currentGlobalBeat < cTime + c.durationBeats) {
            activeChord = c;
            break;
          }
          cTime += c.durationBeats;
        }

        const chordTones = validPitches.filter(p => activeChord.isChordTone(p));
        let targetPitch = prevPitch;
        let role = 'chord_tone';

        // 1. Cadence Resolution
        if (isConsequentEnd && measureBeat >= 2) {
          const tonics = validPitches.filter(p => (p % 12) === this.keyRoot && p >= 60 && p <= 72);
          targetPitch = tonics[0] || validPitches[0];
          role = 'cadence_resolution';
          prevLeap = 0;
        } else if (isAntecedentEnd && measureBeat >= 2) {
          const halfCadencePcs = [(this.keyRoot + 7) % 12, (this.keyRoot + 2) % 12];
          const candidates = validPitches.filter(p => halfCadencePcs.includes(p % 12) && Math.abs(p - prevPitch) <= 6);
          targetPitch = candidates[0] || prevPitch;
          role = 'half_cadence_question';
          prevLeap = 0;
        } else if (!climaxAchieved && Math.abs(currentGlobalBeat - climaxTargetBeat) <= 1.5) {
          // Focal Climax
          targetPitch = climaxPitch;
          role = 'climax';
          climaxAchieved = true;
          prevLeap = targetPitch - prevPitch;
        } else if (isSequenceBar && savedMotifPitches[noteIdx] !== undefined) {
          // Motific Sequence: transpose original motif by step (2 semitones)
          const trans = 2;
          const seqPitch = savedMotifPitches[noteIdx] + trans;
          targetPitch = validPitches.includes(seqPitch) ? seqPitch : prevPitch;
          role = 'chord_tone';
        } else if (isConsequentStart && savedMotifPitches[noteIdx] !== undefined) {
          // Motific Inversion: invert interval direction
          const firstMotif = savedMotifPitches[0] || prevPitch;
          const origDiff = savedMotifPitches[noteIdx] - firstMotif;
          const inverted = firstMotif - origDiff;
          targetPitch = validPitches.reduce((prev, curr) => Math.abs(curr - inverted) < Math.abs(prev - inverted) ? curr : prev);
          role = 'chord_tone';
        } else {
          // Contour Influence Bias
          let contourBias = 0;
          const progress = currentGlobalBeat / (totalBars * 4); // 0 to 1
          if (this.contour === 'ascending') {
            contourBias = (progress > 0.5) ? 1 : 0;
          } else if (this.contour === 'descending') {
            contourBias = (progress > 0.3) ? -1 : 0;
          } else if (this.contour === 'wave') {
            contourBias = Math.sin(progress * Math.PI * 4) > 0 ? 1 : -1;
          } else {
            // Arch: rise in first half, resolve in second
            contourBias = (progress < 0.65) ? 1 : -1;
          }

          // Gap-fill rule
          if (this.gapFillEnabled && Math.abs(prevLeap) >= 5) {
            const compDir = prevLeap > 0 ? -1 : 1;
            const stepCandidates = validPitches.filter(p => (p - prevPitch) * compDir > 0 && Math.abs(p - prevPitch) <= 3);
            if (stepCandidates.length > 0) {
              targetPitch = stepCandidates.reduce((prev, curr) =>
                Math.abs(curr - prevPitch) < Math.abs(prev - prevPitch) ? curr : prev
              );
              role = 'gap_fill_resolution';
              prevLeap = 0;
            } else {
              targetPitch = prevPitch + compDir * 2;
              role = 'passing_tone';
              prevLeap = 0;
            }
          } else {
            // Strong vs Weak beats
            if (isDownbeat) {
              const useChordTone = Math.random() > this.nctDensity;
              if (useChordTone && chordTones.length > 0) {
                const sorted = [...chordTones].sort((a, b) => {
                  const scoreA = Math.abs(a - prevPitch) - ((a - prevPitch) * contourBias * 2);
                  const scoreB = Math.abs(b - prevPitch) - ((b - prevPitch) * contourBias * 2);
                  return scoreA - scoreB;
                });
                targetPitch = sorted[0];
                role = 'chord_tone';
              } else {
                const steps = validPitches.filter(p => Math.abs(p - prevPitch) >= 1 && Math.abs(p - prevPitch) <= 2);
                targetPitch = steps.length ? steps[Math.floor(Math.random() * steps.length)] : prevPitch;
                role = 'suspension';
              }
            } else {
              const rand = Math.random();
              if (this.arpeggiatedFlourishes && rand < 0.25 && chordTones.length > 1) {
                // Rapid Arpeggiation flourish
                const otherChordTones = chordTones.filter(p => p !== prevPitch && Math.abs(p - prevPitch) <= 7);
                targetPitch = otherChordTones.length ? otherChordTones[0] : prevPitch;
                role = 'chord_tone';
              } else if (rand < 0.60) {
                const steps = validPitches.filter(p => Math.abs(p - prevPitch) >= 1 && Math.abs(p - prevPitch) <= 2);
                targetPitch = steps.length ? steps[Math.floor(Math.random() * steps.length)] : prevPitch;
                role = 'passing_tone';
              } else if (rand < 0.85) {
                const stepDir = contourBias !== 0 ? contourBias : (Math.random() > 0.5 ? 1 : -1);
                const neighbors = validPitches.filter(p => (p - prevPitch) * stepDir > 0 && Math.abs(p - prevPitch) <= 2);
                targetPitch = neighbors.length ? neighbors[0] : prevPitch;
                role = 'neighbor_tone';
              } else {
                const leaps = chordTones.filter(p => Math.abs(p - prevPitch) >= 4 && Math.abs(p - prevPitch) <= 9);
                if (leaps.length > 0) {
                  targetPitch = leaps[Math.floor(Math.random() * leaps.length)];
                  role = 'expressive_leap';
                  prevLeap = targetPitch - prevPitch;
                } else {
                  targetPitch = prevPitch;
                  role = 'chord_tone';
                }
              }
            }
          }

          if (role !== 'expressive_leap') {
            prevLeap = targetPitch - prevPitch;
          }
        }

        // Save motif notes for variation
        if (isMotifBar) {
          savedMotifPitches.push(targetPitch);
        }

        // Dynamic humanized velocity
        const baseVel = isDownbeat ? 96 : 82;
        const velocity = Math.min(127, Math.max(45, Math.floor(baseVel + (Math.random() * 14 - 7))));

        melodyNotes.push({
          pitch: targetPitch,
          startBeat: currentGlobalBeat,
          durationBeats: dur * this.articulation, // Staccato vs Legato gate
          velocity,
          role,
          noteName: midiToNoteName(targetPitch)
        });

        prevPitch = targetPitch;
        measureBeat += dur;
      }
    }

    return {
      melodyNotes,
      chordNotes,
      bassNotes,
      chords,
      key: this.key,
      scale: this.scaleKey,
      scalePcs: this.scalePcs,
      keyRoot: this.keyRoot,
      bpm: this.bpm,
      totalBars
    };
  }
}

/**
 * Analyzes a manually placed or dragged note and returns its music theoretical role
 */
export function analyzeNoteRole(pitch, startBeat, chords, keyRoot, scalePcs, prevPitch = null) {
  // 1. Find active chord at startBeat
  let activeChord = null;
  let cTime = 0;
  if (chords && chords.length > 0) {
    for (const c of chords) {
      if (cTime <= startBeat && startBeat < cTime + c.durationBeats) {
        activeChord = c;
        break;
      }
      cTime += c.durationBeats;
    }
    if (!activeChord) activeChord = chords[chords.length - 1];
  }

  const pc = pitch % 12;

  // Check if tonic cadence
  if (pc === keyRoot && activeChord && activeChord.roman && (activeChord.roman === 'I' || activeChord.roman === 'i')) {
    return 'cadence_resolution';
  }

  // Check if chord tone
  if (activeChord && activeChord.isChordTone(pitch)) {
    return 'chord_tone';
  }

  // Check if scale tone
  if (scalePcs && scalePcs.includes(pc)) {
    if (prevPitch !== null && Math.abs(pitch - prevPitch) <= 2) {
      return 'passing_tone';
    }
    return 'neighbor_tone';
  }

  // Dissonant / Suspension
  return 'suspension';
}

/**
 * Creates motif blocks (arpeggio, scale run, cadence turnaround) to drop into the composition
 */
export function createPatternBlock(type, startBeat, chords, keyRoot, scalePcs) {
  let activeChord = chords && chords.length > 0 ? chords[0] : null;
  let cTime = 0;
  if (chords) {
    for (const c of chords) {
      if (cTime <= startBeat && startBeat < cTime + c.durationBeats) {
        activeChord = c;
        break;
      }
      cTime += c.durationBeats;
    }
  }

  const voicing = activeChord ? activeChord.getVoicing(4) : [60, 64, 67];
  const newNotes = [];

  if (type === 'arpeggio_up') {
    // 4 ascending 8th notes
    voicing.slice(0, 4).forEach((pitch, i) => {
      newNotes.push({
        pitch,
        startBeat: startBeat + (i * 0.5),
        durationBeats: 0.48,
        velocity: 88,
        role: 'chord_tone',
        noteName: midiToNoteName(pitch)
      });
    });
  } else if (type === 'scale_run') {
    // 4 scale step notes
    let p = 60 + keyRoot;
    for (let i = 0; i < 4; i++) {
      const stepPitch = p + (i * 2);
      newNotes.push({
        pitch: stepPitch,
        startBeat: startBeat + (i * 0.5),
        durationBeats: 0.48,
        velocity: 86,
        role: 'passing_tone',
        noteName: midiToNoteName(stepPitch)
      });
    }
  } else if (type === 'cadence_turn') {
    // 2 -> 7 -> 1 cadence
    const supertonic = 62 + keyRoot;
    const leading = 59 + keyRoot;
    const tonic = 60 + keyRoot;
    newNotes.push(
      { pitch: supertonic, startBeat: startBeat, durationBeats: 0.9, velocity: 90, role: 'half_cadence_question', noteName: midiToNoteName(supertonic) },
      { pitch: leading, startBeat: startBeat + 1.0, durationBeats: 0.9, velocity: 85, role: 'suspension', noteName: midiToNoteName(leading) },
      { pitch: tonic, startBeat: startBeat + 2.0, durationBeats: 1.9, velocity: 96, role: 'cadence_resolution', noteName: midiToNoteName(tonic) }
    );
  }

  return newNotes;
}

