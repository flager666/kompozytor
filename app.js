/**
 * Harmonic Forge - Main Application Controller V2.1
 * Features:
 * - Algorithmic Melody Generation based on Music Theory
 * - Interactive MIDI Block Arranger & Editor (Draw, Move, Resize, Delete)
 * - Real-time Note Audio Previews
 * - Motif Pattern Insertion & Undo Support
 * - Multi-track MIDI Export
 */

import { MelodicEngine, midiToNoteName, createPatternBlock, SCALES } from './music-theory.js';
import { exportCompositionToMidi } from './midi-writer.js';
import { AudioEngine } from './synth.js';
import { PianoRoll } from './piano-roll.js';

// DOM Elements
const elements = {
  selectKey: document.getElementById('selectKey'),
  selectScale: document.getElementById('selectScale'),
  selectProgression: document.getElementById('selectProgression'),
  customProgressionWrap: document.getElementById('customProgressionWrap'),
  customProgressionInput: document.getElementById('customProgressionInput'),
  selectBars: document.getElementById('selectBars'),

  // Contour & Range
  selectContour: document.getElementById('selectContour'),
  selectRange: document.getElementById('selectRange'),
  sliderStepRatio: document.getElementById('sliderStepRatio'),
  stepRatioVal: document.getElementById('stepRatioVal'),
  toggleGapFill: document.getElementById('toggleGapFill'),

  // Rhythm & Density
  selectDensity: document.getElementById('selectDensity'),
  selectRhythmFeel: document.getElementById('selectRhythmFeel'),
  sliderRestProb: document.getElementById('sliderRestProb'),
  restProbVal: document.getElementById('restProbVal'),
  sliderNctDensity: document.getElementById('sliderNctDensity'),
  nctDensityVal: document.getElementById('nctDensityVal'),

  // Motific Techniques & Articulation
  toggleSequence: document.getElementById('toggleSequence'),
  toggleInversion: document.getElementById('toggleInversion'),
  toggleFlourishes: document.getElementById('toggleFlourishes'),
  sliderArticulation: document.getElementById('sliderArticulation'),
  articulationVal: document.getElementById('articulationVal'),

  // Accompaniment & Sound
  selectAccompaniment: document.getElementById('selectAccompaniment'),
  selectInstrument: document.getElementById('selectInstrument'),
  selectPadInstrument: document.getElementById('selectPadInstrument'),
  selectBassInstrument: document.getElementById('selectBassInstrument'),
  toggleMelody: document.getElementById('toggleMelody'),
  toggleChords: document.getElementById('toggleChords'),
  toggleBass: document.getElementById('toggleBass'),

  // Transport
  btnGenerate: document.getElementById('btnGenerate'),
  btnPlayPause: document.getElementById('btnPlayPause'),
  playIcon: document.getElementById('playIcon'),
  playText: document.getElementById('playText'),
  btnStop: document.getElementById('btnStop'),
  btnLoop: document.getElementById('btnLoop'),

  bpmSlider: document.getElementById('bpmSlider'),
  bpmValue: document.getElementById('bpmValue'),
  volSlider: document.getElementById('volSlider'),
  volValue: document.getElementById('volValue'),
  barCounterDisplay: document.getElementById('barCounterDisplay'),

  pianoRollContainer: document.getElementById('pianoRollContainer'),
  btnDownloadMidi: document.getElementById('btnDownloadMidi'),

  // MIDI Block Arranger Toolbar
  toolDraw: document.getElementById('toolDraw'),
  toolSelect: document.getElementById('toolSelect'),
  toolErase: document.getElementById('toolErase'),
  selectSnap: document.getElementById('selectSnap'),
  btnInsertArp: document.getElementById('btnInsertArp'),
  btnInsertRun: document.getElementById('btnInsertRun'),
  btnInsertCadence: document.getElementById('btnInsertCadence'),
  btnSnapScale: document.getElementById('btnSnapScale'),
  btnUndo: document.getElementById('btnUndo'),
  btnClearNotes: document.getElementById('btnClearNotes'),

  metricNotesCount: document.getElementById('metricNotesCount'),
  metricChordToneRatio: document.getElementById('metricChordToneRatio'),
  metricStepRatio: document.getElementById('metricStepRatio'),
  metricClimaxPitch: document.getElementById('metricClimaxPitch'),
  cliPreviewText: document.getElementById('cliPreviewText'),

  // Preset chips
  presetChopin: document.getElementById('presetChopin'),
  presetBach: document.getElementById('presetBach'),
  presetRoyal: document.getElementById('presetRoyal'),
  presetJazz: document.getElementById('presetJazz'),
  presetEpic: document.getElementById('presetEpic'),
  presetModal: document.getElementById('presetModal')
};

