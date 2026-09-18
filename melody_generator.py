"""
Melody & MIDI Generator deeply grounded in Music Theory (V2.0).
Generates multi-track Standard MIDI Files (.mid) with:
- Track 1: Melody (phrase-structured, contour-shaped, chord-tone aware, gap-fill, NCTs)
- Track 2: Chords / Harmonic Pad / Arpeggio
- Track 3: Bass Line (functional root & walking passing tones)

Supports 26+ classical, jazz, pop, cinematic, and modal progressions + custom chord strings.
Zero external dependencies required (uses Python standard library).
"""

import sys
import os
import math
import random
import struct
import argparse
from typing import List, Dict, Tuple, Optional

# ==============================================================================
# 1. MUSIC THEORY CONSTANTS & SCALES
# ==============================================================================

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
NOTE_ALIASES = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
}

def note_name_to_pitch_class(name: str) -> int:
    name = name.strip()
    if name in NOTE_ALIASES:
        name = NOTE_ALIASES[name]
    if name not in NOTE_NAMES:
        raise ValueError(f"Unknown note name: {name}")
    return NOTE_NAMES.index(name)

def pitch_class_to_name(pc: int) -> str:
    return NOTE_NAMES[pc % 12]

def midi_to_note_name(midi_num: int) -> str:
    pc = midi_num % 12
    octave = (midi_num // 12) - 1
    return f"{NOTE_NAMES[pc]}{octave}"

SCALES = {
    'major':             [0, 2, 4, 5, 7, 9, 11],       # Ionian
    'minor':             [0, 2, 3, 5, 7, 8, 10],       # Aeolian
    'harmonic_minor':    [0, 2, 3, 5, 7, 8, 11],
    'melodic_minor':     [0, 2, 3, 5, 7, 9, 11],
    'dorian':            [0, 2, 3, 5, 7, 9, 10],
    'phrygian':          [0, 1, 3, 5, 7, 8, 10],
    'lydian':            [0, 2, 4, 6, 7, 9, 11],
    'mixolydian':        [0, 2, 4, 5, 7, 9, 10],
    'locrian':           [0, 1, 3, 5, 6, 8, 10],
    'pentatonic_major':  [0, 2, 4, 7, 9],
    'pentatonic_minor':  [0, 3, 5, 7, 10],
    'blues':             [0, 3, 5, 6, 7, 10],
}

CHORD_TYPES = {
    'maj':    [0, 4, 7],
    'min':    [0, 3, 7],
    'dim':    [0, 3, 6],
    'aug':    [0, 4, 8],
    'sus4':   [0, 5, 7],
    'sus2':   [0, 2, 7],
    '7':      [0, 4, 7, 10],
    'maj7':   [0, 4, 7, 11],
    'min7':   [0, 3, 7, 10],
    'm7b5':   [0, 3, 6, 10],
    'dim7':   [0, 3, 6, 9],
}

HARMONIC_PROGRESSIONS = {
    # Klasyka & Barok
    'classical_canon': [('I', 1.0), ('V', 1.0), ('vi', 1.0), ('iii', 1.0), ('IV', 1.0), ('I', 1.0), ('IV', 1.0), ('V', 1.0)],
    'circle_of_fifths': [('I', 1.0), ('IV', 1.0), ('vii°', 1.0), ('iii', 1.0), ('vi', 1.0), ('ii', 1.0), ('V', 1.0), ('I', 1.0)],
    'andalusian_cadence': [('i', 1.0), ('bVII', 1.0), ('bVI', 1.0), ('V', 1.0), ('i', 1.0), ('bVII', 1.0), ('bVI', 1.0), ('V', 1.0)],
    'neapolitan_cadence': [('i', 1.0), ('iv', 1.0), ('bII', 1.0), ('V7', 1.0), ('i', 1.0), ('bII', 1.0), ('V7', 1.0), ('i', 1.0)],
    'chaconne_baroque': [('i', 1.0), ('V', 1.0), ('bVI', 1.0), ('V', 1.0), ('i', 1.0), ('iv', 1.0), ('bII', 1.0), ('i', 1.0)],

    # Jazz & Neo-Soul
    'jazz_turnaround': [('ii7', 1.0), ('V7', 1.0), ('Imaj7', 1.0), ('VI7', 1.0), ('ii7', 1.0), ('V7', 1.0), ('Imaj7', 2.0)],
    'minor_jazz_two_five': [('m7b5', 1.0), ('V7', 1.0), ('i7', 2.0), ('m7b5', 1.0), ('V7', 1.0), ('i7', 2.0)],
    'coltrane_changes': [('Imaj7', 1.0), ('V7', 1.0), ('bVImaj7', 1.0), ('V7', 1.0), ('IIImaj7', 1.0), ('ii7', 1.0), ('V7', 1.0), ('Imaj7', 1.0)],
    'neo_soul': [('ii7', 1.0), ('V7', 1.0), ('Imaj7', 1.0), ('vi7', 1.0), ('ii7', 1.0), ('V7', 1.0), ('Imaj7', 2.0)],

    # Pop & Rock
    'pop_anthemic': [('I', 1.0), ('V', 1.0), ('vi', 1.0), ('IV', 1.0), ('I', 1.0), ('V', 1.0), ('IV', 1.0), ('I', 1.0)],
    'royal_road': [('IVmaj7', 1.0), ('V7', 1.0), ('iii7', 1.0), ('vi7', 1.0), ('IVmaj7', 1.0), ('V7', 1.0), ('Imaj7', 2.0)],
    'anthem_rock': [('vi', 1.0), ('IV', 1.0), ('I', 1.0), ('V', 1.0), ('vi', 1.0), ('IV', 1.0), ('ii', 1.0), ('V', 1.0)],
    'doo_wop_50s': [('I', 1.0), ('vi', 1.0), ('IV', 1.0), ('V', 1.0), ('I', 1.0), ('vi', 1.0), ('IV', 1.0), ('I', 1.0)],
    'indie_folk': [('I', 1.0), ('IV', 1.0), ('vi', 1.0), ('V', 1.0), ('I', 1.0), ('IV', 1.0), ('V', 1.0), ('I', 1.0)],
    'sad_ballad': [('vi', 1.0), ('IV', 1.0), ('I', 1.0), ('V', 1.0), ('vi', 1.0), ('IV', 1.0), ('ii', 1.0), ('I', 1.0)],

    # Filmowe & Gry
    'cinematic_epic': [('i', 1.0), ('bVI', 1.0), ('bIII', 1.0), ('bVII', 1.0), ('i', 1.0), ('bVI', 1.0), ('v', 1.0), ('i', 1.0)],
    'hollywood_heroic': [('I', 1.0), ('bVII', 1.0), ('IV', 1.0), ('I', 1.0), ('I', 1.0), ('bVII', 1.0), ('V', 1.0), ('I', 1.0)],
    'space_fantasy': [('i', 1.0), ('bVI', 1.0), ('iv', 1.0), ('V', 1.0), ('i', 1.0), ('bVI', 1.0), ('ii°', 1.0), ('i', 1.0)],
    'dark_souls_gothic': [('i', 1.0), ('v', 1.0), ('bVI', 1.0), ('iv', 1.0), ('i', 1.0), ('v', 1.0), ('bII', 1.0), ('i', 1.0)],
    'phrygian_epic': [('i', 1.0), ('bII', 1.0), ('v', 1.0), ('i', 1.0), ('i', 1.0), ('bII', 1.0), ('bVII', 1.0), ('i', 1.0)],
    'post_rock_ambient': [('I', 1.0), ('iii', 1.0), ('IV', 1.0), ('iv', 1.0), ('I', 1.0), ('iii', 1.0), ('IV', 1.0), ('I', 1.0)],

    # Modalne
    'dorian_groove': [('i7', 1.0), ('IV7', 1.0), ('i7', 1.0), ('IV7', 1.0), ('i7', 1.0), ('IV7', 1.0), ('bVII', 1.0), ('i7', 1.0)],
    'lydian_wonder': [('Imaj7', 1.0), ('II7', 1.0), ('Imaj7', 1.0), ('II7', 1.0), ('Imaj7', 1.0), ('II7', 1.0), ('IVmaj7', 1.0), ('Imaj7', 1.0)],
    'mixolydian_rock': [('I', 1.0), ('bVII', 1.0), ('IV', 1.0), ('I', 1.0), ('I', 1.0), ('bVII', 1.0), ('IV', 1.0), ('I', 1.0)],
    'phrygian_dominant_orient': [('I', 1.0), ('bII', 1.0), ('I', 1.0), ('bII', 1.0), ('I', 1.0), ('bII', 1.0), ('iv', 1.0), ('I', 1.0)]
}

# ==============================================================================
# 2. CHORD RESOLVER & HARMONY ENGINE
# ==============================================================================

class Chord:
    def __init__(self, root_pc: int, chord_type: str, duration_beats: float, roman: str = ""):
        self.root_pc = root_pc
        self.chord_type = chord_type
        self.duration_beats = duration_beats
        self.roman = roman
        self.intervals = CHORD_TYPES.get(chord_type, [0, 4, 7])
        self.pitches_pc = [(self.root_pc + interval) % 12 for interval in self.intervals]

    @property
    def name(self) -> str:
        return f"{pitch_class_to_name(self.root_pc)}{self.chord_type}"

    def is_chord_tone(self, pitch: int) -> bool:
        return (pitch % 12) in self.pitches_pc

    def get_voicing(self, base_octave: int = 4) -> List[int]:
        root_midi = (base_octave + 1) * 12 + self.root_pc
        return [root_midi + interval for interval in self.intervals]

def parse_roman_or_name_to_chord(token: str, key_root: int, scale_name: str, duration: float = 4.0) -> Chord:
    clean = token.strip()
    scale = SCALES.get(scale_name, SCALES['major'])

    # Check if absolute chord name (e.g. Dm7, G7, Cmaj7)
    if len(clean) >= 2 and clean[0] in 'ABCDEFGabcdefg' and clean[:2] not in ['iv', 'IV', 'ii', 'II']:
        note_letter = clean[0].upper()
        suffix = clean[1:]
        if suffix.startswith('#') or suffix.startswith('b'):
            note_letter += suffix[0]
            suffix = suffix[1:]

        root_pc = note_name_to_pitch_class(note_letter)
        chord_type = 'maj'
        if suffix.startswith('m') and not suffix.startswith('maj'):
            chord_type = 'min'
        if 'maj7' in suffix: chord_type = 'maj7'
        elif 'm7b5' in suffix or 'ø' in suffix: chord_type = 'm7b5'
        elif 'min7' in suffix or 'm7' in suffix: chord_type = 'min7'
        elif '7' in suffix: chord_type = '7'
        elif 'dim' in suffix or '°' in suffix: chord_type = 'dim'
        elif 'sus4' in suffix: chord_type = 'sus4'
        elif 'sus2' in suffix: chord_type = 'sus2'

        return Chord(root_pc, chord_type, duration_beats=duration, roman=token)

    # Roman numeral parsing
    is_flat = clean.startswith('b')
    if is_flat:
        clean = clean[1:]

    base = ""
    suffix = ""
    for char in clean:
        if char in 'ivIV':
            base += char
        else:
            suffix += char

    roman_degrees = {
        'i': 0, 'I': 0,
        'ii': 1, 'II': 1,
        'iii': 2, 'III': 2,
        'iv': 3, 'IV': 3,
        'v': 4, 'V': 4,
        'vi': 5, 'VI': 5,
        'vii': 6, 'VII': 6
    }

    deg = roman_degrees.get(base, 0)
    semitones_from_key = scale[deg % len(scale)]
    if is_flat:
        semitones_from_key -= 1

    chord_root_pc = (key_root + semitones_from_key) % 12
    is_minor_numeral = base.islower()
    chord_type = 'min' if is_minor_numeral else 'maj'

    if 'maj7' in suffix:
        chord_type = 'maj7'
    elif '7' in suffix:
        chord_type = 'min7' if is_minor_numeral else '7'
    elif 'dim' in suffix or '°' in suffix:
        chord_type = 'dim'
    elif 'm7b5' in suffix:
        chord_type = 'm7b5'
    elif 'sus4' in suffix:
        chord_type = 'sus4'

    return Chord(chord_root_pc, chord_type, duration_beats=duration, roman=token)

def parse_custom_progression_string(prog_str: str) -> List[Tuple[str, float]]:
    import re
    tokens = [t.strip() for t in re.split(r'[-–—,>\s|]+', prog_str) if t.strip()]
    if not tokens:
        return HARMONIC_PROGRESSIONS['pop_anthemic']
    return [(t, 1.0) for t in tokens]

# ==============================================================================
# 3. ADVANCED MUSIC THEORY MELODY GENERATOR
# ==============================================================================

class NoteEvent:
    def __init__(self, pitch: int, start_beat: float, duration_beats: float, velocity: int = 90, role: str = "chord_tone"):
        self.pitch = pitch
        self.start_beat = start_beat
        self.duration_beats = duration_beats
        self.velocity = velocity
        self.role = role

class MelodyGenerator:
    def __init__(
        self,
        key: str = "C",
        scale: str = "major",
        progression_name: str = "pop_anthemic",
        custom_progression: str = "",
        contour: str = "arch",
        density: str = "balanced",
        rhythm_feel: str = "straight",
        accompaniment_style: str = "pad",
        articulation: float = 0.92,
        rest_prob: float = 0.10,
        bpm: int = 120
    ):
        self.key_name = key
        self.key_root = note_name_to_pitch_class(key)
        self.scale_name = scale
        self.scale_intervals = SCALES.get(scale, SCALES['major'])
        self.scale_pcs = [(self.key_root + s) % 12 for s in self.scale_intervals]
        self.progression_name = progression_name
        self.custom_progression = custom_progression
        self.contour = contour
        self.density = density
        self.rhythm_feel = rhythm_feel
        self.accompaniment_style = accompaniment_style
        self.articulation = articulation
        self.rest_prob = rest_prob
        self.bpm = bpm

        self.pitch_min = 60
        self.pitch_max = 81

    def _get_chords_for_bars(self, total_bars: int) -> List[Chord]:
        if self.custom_progression:
            prog_data = parse_custom_progression_string(self.custom_progression)
        else:
            prog_data = HARMONIC_PROGRESSIONS.get(self.progression_name, HARMONIC_PROGRESSIONS['pop_anthemic'])

        chords = []
        bar = 0
        while bar < total_bars:
            for roman, dur_bars in prog_data:
                dur_beats = dur_bars * 4.0
                chord = parse_roman_or_name_to_chord(roman, self.key_root, self.scale_name, duration=dur_beats)
                chords.append(chord)
                bar += dur_bars
                if bar >= total_bars:
                    break
        return chords

    def _get_valid_scale_pitches(self) -> List[int]:
        pitches = [p for p in range(self.pitch_min, self.pitch_max + 1) if (p % 12) in self.scale_pcs]
        return pitches if pitches else [60, 62, 64, 65, 67, 69, 71, 72]

    def generate(self, total_bars: int = 8) -> Tuple[List[NoteEvent], List[NoteEvent], List[NoteEvent]]:
        chords = self._get_chords_for_bars(total_bars)
        valid_pitches = self._get_valid_scale_pitches()

        # 1. HARMONY & BASS TRACK
        chord_notes: List[NoteEvent] = []
        bass_notes: List[NoteEvent] = []

        current_beat = 0.0
        for chord in chords:
            dur = chord.duration_beats
            voicing = chord.get_voicing(base_octave=4)

            if self.accompaniment_style == 'arpeggio':
                step = 0.5
                steps = int(dur / step)
                for i in range(steps):
                    pitch = voicing[i % len(voicing)]
                    chord_notes.append(NoteEvent(pitch, current_beat + (i * step), step * 0.95, velocity=62, role="harmony_arpeggio"))
            elif self.accompaniment_style == 'rhythmic_comp':
                for t in [0.0, 1.5, 2.5, 3.5]:
                    if t < dur:
                        for p in voicing:
                            chord_notes.append(NoteEvent(p, current_beat + t, 0.65, velocity=66, role="harmony_comp"))
            else:
                for p in voicing:
                    chord_notes.append(NoteEvent(p, current_beat, dur, velocity=64, role="harmony_pad"))

            bass_pitch = 36 + chord.root_pc
            if bass_pitch < 36: bass_pitch += 12

            if dur >= 4.0:
                bass_notes.append(NoteEvent(bass_pitch, current_beat, 1.85, velocity=88, role="bass_root"))
                fifth_pitch = 36 + ((chord.root_pc + 7) % 12)
                bass_notes.append(NoteEvent(fifth_pitch, current_beat + 2.0, 1.85, velocity=80, role="bass_fifth"))
            else:
                bass_notes.append(NoteEvent(bass_pitch, current_beat, dur * 0.9, velocity=85, role="bass_root"))

            current_beat += dur

        # 2. MELODY GENERATION
        melody_notes: List[NoteEvent] = []

        if self.density == 'spacious':
            rhythmic_cells = [[2.0, 2.0], [1.5, 0.5, 2.0], [1.0, 1.0, 2.0]]
        elif self.density == 'dense':
            rhythmic_cells = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], [0.5, 0.25, 0.25, 0.5, 0.5, 1.0, 1.0]]
        else:
            if self.rhythm_feel == 'syncopated':
                rhythmic_cells = [[0.5, 1.0, 0.5, 1.0, 1.0], [1.5, 0.5, 1.0, 1.0], [1.0, 0.5, 1.5, 1.0]]
            elif self.rhythm_feel == 'triplets':
                rhythmic_cells = [[0.66, 0.67, 0.67, 1.0, 1.0], [1.33, 0.67, 2.0]]
            else:
                rhythmic_cells = [[1.0, 1.0, 0.5, 0.5, 1.0], [1.5, 0.5, 1.0, 1.0], [0.5, 0.5, 1.0, 0.5, 0.5, 1.0], [1.0, 0.5, 0.5, 2.0]]

        motif_rhythm = random.choice(rhythmic_cells)

        climax_target_beat = total_bars * 4.0 * 0.72
        if self.contour == 'ascending': climax_target_beat = total_bars * 4.0 * 0.90
        elif self.contour == 'descending': climax_target_beat = total_bars * 4.0 * 0.15
        elif self.contour == 'wave': climax_target_beat = total_bars * 4.0 * 0.60

        climax_pitch = valid_pitches[-2]
        climax_achieved = False

        prev_pitch = 60 + self.key_root
        while prev_pitch < 62: prev_pitch += 12
        while prev_pitch > 74: prev_pitch -= 12

        prev_leap_interval = 0
        saved_motif_pitches = []

        for bar_idx in range(total_bars):
            bar_start_beat = bar_idx * 4.0
            is_antecedent_end = (bar_idx == 3)
            is_consequent_end = (bar_idx == total_bars - 1)
            is_motif_bar = (bar_idx == 0)
            is_sequence_bar = (bar_idx == 2)

            active_chord = chords[0]
            c_time = 0.0
            for c in chords:
                if c_time <= bar_start_beat < c_time + c.duration_beats:
                    active_chord = c
                    break
                c_time += c.duration_beats

            if is_antecedent_end or is_consequent_end:
                bar_durations = [2.0, 2.0]
            elif is_motif_bar or is_sequence_bar:
                bar_durations = motif_rhythm
            else:
                bar_durations = random.choice(rhythmic_cells)

            scaled_durations = [(d / sum(bar_durations)) * 4.0 for d in bar_durations]

            measure_beat = 0.0
            for note_idx, dur in enumerate(scaled_durations):
                current_global_beat = bar_start_beat + measure_beat
                is_downbeat = (measure_beat % 2.0 == 0.0)

                # Breathing rest insertion
                if not is_antecedent_end and not is_consequent_end and note_idx > 0 and random.random() < self.rest_prob:
                    measure_beat += dur
                    continue

                curr_chord = active_chord
                c_time = 0.0
                for c in chords:
                    if c_time <= current_global_beat < c_time + c.duration_beats:
                        curr_chord = c
                        break
                    c_time += c.duration_beats

                chord_tones_in_range = [p for p in valid_pitches if curr_chord.is_chord_tone(p)]

                if is_consequent_end and measure_beat >= 2.0:
                    tonic_candidates = [p for p in valid_pitches if (p % 12) == self.key_root and 60 <= p <= 72]
                    target_pitch = tonic_candidates[0] if tonic_candidates else valid_pitches[0]
                    role = "cadence_resolution"
                    prev_leap_interval = 0
                elif is_antecedent_end and measure_beat >= 2.0:
                    half_cadence_pcs = [(self.key_root + 7) % 12, (self.key_root + 2) % 12]
                    candidates = [p for p in valid_pitches if (p % 12) in half_cadence_pcs and abs(p - prev_pitch) <= 5]
                    target_pitch = candidates[0] if candidates else prev_pitch
                    role = "half_cadence_question"
                    prev_leap_interval = 0
                elif not climax_achieved and abs(current_global_beat - climax_target_beat) <= 1.5:
                    target_pitch = climax_pitch
                    role = "climax"
                    climax_achieved = True
                    prev_leap_interval = target_pitch - prev_pitch
                elif is_sequence_bar and note_idx < len(saved_motif_pitches):
                    seq_pitch = saved_motif_pitches[note_idx] + 2
                    target_pitch = seq_pitch if seq_pitch in valid_pitches else prev_pitch
                    role = "chord_tone"
                else:
                    # Gap-fill rule
                    if abs(prev_leap_interval) >= 5:
                        direction = -1 if prev_leap_interval > 0 else 1
                        step_candidates = [p for p in valid_pitches if (p - prev_pitch) * direction > 0 and abs(p - prev_pitch) <= 3]
                        if step_candidates:
                            target_pitch = min(step_candidates, key=lambda p: abs(p - prev_pitch))
                            role = "gap_fill_resolution"
                            prev_leap_interval = 0
                        else:
                            target_pitch = prev_pitch + (direction * 2)
                            role = "passing_tone"
                            prev_leap_interval = 0
                    else:
                        if is_downbeat:
                            if random.random() < 0.85 and chord_tones_in_range:
                                close_chord_tones = sorted(chord_tones_in_range, key=lambda p: abs(p - prev_pitch))
                                reasonable = [p for p in close_chord_tones if abs(p - prev_pitch) <= 5]
                                target_pitch = random.choice(reasonable[:2]) if reasonable else close_chord_tones[0]
                                role = "chord_tone"
                            else:
                                candidates = [p for p in valid_pitches if 1 <= abs(p - prev_pitch) <= 2]
                                target_pitch = random.choice(candidates) if candidates else prev_pitch
                                role = "suspension"
                        else:
                            r = random.random()
                            if r < 0.60:
                                step_candidates = [p for p in valid_pitches if 1 <= abs(p - prev_pitch) <= 2]
                                target_pitch = random.choice(step_candidates) if step_candidates else prev_pitch
                                role = "passing_tone"
                            elif r < 0.85:
                                neighbors = [p for p in valid_pitches if 1 <= abs(p - prev_pitch) <= 2]
                                target_pitch = random.choice(neighbors) if neighbors else prev_pitch
                                role = "neighbor_tone"
                            else:
                                leaps = [p for p in chord_tones_in_range if 4 <= abs(p - prev_pitch) <= 9]
                                if leaps:
                                    target_pitch = random.choice(leaps)
                                    role = "expressive_leap"
                                    prev_leap_interval = target_pitch - prev_pitch
                                else:
                                    target_pitch = prev_pitch
                                    role = "chord_tone"

                    if role != "expressive_leap":
                        prev_leap_interval = target_pitch - prev_pitch

                if is_motif_bar:
                    saved_motif_pitches.append(target_pitch)

                base_vel = 96 if is_downbeat else 82
                vel = max(50, min(120, int(base_vel + random.randint(-4, 6))))

                melody_notes.append(NoteEvent(
                    pitch=target_pitch,
                    start_beat=current_global_beat,
                    duration_beats=dur * self.articulation,
                    velocity=vel,
                    role=role
                ))

                prev_pitch = target_pitch
                measure_beat += dur

        return melody_notes, chord_notes, bass_notes

