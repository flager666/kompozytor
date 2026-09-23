/**
 * Harmonic Forge - General MIDI Instrument Catalog
 * Complete library of GM instruments grouped into categories with icons, Polish labels, and GM program numbers.
 */

export const INSTRUMENT_CATEGORIES = [
  { id: 'all', label: 'Wszystkie', icon: '🌐' },
  { id: 'klawiszowe', label: 'Klawiszowe', icon: '🎹' },
  { id: 'smyczkowe', label: 'Smyczkowe', icon: '🎻' },
  { id: 'gitary', label: 'Gitary & Szarpane', icon: '🎸' },
  { id: 'blaszane', label: 'Dęte Blaszane', icon: '🎺' },
  { id: 'drewniane', label: 'Dęte Drewniane', icon: '🎷' },
  { id: 'basy', label: 'Basy', icon: '🎸' },
  { id: 'syntezatory', label: 'Syntezatory Lead', icon: '⚡' },
  { id: 'pady', label: 'Pady & Chóry', icon: '🌌' },
  { id: 'perkusyjne', label: 'Perkusyjne', icon: '🔔' }
];

export const INSTRUMENT_CATALOG = [
  // ==========================================
  // 1. KLAWISZOWE & PIANINA (Keyboard & Piano)
  // ==========================================
  {
    id: 'piano',
    name: 'Fortepian Koncertowy',
    enName: 'Acoustic Grand Piano',
    icon: '🎹',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 0,
    slots: ['lead', 'pad']
  },
  {
    id: 'bright_acoustic_piano',
    name: 'Jasny Fortepian',
    enName: 'Bright Acoustic Piano',
    icon: '🎹',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 1,
    slots: ['lead', 'pad']
  },
  {
    id: 'electric_grand_piano',
    name: 'Elektryczny Fortepian',
    enName: 'Electric Grand Piano',
    icon: '🎹',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 2,
    slots: ['lead', 'pad']
  },
  {
    id: 'honky_tonk_piano',
    name: 'Pianino Honky-Tonk',
    enName: 'Honky-tonk Piano',
    icon: '🍻',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 3,
    slots: ['lead', 'pad']
  },
  {
    id: 'rhodes',
    name: 'Neo-Soul Rhodes MK I',
    enName: 'Electric Piano 1 (Rhodes)',
    icon: '✨',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 4,
    slots: ['lead', 'pad']
  },
  {
    id: 'dx7',
    name: 'Cyfrowe FM DX7',
    enName: 'Electric Piano 2 (FM/DX7)',
    icon: '💎',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 5,
    slots: ['lead', 'pad']
  },
  {
    id: 'harpsichord',
    name: 'Klawesyn Barokowy',
    enName: 'Harpsichord',
    icon: '🎼',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 6,
    slots: ['lead', 'pad']
  },
  {
    id: 'clavinet',
    name: 'Clavinet Funk',
    enName: 'Clavinet',
    icon: '⚡',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 7,
    slots: ['lead', 'pad']
  },
  {
    id: 'drawbar_organ',
    name: 'Organy Hammonda',
    enName: 'Drawbar Organ (Hammond)',
    icon: '🎛️',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 16,
    slots: ['lead', 'pad']
  },
  {
    id: 'percussive_organ',
    name: 'Organy Perkusyjne Jazz',
    enName: 'Percussive Organ',
    icon: '🎛️',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 17,
    slots: ['lead', 'pad']
  },
  {
    id: 'rock_organ',
    name: 'Organy Rockowe',
    enName: 'Rock Organ',
    icon: '🔥',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 18,
    slots: ['lead', 'pad']
  },
  {
    id: 'organ',
    name: 'Organy Piszczałkowe',
    enName: 'Church Pipe Organ',
    icon: '⛪',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 19,
    slots: ['lead', 'pad']
  },
  {
    id: 'reed_organ',
    name: 'Harmonium Stroikowe',
    enName: 'Reed Organ',
    icon: '🎶',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 20,
    slots: ['lead', 'pad']
  },
  {
    id: 'accordion',
    name: 'Akordeon Klasyczny',
    enName: 'Accordion',
    icon: '🪗',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 21,
    slots: ['lead', 'pad']
  },
  {
    id: 'harmonica',
    name: 'Harmonijka Ustna',
    enName: 'Harmonica',
    icon: '🌬️',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 22,
    slots: ['lead']
  },
  {
    id: 'bandoneon',
    name: 'Bandoneon Tango',
    enName: 'Tango Accordion / Bandoneon',
    icon: '💃',
    category: 'klawiszowe',
    categoryLabel: 'Klawiszowe',
    gmNumber: 23,
    slots: ['lead', 'pad']
  },

  // ==========================================
  // 2. SMYCZKOWE & ORKIESTROWE (Strings & Orchestral)
  // ==========================================
  {
    id: 'violin',
    name: 'Skrzypce Solo',
    enName: 'Violin',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 40,
    slots: ['lead']
  },
  {
    id: 'viola',
    name: 'Altówka Solo',
    enName: 'Viola',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 41,
    slots: ['lead']
  },
  {
    id: 'cello',
    name: 'Wiolonczela Solo',
    enName: 'Cello',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 42,
    slots: ['lead', 'bass']
  },
  {
    id: 'contrabass',
    name: 'Kontrabas Orkiestrowy',
    enName: 'Contrabass',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 43,
    slots: ['bass']
  },
  {
    id: 'tremolo_strings',
    name: 'Smyczki Tremolo',
    enName: 'Tremolo Strings',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 44,
    slots: ['lead', 'pad']
  },
  {
    id: 'pizzicato_strings',
    name: 'Smyczki Pizzicato',
    enName: 'Pizzicato Strings',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 45,
    slots: ['lead']
  },
  {
    id: 'orchestral_harp',
    name: 'Harfa Koncertowa',
    enName: 'Orchestral Harp',
    icon: '🧚',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 46,
    slots: ['lead', 'pad']
  },
  {
    id: 'timpani',
    name: 'Kotły Orkiestrowe',
    enName: 'Timpani',
    icon: '🥁',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 47,
    slots: ['bass', 'lead']
  },
  {
    id: 'strings',
    name: 'Sekcja Smyczkowa Tutti',
    enName: 'String Ensemble 1',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 48,
    slots: ['pad', 'lead']
  },
  {
    id: 'string_ensemble_2',
    name: 'Smyczki Kameralne',
    enName: 'String Ensemble 2 (Slow)',
    icon: '🎻',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 49,
    slots: ['pad', 'lead']
  },
  {
    id: 'synth_strings_1',
    name: 'Syntetyczne Smyczki 1',
    enName: 'Synth Strings 1',
    icon: '🌌',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 50,
    slots: ['pad', 'lead']
  },
  {
    id: 'synth_strings_2',
    name: 'Syntetyczne Smyczki 2',
    enName: 'Synth Strings 2',
    icon: '🌌',
    category: 'smyczkowe',
    categoryLabel: 'Smyczkowe',
    gmNumber: 51,
    slots: ['pad', 'lead']
  },

  // ==========================================
  // 3. GITARY & SZARPANE (Guitars & Plucked)
  // ==========================================
  {
    id: 'guitar',
    name: 'Gitara Klasyczna Nylon',
    enName: 'Acoustic Guitar (Nylon)',
    icon: '🎸',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 24,
    slots: ['lead', 'pad']
  },
  {
    id: 'acoustic_guitar_steel',
    name: 'Gitara Akustyczna Stal',
    enName: 'Acoustic Guitar (Steel)',
    icon: '🎸',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 25,
    slots: ['lead', 'pad']
  },
  {
    id: 'electric_guitar_jazz',
    name: 'Gitara Jazzowa Hollowbody',
    enName: 'Electric Guitar (Jazz)',
    icon: '🎸',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 26,
    slots: ['lead', 'pad']
  },
  {
    id: 'electric_guitar_clean',
    name: 'Gitara Elektryczna Czysta',
    enName: 'Electric Guitar (Clean)',
    icon: '🎸',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 27,
    slots: ['lead', 'pad']
  },
  {
    id: 'electric_guitar_muted',
    name: 'Gitara Tłumiona (Palm Mute)',
    enName: 'Electric Guitar (Muted)',
    icon: '🎸',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 28,
    slots: ['lead']
  },
  {
    id: 'overdriven_guitar',
    name: 'Gitara Przesterowana Lead',
    enName: 'Overdriven Guitar',
    icon: '⚡',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 29,
    slots: ['lead']
  },
  {
    id: 'distortion_guitar',
    name: 'Gitara Distortion Rock',
    enName: 'Distortion Guitar',
    icon: '🔥',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 30,
    slots: ['lead']
  },
  {
    id: 'guitar_harmonics',
    name: 'Flażolety Gitarowe',
    enName: 'Guitar Harmonics',
    icon: '✨',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 31,
    slots: ['lead']
  },
  {
    id: 'sitar',
    name: 'Sitar Indyjski',
    enName: 'Sitar',
    icon: '🪕',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 104,
    slots: ['lead']
  },
  {
    id: 'banjo',
    name: 'Banjo Country',
    enName: 'Banjo',
    icon: '🪕',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 105,
    slots: ['lead']
  },
  {
    id: 'shamisen',
    name: 'Shamisen Tradycyjny',
    enName: 'Shamisen',
    icon: '🎋',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 106,
    slots: ['lead']
  },
  {
    id: 'koto',
    name: 'Koto Japońskie',
    enName: 'Koto',
    icon: '🎋',
    category: 'gitary',
    categoryLabel: 'Gitary',
    gmNumber: 107,
    slots: ['lead']
  },

  // ==========================================
  // 4. DĘTE BLASZANE (Brass)
  // ==========================================
  {
    id: 'trumpet',
    name: 'Trąbka Solo',
    enName: 'Trumpet',
    icon: '🎺',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 56,
    slots: ['lead']
  },
  {
    id: 'muted_trumpet',
    name: 'Trąbka z Tłumikiem',
    enName: 'Muted Trumpet (Miles)',
    icon: '🎺',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 59,
    slots: ['lead']
  },
  {
    id: 'trombone',
    name: 'Puzon Suwakowy',
    enName: 'Trombone',
    icon: '🎺',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 57,
    slots: ['lead', 'bass']
  },
  {
    id: 'tuba',
    name: 'Tuba Orkiestrowa',
    enName: 'Tuba',
    icon: '🎺',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 58,
    slots: ['bass']
  },
  {
    id: 'french_horn',
    name: 'Waltornia / Róg Francuski',
    enName: 'French Horn',
    icon: '📯',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 60,
    slots: ['lead', 'pad']
  },
  {
    id: 'brass_section',
    name: 'Sekcja Dęta Blaszana',
    enName: 'Brass Section',
    icon: '🎺',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 61,
    slots: ['lead', 'pad']
  },
  {
    id: 'brass',
    name: 'Synth Brass 80s',
    enName: 'Synth Brass 1',
    icon: '⚡',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 62,
    slots: ['lead', 'pad']
  },
  {
    id: 'synth_brass_2',
    name: 'Ciepły Synth Brass',
    enName: 'Synth Brass 2',
    icon: '⚡',
    category: 'blaszane',
    categoryLabel: 'Blaszane',
    gmNumber: 63,
    slots: ['lead', 'pad']
  },

  // ==========================================
  // 5. DĘTE DREWNIANE & SAKSOFONY (Woodwinds & Saxophones)
  // ==========================================
  {
    id: 'soprano_sax',
    name: 'Saksofon Sopranowy',
    enName: 'Soprano Sax',
    icon: '🎷',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 64,
    slots: ['lead']
  },
  {
    id: 'alto_sax',
    name: 'Saksofon Altowy',
    enName: 'Alto Sax',
    icon: '🎷',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 65,
    slots: ['lead']
  },
  {
    id: 'tenor_sax',
    name: 'Saksofon Tenorowy',
    enName: 'Tenor Sax',
    icon: '🎷',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 66,
    slots: ['lead']
  },
  {
    id: 'baritone_sax',
    name: 'Saksofon Barytonowy',
    enName: 'Baritone Sax',
    icon: '🎷',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 67,
    slots: ['lead', 'bass']
  },
  {
    id: 'oboe',
    name: 'Obój Francuski',
    enName: 'Oboe',
    icon: '🎶',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 68,
    slots: ['lead']
  },
  {
    id: 'english_horn',
    name: 'Rożek Angielski',
    enName: 'English Horn',
    icon: '🎶',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 69,
    slots: ['lead']
  },
  {
    id: 'bassoon',
    name: 'Fagot Orkiestrowy',
    enName: 'Bassoon',
    icon: '🎶',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 70,
    slots: ['lead', 'bass']
  },
  {
    id: 'clarinet',
    name: 'Klarnet Klasyczny',
    enName: 'Clarinet',
    icon: '🎶',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 71,
    slots: ['lead']
  },
  {
    id: 'piccolo',
    name: 'Flet Pikolo',
    enName: 'Piccolo',
    icon: '🍃',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 72,
    slots: ['lead']
  },
  {
    id: 'flute',
    name: 'Flet Drewniany',
    enName: 'Flute',
    icon: '🍃',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 73,
    slots: ['lead']
  },
  {
    id: 'recorder',
    name: 'Flet Prosty',
    enName: 'Recorder',
    icon: '🍃',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 74,
    slots: ['lead']
  },
  {
    id: 'pan_flute',
    name: 'Fletnia Pana',
    enName: 'Pan Flute',
    icon: '🎋',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 75,
    slots: ['lead']
  },
  {
    id: 'shakuhachi',
    name: 'Flet Shakuhachi',
    enName: 'Shakuhachi',
    icon: '🎋',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 77,
    slots: ['lead']
  },
  {
    id: 'whistle',
    name: 'Gwizdek Tin Whistle',
    enName: 'Whistle',
    icon: '🌬️',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 78,
    slots: ['lead']
  },
  {
    id: 'ocarina',
    name: 'Okaryna',
    enName: 'Ocarina',
    icon: '🍃',
    category: 'drewniane',
    categoryLabel: 'Drewniane',
    gmNumber: 79,
    slots: ['lead']
  },

  // ==========================================
  // 6. BASY (Acoustic, Electric & Synth Bass)
  // ==========================================
  {
    id: 'upright',
    name: 'Kontrabas Jazzowy',
    enName: 'Acoustic Upright Bass',
    icon: '🎻',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 32,
    slots: ['bass']
  },
  {
    id: 'electric_bass_finger',
    name: 'Bas Elektryczny Palcowy',
    enName: 'Electric Bass (Finger)',
    icon: '🎸',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 33,
    slots: ['bass']
  },
  {
    id: 'picked',
    name: 'Bas Elektryczny Kostka',
    enName: 'Electric Bass (Pick)',
    icon: '🎸',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 34,
    slots: ['bass']
  },
  {
    id: 'fretless_bass',
    name: 'Bas Bezprogowy (Fretless)',
    enName: 'Fretless Bass',
    icon: '🎸',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 35,
    slots: ['bass']
  },
  {
    id: 'slap_bass_1',
    name: 'Slap Funk Bass 1',
    enName: 'Slap Bass 1',
    icon: '🎸',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 36,
    slots: ['bass']
  },
  {
    id: 'slap_bass_2',
    name: 'Slap Funk Bass 2',
    enName: 'Slap Bass 2',
    icon: '🎸',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 37,
    slots: ['bass']
  },
  {
    id: 'moog',
    name: 'Analogowy Moog Synth Bass',
    enName: 'Synth Bass 1 (Moog Resonant)',
    icon: '🎛️',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 38,
    slots: ['bass']
  },
  {
    id: 'acid',
    name: 'TB-303 Acid Bass',
    enName: 'Acid Synth Bass (TB-303)',
    icon: '🧪',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 38,
    slots: ['bass']
  },
  {
    id: 'sub',
    name: 'Głęboki Sub-Bass',
    enName: 'Deep Sub Bass Sine',
    icon: '🔊',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 39,
    slots: ['bass']
  },
  {
    id: 'boom808',
    name: 'Trap 808 Boom Bass',
    enName: '808 Sub Boom Bass',
    icon: '💣',
    category: 'basy',
    categoryLabel: 'Basy',
    gmNumber: 39,
    slots: ['bass']
  },

  // ==========================================
  // 7. SYNTEZATORY LEAD (Synth Leads)
  // ==========================================
  {
    id: 'synth_lead',
    name: 'Analog 80s Synth Lead',
    enName: 'Lead 2 (Sawtooth)',
    icon: '⚡',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 81,
    slots: ['lead']
  },
  {
    id: 'chiptune',
    name: '8-Bit Retro Chiptune',
    enName: 'Lead 1 (Square Wave)',
    icon: '👾',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 80,
    slots: ['lead']
  },
  {
    id: 'lead_calliope',
    name: 'Calliope Synth',
    enName: 'Lead 3 (Calliope)',
    icon: '🎠',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 82,
    slots: ['lead']
  },
  {
    id: 'lead_chiff',
    name: 'Chiff Breathy Lead',
    enName: 'Lead 4 (Chiff)',
    icon: '💨',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 83,
    slots: ['lead']
  },
  {
    id: 'lead_charang',
    name: 'Charang Rock Lead',
    enName: 'Lead 5 (Charang)',
    icon: '🎸',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 84,
    slots: ['lead']
  },
  {
    id: 'lead_voice',
    name: 'Vocal Synth Lead',
    enName: 'Lead 6 (Voice)',
    icon: '🗣️',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 85,
    slots: ['lead']
  },
  {
    id: 'lead_fifths',
    name: 'Parallel 5ths Synth',
    enName: 'Lead 7 (Fifths)',
    icon: '🌌',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 86,
    slots: ['lead']
  },
  {
    id: 'lead_bass_lead',
    name: 'Bass & Lead Synth',
    enName: 'Lead 8 (Bass + Lead)',
    icon: '⚡',
    category: 'syntezatory',
    categoryLabel: 'Syntezatory',
    gmNumber: 87,
    slots: ['lead', 'bass']
  },

  // ==========================================
  // 8. PADY, CHÓRY & TŁA (Pads & Choirs)
  // ==========================================
  {
    id: 'warm_analog',
    name: 'Ciepły Analogowy Pad',
    enName: 'Pad 2 (Warm Analog)',
    icon: '🌅',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 89,
    slots: ['pad', 'lead']
  },
  {
    id: 'shimmer',
    name: 'Gwiezdny Shimmer Pad',
    enName: 'Pad 4 (Choir/Shimmer)',
    icon: '✨',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 91,
    slots: ['pad', 'lead']
  },
  {
    id: 'pad_polysynth',
    name: 'Polysynth 80s Pad',
    enName: 'Pad 3 (Polysynth)',
    icon: '🎛️',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 90,
    slots: ['pad', 'lead']
  },
  {
    id: 'pad_bowed',
    name: 'Smyczkowy Pad Bowed',
    enName: 'Pad 5 (Bowed Glass)',
    icon: '🎻',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 92,
    slots: ['pad', 'lead']
  },
  {
    id: 'pad_metallic',
    name: 'Kosmiczny Metaliczny Pad',
    enName: 'Pad 6 (Metallic)',
    icon: '🛸',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 93,
    slots: ['pad', 'lead']
  },
  {
    id: 'pad_halo',
    name: 'Anielski Pad Halo',
    enName: 'Pad 7 (Halo)',
    icon: '👼',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 94,
    slots: ['pad', 'lead']
  },
  {
    id: 'pad_sweep',
    name: 'Filtr Sweep Pad',
    enName: 'Pad 8 (Sweep)',
    icon: '🌊',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 95,
    slots: ['pad', 'lead']
  },
  {
    id: 'pad_new_age',
    name: 'New Age Fantasy Pad',
    enName: 'Pad 1 (New Age)',
    icon: '🌌',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 88,
    slots: ['pad', 'lead']
  },
  {
    id: 'choir_aahs',
    name: 'Chór Żeński Aahs',
    enName: 'Choir Aahs',
    icon: '🗣️',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 52,
    slots: ['pad', 'lead']
  },
  {
    id: 'voice_oohs',
    name: 'Chór Męski Oohs',
    enName: 'Voice Oohs',
    icon: '🗣️',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 53,
    slots: ['pad', 'lead']
  },
  {
    id: 'synth_voice',
    name: 'Syntetyczny Głos Wokalny',
    enName: 'Synth Voice',
    icon: '🤖',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 54,
    slots: ['pad', 'lead']
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Vintage Warm Chords',
    enName: 'Lo-Fi Electric Piano Chords',
    icon: '☕',
    category: 'pady',
    categoryLabel: 'Pady & Chóry',
    gmNumber: 5,
    slots: ['pad']
  },

  // ==========================================
  // 9. MELODYCZNE PERKUSYJNE (Chromatic Percussion)
  // ==========================================
  {
    id: 'celesta',
    name: 'Celesta Czajkowskiego',
    enName: 'Celesta',
    icon: '✨',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 8,
    slots: ['lead', 'pad']
  },
  {
    id: 'glockenspiel',
    name: 'Dzwonki Orkiestrowe',
    enName: 'Glockenspiel',
    icon: '🔔',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 9,
    slots: ['lead']
  },
  {
    id: 'music_box',
    name: 'Pozytywka',
    enName: 'Music Box',
    icon: '🧸',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 10,
    slots: ['lead']
  },
  {
    id: 'vibraphone',
    name: 'Wibrafon Jazzowy',
    enName: 'Vibraphone & Tremolo',
    icon: '🎶',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 11,
    slots: ['lead', 'pad']
  },
  {
    id: 'marimba',
    name: 'Drewniana Marimba',
    enName: 'Marimba',
    icon: '💎',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 12,
    slots: ['lead']
  },
  {
    id: 'xylophone',
    name: 'Ksylofon Orkiestrowy',
    enName: 'Xylophone',
    icon: '🪵',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 13,
    slots: ['lead']
  },
  {
    id: 'tubular_bells',
    name: 'Dzwony Rurowe',
    enName: 'Tubular Bells',
    icon: '🔔',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 14,
    slots: ['lead', 'pad']
  },
  {
    id: 'kalimba',
    name: 'Kalimba / Mbira',
    enName: 'Kalimba',
    icon: '🌴',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 108,
    slots: ['lead']
  },
  {
    id: 'steel_drums',
    name: 'Stalowe Bębny',
    enName: 'Steel Drums',
    icon: '🏝️',
    category: 'perkusyjne',
    categoryLabel: 'Perkusyjne',
    gmNumber: 114,
    slots: ['lead']
  }
];