// Core Instances
const audio = new AudioEngine();
let pianoRoll = null;
let currentComposition = null;
let isLooping = true;
const undoStack = [];

function init() {
  pianoRoll = new PianoRoll(elements.pianoRollContainer, {
    onSeek: (beat) => {
      if (currentComposition) {
        audio.playComposition(currentComposition, beat, isLooping);
        updatePlayState(true);
      }
    },
    onNotePreview: (pitch) => {
      // Instant audio preview when drawing or moving a block!
      audio.previewNote(pitch, 0.35, 95);
    },
    onCompositionChange: () => {
      if (currentComposition) {
        saveUndoState();
        updateMetrics(currentComposition);
      }
    }
  });
  window.pianoRoll = pianoRoll;

  audio.onBeatUpdate = (beat) => {
    pianoRoll.setPlayhead(beat);

    const bar = Math.floor(beat / 4) + 1;
    const beatInBar = Math.floor(beat % 4) + 1;
    const totalBars = currentComposition ? currentComposition.totalBars : 8;
    elements.barCounterDisplay.textContent = `TAKT: ${bar}.${beatInBar} / ${totalBars}`;
  };

  audio.onPlaybackEnd = () => {
    updatePlayState(false);
  };

  setupEventListeners();
  generateNewMelody();
}

function saveUndoState() {
  if (!currentComposition || !currentComposition.melodyNotes) return;
  const snapshot = JSON.stringify(currentComposition.melodyNotes);
  if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== snapshot) {
    undoStack.push(snapshot);
    if (undoStack.length > 30) undoStack.shift();
  }
}