# ==============================================================================
# 4. STANDARD MIDI BINARY WRITER
# ==============================================================================

def encode_variable_length(value: int) -> bytes:
    buffer = value & 0x7F
    while (value >> 7) > 0:
        value >>= 7
        buffer <<= 8
        buffer |= ((value & 0x7F) | 0x80)
    result = bytearray()
    while True:
        result.append(buffer & 0xFF)
        if buffer & 0x80: buffer >>= 8
        else: break
    return bytes(result)

GM_INSTRUMENTS = {
    # Lead
    'piano': 0,
    'rhodes': 4,
    'synth_lead': 81,
    'chiptune': 80,
    'pluck': 12,
    'vibraphone': 11,
    'flute': 73,
    'guitar': 24,

    # Pad
    'warm_analog': 89,
    'shimmer': 91,
    'strings': 48,
    'brass': 62,
    'organ': 19,
    'lofi': 5,

    # Bass
    'moog': 38,
    'sub': 39,
    'upright': 32,
    'picked': 34,
    'acid': 38,
    'boom808': 39
}

class MidiTrack:
    def __init__(self, name: str = "", channel: int = 0, program_number: Optional[int] = None):
        self.name = name
        self.channel = channel
        self.program_number = program_number
        self.events = []

    def add_note(self, pitch: int, start_tick: int, duration_ticks: int, velocity: int = 90):
        self.events.append((start_tick, 'note_on', pitch, velocity))
        self.events.append((start_tick + duration_ticks, 'note_off', pitch, 0))

    def build_track_data(self, ticks_per_beat: int) -> bytes:
        def sort_key(item):
            tick, ev_type = item[0], item[1]
            return (tick, 0 if ev_type == 'note_off' else 1)

        sorted_events = sorted(self.events, key=sort_key)
        track_bytes = bytearray()

        if self.name:
            track_bytes += b'\x00\xFF\x03' + bytes([len(self.name)]) + self.name.encode('utf-8')

        if self.program_number is not None:
            track_bytes += bytes([0x00, 0xC0 | (self.channel & 0x0F), self.program_number & 0x7F])

        last_tick = 0
        for ev in sorted_events:
            tick = ev[0]
            ev_type = ev[1]
            delta = tick - last_tick
            last_tick = tick

            track_bytes += encode_variable_length(delta)
            if ev_type == 'note_on':
                track_bytes += bytes([0x90 | (self.channel & 0x0F), ev[2] & 0x7F, ev[3] & 0x7F])
            elif ev_type == 'note_off':
                track_bytes += bytes([0x80 | (self.channel & 0x0F), ev[2] & 0x7F, 0])

        track_bytes += b'\x00\xFF\x2F\x00'
        return b'MTrk' + struct.pack('>I', len(track_bytes)) + bytes(track_bytes)