// Helper lookup map by ID
const CATALOG_BY_ID = new Map();
INSTRUMENT_CATALOG.forEach(item => {
  CATALOG_BY_ID.set(item.id, item);
});

// Map common aliases
CATALOG_BY_ID.set('acoustic_grand_piano', CATALOG_BY_ID.get('piano'));
CATALOG_BY_ID.set('electric_piano_1', CATALOG_BY_ID.get('rhodes'));
CATALOG_BY_ID.set('electric_piano_2', CATALOG_BY_ID.get('dx7'));
CATALOG_BY_ID.set('hammond', CATALOG_BY_ID.get('drawbar_organ'));
CATALOG_BY_ID.set('church_organ', CATALOG_BY_ID.get('organ'));
CATALOG_BY_ID.set('string_ensemble_1', CATALOG_BY_ID.get('strings'));
CATALOG_BY_ID.set('acoustic_guitar_nylon', CATALOG_BY_ID.get('guitar'));
CATALOG_BY_ID.set('synth_brass_1', CATALOG_BY_ID.get('brass'));
CATALOG_BY_ID.set('acoustic_bass', CATALOG_BY_ID.get('upright'));
CATALOG_BY_ID.set('electric_bass_pick', CATALOG_BY_ID.get('picked'));
CATALOG_BY_ID.set('synth_bass_1', CATALOG_BY_ID.get('moog'));
CATALOG_BY_ID.set('synth_bass_2', CATALOG_BY_ID.get('sub'));
CATALOG_BY_ID.set('lead_square', CATALOG_BY_ID.get('chiptune'));
CATALOG_BY_ID.set('lead_sawtooth', CATALOG_BY_ID.get('synth_lead'));
CATALOG_BY_ID.set('pad_warm', CATALOG_BY_ID.get('warm_analog'));
CATALOG_BY_ID.set('pad_choir', CATALOG_BY_ID.get('shimmer'));

export function getInstrumentById(id) {
  if (!id) return INSTRUMENT_CATALOG[0];
  return CATALOG_BY_ID.get(id) || {
    id,
    name: id.replace(/_/g, ' ').toUpperCase(),
    enName: 'GM Instrument',
    icon: '🎵',
    category: 'klawiszowe',
    categoryLabel: 'Inne',
    gmNumber: 0,
    slots: ['lead', 'pad', 'bass']
  };
}