function setupEventListeners() {
  // Global Keyboard Shortcuts (Space = Play/Pause, Delete = Delete selected notes)
  window.addEventListener('keydown', (e) => {
    // Ignore shortcuts when editing text or form fields
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }

    // Space: Play / Pause toggle
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      elements.btnPlayPause.click();
      return;
    }

    // Delete or Backspace: Remove selected MIDI blocks
    if (e.code === 'Delete' || e.code === 'Backspace') {
      e.preventDefault();
      if (pianoRoll) {
        saveUndoState();
        pianoRoll.deleteSelectedNotes();
      }
      return;
    }

    // Ctrl+Z: Undo
    if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyZ' || e.key === 'z')) {
      e.preventDefault();
      elements.btnUndo.click();
      return;
    }
  });

  // Toolbar Tool selection
  const tools = [
    { btn: elements.toolDraw, name: 'draw' },
    { btn: elements.toolSelect, name: 'select' },
    { btn: elements.toolErase, name: 'erase' }
  ];

  tools.forEach(t => {
    t.btn.addEventListener('click', () => {
      tools.forEach(other => other.btn.classList.remove('active'));
      t.btn.classList.add('active');
      pianoRoll.setTool(t.name);
    });
  });

  // Snap to Grid
  elements.selectSnap.addEventListener('change', (e) => {
    pianoRoll.setSnap(e.target.value);
  });

  // Clear notes (Start from blank canvas)
  elements.btnClearNotes.addEventListener('click', () => {
    if (!currentComposition) return;
    saveUndoState();
    audio.stop();
    updatePlayState(false);
    currentComposition.melodyNotes = [];
    pianoRoll.draw();
    updateMetrics(currentComposition);
  });

  // Undo Button
  elements.btnUndo.addEventListener('click', () => {
    if (undoStack.length > 1) {
      undoStack.pop(); // Pop current state
      const prev = JSON.parse(undoStack[undoStack.length - 1]);
      currentComposition.melodyNotes = prev;
      pianoRoll.draw();
      updateMetrics(currentComposition);
    }
  });

  // Snap all notes to current scale
  elements.btnSnapScale.addEventListener('click', () => {
    if (!currentComposition || !currentComposition.melodyNotes) return;
    saveUndoState();
    const scalePcs = currentComposition.scalePcs;
    currentComposition.melodyNotes.forEach(n => {
      let pc = n.pitch % 12;
      if (!scalePcs.includes(pc)) {
        // Adjust by 1 semitone to nearest scale degree
        if (scalePcs.includes((pc + 1) % 12)) n.pitch += 1;
        else if (scalePcs.includes((pc - 1 + 12) % 12)) n.pitch -= 1;
        n.noteName = midiToNoteName(n.pitch);
      }
    });
    pianoRoll.draw();
    updateMetrics(currentComposition);
  });

  // Insert Pattern Blocks
  elements.btnInsertArp.addEventListener('click', () => {
    insertBlock('arpeggio_up');
  });
  elements.btnInsertRun.addEventListener('click', () => {
    insertBlock('scale_run');
  });
  elements.btnInsertCadence.addEventListener('click', () => {
    insertBlock('cadence_turn');
  });

  function insertBlock(patternType) {
    if (!currentComposition) return;
    saveUndoState();
    const startBeat = Math.min(
      (currentComposition.totalBars * 4) - 2,
      Math.floor(pianoRoll.currentBeat / 4) * 4
    );
    const newNotes = createPatternBlock(
      patternType,
      startBeat,
      currentComposition.chords,
      currentComposition.keyRoot,
      currentComposition.scalePcs
    );
    currentComposition.melodyNotes.push(...newNotes);
    currentComposition.melodyNotes.sort((a, b) => a.startBeat - b.startBeat);
    pianoRoll.draw();
    updateMetrics(currentComposition);

    // Audio preview of first note
    if (newNotes.length > 0) {
      audio.previewNote(newNotes[0].pitch, 0.4, 95);
    }
  }

  // Progression Select & Custom input toggle
  elements.selectProgression.addEventListener('change', () => {
    const isCustom = elements.selectProgression.value === 'custom';
    elements.customProgressionWrap.style.display = isCustom ? 'block' : 'none';
    updateCliPreview();
  });

  elements.customProgressionInput.addEventListener('input', updateCliPreview);

  // Generate Button
  elements.btnGenerate.addEventListener('click', () => {
    generateNewMelody();
  });

  // Transport Controls
  elements.btnPlayPause.addEventListener('click', () => {
    if (!currentComposition) return;

    if (audio.isPlaying) {
      audio.pause();
      updatePlayState(false);
    } else if (audio.isPaused) {
      audio.resume();
      updatePlayState(true);
    } else {
      audio.playComposition(currentComposition, 0, isLooping);
      updatePlayState(true);
    }
  });

  elements.btnStop.addEventListener('click', () => {
    audio.stop();
    updatePlayState(false);
    elements.barCounterDisplay.textContent = `TAKT: 1.1 / ${currentComposition ? currentComposition.totalBars : 8}`;
  });

  elements.btnLoop.addEventListener('click', () => {
    isLooping = !isLooping;
    elements.btnLoop.classList.toggle('active', isLooping);
    audio.loop = isLooping;
  });

  // BPM Slider
  elements.bpmSlider.addEventListener('input', (e) => {
    const bpm = parseInt(e.target.value, 10);
    elements.bpmValue.textContent = `${bpm} BPM`;
    if (currentComposition) {
      currentComposition.bpm = bpm;
      audio.bpm = bpm;
    }
    updateCliPreview();
  });

  // Master Volume
  elements.volSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    elements.volValue.textContent = `${Math.round(vol * 100)}%`;
    audio.setVolume(vol);
  });

  // Sliders display update
  elements.sliderStepRatio.addEventListener('input', (e) => {
    elements.stepRatioVal.textContent = `${e.target.value}%`;
  });

  elements.sliderRestProb.addEventListener('input', (e) => {
    elements.restProbVal.textContent = `${e.target.value}%`;
  });

  elements.sliderNctDensity.addEventListener('input', (e) => {
    elements.nctDensityVal.textContent = `${e.target.value}%`;
  });

  elements.sliderArticulation.addEventListener('input', (e) => {
    elements.articulationVal.textContent = `${e.target.value}%`;
  });

  // Instrument selections & instant audio previews
  elements.selectInstrument.addEventListener('change', (e) => {
    audio.soundPreset = e.target.value;
    audio.previewLead(e.target.value);
    updateCliPreview();
  });

  elements.selectPadInstrument.addEventListener('change', (e) => {
    audio.padPreset = e.target.value;
    audio.previewPad(e.target.value);
    updateCliPreview();
  });

  elements.selectBassInstrument.addEventListener('change', (e) => {
    audio.bassPreset = e.target.value;
    audio.previewBass(e.target.value);
    updateCliPreview();
  });

  // Track toggles
  elements.toggleMelody.addEventListener('change', (e) => {
    audio.enableMelody = e.target.checked;
  });
  elements.toggleChords.addEventListener('change', (e) => {
    audio.enableChords = e.target.checked;
  });
  elements.toggleBass.addEventListener('change', (e) => {
    audio.enableBass = e.target.checked;
  });

  // MIDI Download
  elements.btnDownloadMidi.addEventListener('click', () => {
    if (!currentComposition) return;
    const progLabel = elements.selectProgression.value === 'custom' ? 'Custom' : elements.selectProgression.value;
    const filename = `HarmonicForge_${currentComposition.key}_${currentComposition.scale}_${progLabel}_${currentComposition.bpm}BPM.mid`;
    exportCompositionToMidi(currentComposition, filename, {
      includeChords: elements.toggleChords.checked,
      includeBass: elements.toggleBass.checked,
      leadInstrument: elements.selectInstrument ? elements.selectInstrument.value : 'piano',
      padInstrument: elements.selectPadInstrument ? elements.selectPadInstrument.value : 'warm_analog',
      bassInstrument: elements.selectBassInstrument ? elements.selectBassInstrument.value : 'moog'
    });
  });

  // Preset chips
  elements.presetChopin.addEventListener('click', () => {
    applyPreset({
      key: 'Eb', scale: 'minor', prog: 'sad_ballad', contour: 'descending',
      density: 'spacious', rhythm: 'straight', instrument: 'piano', padInstrument: 'strings', bassInstrument: 'upright', bpm: 88, accompaniment: 'arpeggio'
    });
  });

  elements.presetBach.addEventListener('click', () => {
    applyPreset({
      key: 'D', scale: 'major', prog: 'classical_canon', contour: 'arch',
      density: 'dense', rhythm: 'straight', instrument: 'pluck', padInstrument: 'organ', bassInstrument: 'upright', bpm: 116, accompaniment: 'arpeggio'
    });
  });

  elements.presetRoyal.addEventListener('click', () => {
    applyPreset({
      key: 'F', scale: 'major', prog: 'royal_road', contour: 'wave',
      density: 'balanced', rhythm: 'syncopated', instrument: 'rhodes', padInstrument: 'warm_analog', bassInstrument: 'picked', bpm: 124, accompaniment: 'rhythmic_comp'
    });
  });

  elements.presetJazz.addEventListener('click', () => {
    applyPreset({
      key: 'F', scale: 'major', prog: 'neo_soul', contour: 'wave',
      density: 'balanced', rhythm: 'syncopated', instrument: 'rhodes', padInstrument: 'lofi', bassInstrument: 'upright', bpm: 90, accompaniment: 'rhythmic_comp'
    });
  });

  elements.presetEpic.addEventListener('click', () => {
    applyPreset({
      key: 'A', scale: 'minor', prog: 'cinematic_epic', contour: 'ascending',
      density: 'spacious', rhythm: 'straight', instrument: 'synth_lead', padInstrument: 'shimmer', bassInstrument: 'moog', bpm: 128, accompaniment: 'pad'
    });
  });

  elements.presetModal.addEventListener('click', () => {
    applyPreset({
      key: 'D', scale: 'dorian', prog: 'dorian_groove', contour: 'arch',
      density: 'dense', rhythm: 'syncopated', instrument: 'synth_lead', padInstrument: 'brass', bassInstrument: 'acid', bpm: 120, accompaniment: 'rhythmic_comp'
    });
  });

  // CLI Preview update triggers
  [elements.selectKey, elements.selectScale, elements.selectContour, elements.selectDensity, elements.selectRhythmFeel, elements.selectAccompaniment, elements.selectBars, elements.selectInstrument, elements.selectPadInstrument, elements.selectBassInstrument].forEach(el => {
    el.addEventListener('change', updateCliPreview);
  });
}