class MidiFileWriter:
    def __init__(self, bpm: int = 120, ticks_per_beat: int = 480):
        self.bpm = bpm
        self.ticks_per_beat = ticks_per_beat
        self.tracks: List[MidiTrack] = []

    def add_track(self, track: MidiTrack):
        self.tracks.append(track)

    def build_conductor_track(self) -> bytes:
        track_bytes = bytearray()
        track_bytes += b'\x00\xFF\x58\x04\x04\x02\x18\x08'
        tempo_val = int(60_000_000 / self.bpm)
        track_bytes += b'\x00\xFF\x51\x03' + struct.pack('>I', tempo_val)[1:]
        track_bytes += b'\x00\xFF\x2F\x00'
        return b'MTrk' + struct.pack('>I', len(track_bytes)) + bytes(track_bytes)

    def write_to_file(self, filepath: str):
        total_tracks = len(self.tracks) + 1
        header = b'MThd' + struct.pack('>IHHH', 6, 1, total_tracks, self.ticks_per_beat)

        with open(filepath, 'wb') as f:
            f.write(header)
            f.write(self.build_conductor_track())
            for t in self.tracks:
                f.write(t.build_track_data(self.ticks_per_beat))

def save_composition_to_midi(
    melody_notes: List[NoteEvent],
    chord_notes: List[NoteEvent],
    bass_notes: List[NoteEvent],
    filepath: str,
    bpm: int = 120,
    ticks_per_beat: int = 480,
    include_chords: bool = True,
    include_bass: bool = True,
    lead_instrument: str = 'piano',
    pad_instrument: str = 'warm_analog',
    bass_instrument: str = 'moog'
):
    writer = MidiFileWriter(bpm=bpm, ticks_per_beat=ticks_per_beat)

    lead_prog = GM_INSTRUMENTS.get(lead_instrument, 0)
    t_melody = MidiTrack(name="Melody Lead", channel=0, program_number=lead_prog)
    for n in melody_notes:
        start_tick = int(n.start_beat * ticks_per_beat)
        dur_tick = int(n.duration_beats * ticks_per_beat)
        t_melody.add_note(n.pitch, start_tick, dur_tick, n.velocity)
    writer.add_track(t_melody)

    if include_chords and chord_notes:
        pad_prog = GM_INSTRUMENTS.get(pad_instrument, 89)
        t_chords = MidiTrack(name="Harmony Chords", channel=1, program_number=pad_prog)
        for n in chord_notes:
            start_tick = int(n.start_beat * ticks_per_beat)
            dur_tick = int(n.duration_beats * ticks_per_beat)
            t_chords.add_note(n.pitch, start_tick, dur_tick, n.velocity)
        writer.add_track(t_chords)

    if include_bass and bass_notes:
        bass_prog = GM_INSTRUMENTS.get(bass_instrument, 38)
        t_bass = MidiTrack(name="Bass Line", channel=2, program_number=bass_prog)
        for n in bass_notes:
            start_tick = int(n.start_beat * ticks_per_beat)
            dur_tick = int(n.duration_beats * ticks_per_beat)
            t_bass.add_note(n.pitch, start_tick, dur_tick, n.velocity)
        writer.add_track(t_bass)

    writer.write_to_file(filepath)
    print(f"[OK] Zapisano plik MIDI: {filepath} ({len(melody_notes)} nut melodii, tempo: {bpm} BPM)")

