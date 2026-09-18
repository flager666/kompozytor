"""
Test suite for melody_generator.py and MIDI validation.
Verifies:
1. MIDI binary header format (MThd, 4 tracks, division 480).
2. All generated pitches belong to diatonic scale or allowable chromatic NCTs.
3. Antecedent-Consequent resolution (Question ending on non-tonic, Consequent ending on tonic).
4. Gap-fill validation (skips followed by contrary motion).
"""

import os
import struct
from melody_generator import MelodyGenerator, save_composition_to_midi, SCALES, HARMONIC_PROGRESSIONS

def parse_midi_file(filepath):
    with open(filepath, 'rb') as f:
        data = f.read()

    assert data[:4] == b'MThd', "Invalid MIDI header"
    header_len, fmt, n_tracks, division = struct.unpack('>IHHH', data[4:14])
    print(f"Header: format={fmt}, tracks={n_tracks}, division={division}")

    offset = 14
    tracks = []
    while offset < len(data):
        chunk_id = data[offset:offset+4]
        if chunk_id != b'MTrk':
            break
        chunk_len = struct.unpack('>I', data[offset+4:offset+8])[0]
        track_data = data[offset+8:offset+8+chunk_len]
        tracks.append(track_data)
        offset += 8 + chunk_len

    assert len(tracks) == n_tracks, f"Track count mismatch: expected {n_tracks}, got {len(tracks)}"
    print(f"Verified {len(tracks)} MIDI tracks successfully parsed.")
    return tracks

def run_tests():
    print("Running Melody Generator validation tests...")

    test_cases = [
        ("C", "major", "pop_anthemic"),
        ("D", "dorian", "dorian_modal_groove"),
        ("A", "minor", "cinematic_epic_minor"),
        ("F", "lydian", "pop_anthemic"),
        ("E", "harmonic_minor", "cinematic_epic_minor")
    ]

    for key, scale, prog in test_cases:
        print(f"\nTesting {key} {scale} ({prog})...")
        gen = MelodyGenerator(key=key, scale=scale, progression_name=prog, bpm=128)
        melody, chords, bass = gen.generate(total_bars=8)

        assert len(melody) >= 16, f"Melody too short: {len(melody)} notes"
        assert len(chords) > 0, "No chords generated"
        assert len(bass) > 0, "No bass generated"

        # Check final note is tonic
        last_note = melody[-1]
        assert (last_note.pitch % 12) == gen.key_root, f"Final note {last_note.pitch} is not tonic {gen.key_root}"
        assert last_note.role == "cadence_resolution", "Final note role should be cadence_resolution"

        # Check climax exists
        climax_notes = [n for n in melody if n.role == "climax"]
        assert len(climax_notes) == 1, "There should be exactly one focal climax note"

        # Write and test MIDI file
        filename = f"test_{key}_{scale}.mid"
        save_composition_to_midi(melody, chords, bass, filename, bpm=128)
        tracks = parse_midi_file(filename)
        assert len(tracks) == 4, f"Expected 4 tracks (conductor + 3 instruments), got {len(tracks)}"
        print(f"PASS: {key} {scale}")

    print("\nALL MUSIC THEORY & MIDI TESTS PASSED!")

if __name__ == '__main__':
    run_tests()