function applyPreset(cfg) {
  elements.selectKey.value = cfg.key;
  elements.selectScale.value = cfg.scale;
  elements.selectProgression.value = cfg.prog;
  elements.customProgressionWrap.style.display = 'none';

  elements.selectContour.value = cfg.contour;
  elements.selectDensity.value = cfg.density;
  elements.selectRhythmFeel.value = cfg.rhythm;
  elements.selectAccompaniment.value = cfg.accompaniment;

  if (cfg.instrument) {
    elements.selectInstrument.value = cfg.instrument;
    audio.soundPreset = cfg.instrument;
  }
  if (cfg.padInstrument) {
    elements.selectPadInstrument.value = cfg.padInstrument;
    audio.padPreset = cfg.padInstrument;
  }
  if (cfg.bassInstrument) {
    elements.selectBassInstrument.value = cfg.bassInstrument;
    audio.bassPreset = cfg.bassInstrument;
  }

  elements.bpmSlider.value = cfg.bpm;
  elements.bpmValue.textContent = `${cfg.bpm} BPM`;

  generateNewMelody();
}

function updatePlayState(playing) {
  if (playing) {
    elements.playIcon.textContent = '⏸';
    elements.playText.textContent = 'Pauza';
    elements.btnPlayPause.classList.add('active');
  } else {
    elements.playIcon.textContent = '▶';
    elements.playText.textContent = 'Odtwórz';
    elements.btnPlayPause.classList.remove('active');
  }
}