# ==============================================================================
# 5. CLI INTERFACE
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Zaawansowany generator melodii i plików MIDI (Teoria Muzyki V2.0)."
    )
    parser.add_argument('--key', type=str, default='C', help="Tonacja (np. C, D, Eb, F#, A)")
    parser.add_argument('--scale', type=str, default='major',
                        choices=list(SCALES.keys()),
                        help="Skala / tryb")
    parser.add_argument('--progression', type=str, default='pop_anthemic',
                        choices=list(HARMONIC_PROGRESSIONS.keys()),
                        help="Schemat harmoniczny (z 26+ dostępnych)")
    parser.add_argument('--custom-progression', type=str, default='',
                        help="Własna progresja akordów, np. 'Dm7 - G7 - Cmaj7 - A7'")
    parser.add_argument('--contour', type=str, default='arch',
                        choices=['arch', 'ascending', 'descending', 'wave'],
                        help="Kształt konturu melodii")
    parser.add_argument('--density', type=str, default='balanced',
                        choices=['spacious', 'balanced', 'dense'],
                        help="Gęstość nutowa melodii")
    parser.add_argument('--rhythm-feel', type=str, default='straight',
                        choices=['straight', 'syncopated', 'triplets'],
                        help="Charakter rytmiczny melodii")
    parser.add_argument('--accompaniment', type=str, default='pad',
                        choices=['pad', 'arpeggio', 'rhythmic_comp'],
                        help="Styl akompaniamentu harmonicznego")
    parser.add_argument('--lead-instrument', type=str, default='piano',
                        choices=['piano', 'rhodes', 'synth_lead', 'chiptune', 'pluck', 'vibraphone', 'flute', 'guitar'],
                        help="Barwa instrumentu prowadzącego (General MIDI)")
    parser.add_argument('--pad-instrument', type=str, default='warm_analog',
                        choices=['warm_analog', 'shimmer', 'strings', 'brass', 'organ', 'lofi'],
                        help="Barwa akompaniamentu akordowego")
    parser.add_argument('--bass-instrument', type=str, default='moog',
                        choices=['moog', 'sub', 'upright', 'picked', 'acid', 'boom808'],
                        help="Barwa linii basowej")
    parser.add_argument('--bars', type=int, default=8, help="Liczba taktów")
    parser.add_argument('--bpm', type=int, default=120, help="Tempo w BPM")
    parser.add_argument('--out', type=str, default='generated_melody.mid', help="Ścieżka wyjściowa .mid")
    parser.add_argument('--seed', type=int, default=None, help="Ziarno losowości")

    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    print("=" * 65)
    print("      HARMONIC FORGE V2.0 - GENERATOR TEORII MUZYKI")
    print("=" * 65)
    print(f" Tonacja:            {args.key} {args.scale}")
    print(f" Progresja:          {args.custom_progression if args.custom_progression else args.progression}")
    print(f" Kontur / Gęstość:   {args.contour} / {args.density}")
    print(f" Rytm / Aranżacja:   {args.rhythm_feel} / {args.accompaniment}")
    print(f" Barwy (Lead/Pad/Bass): {args.lead_instrument} / {args.pad_instrument} / {args.bass_instrument}")
    print(f" Liczba taktów:      {args.bars}")
    print(f" Tempo:              {args.bpm} BPM")
    print(f" Plik docelowy:      {args.out}")
    print("-" * 65)

    gen = MelodyGenerator(
        key=args.key,
        scale=args.scale,
        progression_name=args.progression,
        custom_progression=args.custom_progression,
        contour=args.contour,
        density=args.density,
        rhythm_feel=args.rhythm_feel,
        accompaniment_style=args.accompaniment,
        bpm=args.bpm
    )

    melody, chords, bass = gen.generate(total_bars=args.bars)

    print(f"Wygenerowano {len(melody)} nut w partii melodycznej:")
    roles_count = {}
    for n in melody:
        roles_count[n.role] = roles_count.get(n.role, 0) + 1
    for role, count in sorted(roles_count.items()):
        pct = (count / len(melody)) * 100
        print(f"  - {role:<25}: {count:>2} nut ({pct:>4.1f}%)")

    save_composition_to_midi(
        melody_notes=melody,
        chord_notes=chords,
        bass_notes=bass,
        filepath=args.out,
        bpm=args.bpm,
        lead_instrument=args.lead_instrument,
        pad_instrument=args.pad_instrument,
        bass_instrument=args.bass_instrument
    )
    print("=" * 65)

if __name__ == '__main__':
    main()