function generateNewMelody() {
  const wasPlaying = audio.isPlaying;
  audio.stop();
  updatePlayState(false);

  const key = elements.selectKey.value;
  const scale = elements.selectScale.value;
  const progression = elements.selectProgression.value;
  const customProgressionText = elements.customProgressionInput.value;
  const totalBars = parseInt(elements.selectBars.value, 10);
  const bpm = parseInt(elements.bpmSlider.value, 10);

  const contour = elements.selectContour.value;
  const melodicRange = elements.selectRange.value;
  const density = elements.selectDensity.value;
  const rhythmFeel = elements.selectRhythmFeel.value;
  const accompanimentStyle = elements.selectAccompaniment.value;

  const stepRatio = parseInt(elements.sliderStepRatio.value, 10) / 100;
  const restProb = parseInt(elements.sliderRestProb.value, 10) / 100;
  const nctDensity = parseInt(elements.sliderNctDensity.value, 10) / 100;
  const articulation = parseInt(elements.sliderArticulation.value, 10) / 100;

  const gapFill = elements.toggleGapFill.checked;
  const motificSequence = elements.toggleSequence.checked;
  const motificInversion = elements.toggleInversion.checked;
  const arpeggiatedFlourishes = elements.toggleFlourishes.checked;

  const engine = new MelodicEngine({
    key,
    scale,
    progression,
    customProgressionText,
    bpm,
    contour,
    melodicRange,
    density,
    rhythmFeel,
    accompanimentStyle,
    stepToLeapRatio: stepRatio,
    restProbability: restProb,
    nctDensity,
    articulation,
    gapFillEnabled: gapFill,
    motificSequence,
    motificInversion,
    arpeggiatedFlourishes
  });

  currentComposition = engine.generate(totalBars);
  pianoRoll.setComposition(currentComposition);
  saveUndoState();

  updateMetrics(currentComposition);
  updateCliPreview();

  if (wasPlaying) {
    audio.playComposition(currentComposition, 0, isLooping);
    updatePlayState(true);
  }
}

function updateMetrics(comp) {
  if (!comp || !comp.melodyNotes) return;
  const notes = comp.melodyNotes;
  elements.metricNotesCount.textContent = notes.length;

  if (notes.length === 0) {
    elements.metricChordToneRatio.textContent = '0%';
    elements.metricStepRatio.textContent = '0%';
    elements.metricClimaxPitch.textContent = '-';
    return;
  }

  const chordTones = notes.filter(n => n.role === 'chord_tone' || n.role === 'cadence_resolution');
  const chordTonePct = Math.round((chordTones.length / notes.length) * 100);
  elements.metricChordToneRatio.textContent = `${chordTonePct}%`;

  let steps = 0;
  for (let i = 1; i < notes.length; i++) {
    const interval = Math.abs(notes[i].pitch - notes[i - 1].pitch);
    if (interval >= 1 && interval <= 2) steps++;
  }
  const stepPct = Math.round((steps / Math.max(1, notes.length - 1)) * 100) || 75;
  elements.metricStepRatio.textContent = `${stepPct}%`;

  const maxNote = [...notes].sort((a, b) => b.pitch - a.pitch)[0];
  elements.metricClimaxPitch.textContent = maxNote ? maxNote.noteName : '-';
}

function updateCliPreview() {
  const key = elements.selectKey.value;
  const scale = elements.selectScale.value;
  const isCustom = elements.selectProgression.value === 'custom';
  const progArg = isCustom
    ? `--custom-progression "${elements.customProgressionInput.value.trim()}"`
    : `--progression ${elements.selectProgression.value}`;
  const contour = elements.selectContour.value;
  const density = elements.selectDensity.value;
  const rhythm = elements.selectRhythmFeel.value;
  const accomp = elements.selectAccompaniment.value;
  const leadInst = elements.selectInstrument.value;
  const padInst = elements.selectPadInstrument.value;
  const bassInst = elements.selectBassInstrument.value;
  const bars = elements.selectBars.value;
  const bpm = elements.bpmSlider.value;

  elements.cliPreviewText.textContent = `python melody_generator.py --key ${key} --scale ${scale} ${progArg} --contour ${contour} --density ${density} --rhythm-feel ${rhythm} --accompaniment ${accomp} --lead-instrument ${leadInst} --pad-instrument ${padInst} --bass-instrument ${bassInst} --bars ${bars} --bpm ${bpm} --out melodia.mid`;
}

window.addEventListener('DOMContentLoaded', init);
