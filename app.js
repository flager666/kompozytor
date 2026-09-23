/**
 * Harmonic Forge - Main Application Controller V2.2
 * Features:
 * - Algorithmic Melody Generation based on Music Theory
 * - Interactive MIDI Block Arranger & Editor (Draw, Move, Resize, Delete)
 * - Real-time Note Audio Previews
 * - Motif Pattern Insertion & Undo Support
 * - Multi-track MIDI Export with Full General MIDI (GM) Bank
 * - Modern Interactive Instrument Selection Modal with Category Filtering and Search
 */

import { MelodicEngine, midiToNoteName, createPatternBlock, SCALES } from './music-theory.js';
import { exportCompositionToMidi } from './midi-writer.js';
import { AudioEngine } from './synth.js';
import { PianoRoll } from './piano-roll.js';
import { INSTRUMENT_CATEGORIES, INSTRUMENT_CATALOG, getInstrumentById } from './instruments-catalog.js';

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

  // Master FX
  sliderReverb: document.getElementById('sliderReverb'),
  reverbVal: document.getElementById('reverbVal'),
  sliderDelay: document.getElementById('sliderDelay'),
  delayVal: document.getElementById('delayVal'),

  // Instrument Trigger Cards
  triggerLead: document.getElementById('triggerLead'),
  triggerLeadIcon: document.getElementById('triggerLeadIcon'),
  triggerLeadName: document.getElementById('triggerLeadName'),
  triggerLeadSub: document.getElementById('triggerLeadSub'),
  btnPreviewLeadCard: document.getElementById('btnPreviewLeadCard'),

  triggerPad: document.getElementById('triggerPad'),
  triggerPadIcon: document.getElementById('triggerPadIcon'),
  triggerPadName: document.getElementById('triggerPadName'),
  triggerPadSub: document.getElementById('triggerPadSub'),
  btnPreviewPadCard: document.getElementById('btnPreviewPadCard'),

  triggerBass: document.getElementById('triggerBass'),
  triggerBassIcon: document.getElementById('triggerBassIcon'),
  triggerBassName: document.getElementById('triggerBassName'),
  triggerBassSub: document.getElementById('triggerBassSub'),
  btnPreviewBassCard: document.getElementById('btnPreviewBassCard'),

  // Instrument Modal
  instrumentModal: document.getElementById('instrumentModal'),
  modalHeaderIcon: document.getElementById('modalHeaderIcon'),
  modalTargetTitle: document.getElementById('modalTargetTitle'),
  btnCloseInstrumentModal: document.getElementById('btnCloseInstrumentModal'),
  btnModalDone: document.getElementById('btnModalDone'),
  instrumentSearchInput: document.getElementById('instrumentSearchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  modalCategoryTabs: document.getElementById('modalCategoryTabs'),
  instrumentTilesGrid: document.getElementById('instrumentTilesGrid'),

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

  // Multi-Track Arranger Tabs
  tabTrackMelody: document.getElementById('tabTrackMelody'),
  tabTrackChords: document.getElementById('tabTrackChords'),
  tabTrackBass: document.getElementById('tabTrackBass'),
  badgeMelodyCount: document.getElementById('badgeMelodyCount'),
  badgeChordsCount: document.getElementById('badgeChordsCount'),
  badgeBassCount: document.getElementById('badgeBassCount'),
  trackEditingInfoText: document.getElementById('trackEditingInfoText'),

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

// Core Instances & State
const audio = new AudioEngine();
let pianoRoll = null;
let currentComposition = null;
let isLooping = true;
const undoStack = [];

// Instrument Modal State
let currentModalSlot = 'lead'; // 'lead' | 'pad' | 'bass'
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

function init() {
  pianoRoll = new PianoRoll(elements.pianoRollContainer, {
    onSeek: (beat) => {
      if (currentComposition) {
        audio.playComposition(currentComposition, beat, isLooping);
        updatePlayState(true);
      }
    },
    onNotePreview: (pitch, track) => {
      // Instant audio preview when drawing or moving a block using the active track's instrument!
      audio.previewNote(pitch, 0.35, 95, track);
    },
    onCompositionChange: () => {
      if (currentComposition) {
        saveUndoState();
        updateTrackBadges();
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
  updateTriggerCards();
  generateNewMelody();
}

function updateTrackBadges() {
  if (!currentComposition) return;
  const melLen = currentComposition.melodyNotes ? currentComposition.melodyNotes.length : 0;
  const chLen = currentComposition.chordNotes ? currentComposition.chordNotes.length : 0;
  const bassLen = currentComposition.bassNotes ? currentComposition.bassNotes.length : 0;

  if (elements.badgeMelodyCount) elements.badgeMelodyCount.textContent = `${melLen} nut`;
  if (elements.badgeChordsCount) elements.badgeChordsCount.textContent = `${chLen} nut`;
  if (elements.badgeBassCount) elements.badgeBassCount.textContent = `${bassLen} nut`;
}

function saveUndoState() {
  if (!currentComposition) return;
  const snapshot = JSON.stringify({
    melodyNotes: currentComposition.melodyNotes ? [...currentComposition.melodyNotes] : [],
    chordNotes: currentComposition.chordNotes ? [...currentComposition.chordNotes] : [],
    bassNotes: currentComposition.bassNotes ? [...currentComposition.bassNotes] : []
  });
  if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== snapshot) {
    undoStack.push(snapshot);
    if (undoStack.length > 30) undoStack.shift();
  }
}

// =========================================================================
// INSTRUMENT TRIGGER CARDS & MODAL MANAGEMENT
// =========================================================================

function updateTriggerCards() {
  const leadId = elements.selectInstrument ? elements.selectInstrument.value : 'piano';
  const leadInst = getInstrumentById(leadId);
  if (elements.triggerLeadIcon) elements.triggerLeadIcon.textContent = leadInst.icon;
  if (elements.triggerLeadName) elements.triggerLeadName.textContent = leadInst.name;
  if (elements.triggerLeadSub) elements.triggerLeadSub.textContent = `${leadInst.categoryLabel} • GM ${leadInst.gmNumber}`;

  const padId = elements.selectPadInstrument ? elements.selectPadInstrument.value : 'warm_analog';
  const padInst = getInstrumentById(padId);
  if (elements.triggerPadIcon) elements.triggerPadIcon.textContent = padInst.icon;
  if (elements.triggerPadName) elements.triggerPadName.textContent = padInst.name;
  if (elements.triggerPadSub) elements.triggerPadSub.textContent = `${padInst.categoryLabel} • GM ${padInst.gmNumber}`;

  const bassId = elements.selectBassInstrument ? elements.selectBassInstrument.value : 'moog';
  const bassInst = getInstrumentById(bassId);
  if (elements.triggerBassIcon) elements.triggerBassIcon.textContent = bassInst.icon;
  if (elements.triggerBassName) elements.triggerBassName.textContent = bassInst.name;
  if (elements.triggerBassSub) elements.triggerBassSub.textContent = `${bassInst.categoryLabel} • GM ${bassInst.gmNumber}`;
}

function openInstrumentModal(slot) {
  currentModalSlot = slot;
  currentSearchQuery = '';
  if (elements.instrumentSearchInput) {
    elements.instrumentSearchInput.value = '';
  }
  if (elements.btnClearSearch) {
    elements.btnClearSearch.style.display = 'none';
  }

  // Set titles and default categories based on slot
  if (slot === 'lead') {
    if (elements.modalHeaderIcon) elements.modalHeaderIcon.textContent = '🎹';
    if (elements.modalTargetTitle) elements.modalTargetTitle.textContent = 'Wybierz Instrument Wiodący (Lead)';
    currentCategoryFilter = 'all';
  } else if (slot === 'pad') {
    if (elements.modalHeaderIcon) elements.modalHeaderIcon.textContent = '🌅';
    if (elements.modalTargetTitle) elements.modalTargetTitle.textContent = 'Wybierz Barwę Padu / Akompaniamentu';
    currentCategoryFilter = 'pady';
  } else if (slot === 'bass') {
    if (elements.modalHeaderIcon) elements.modalHeaderIcon.textContent = '🎛️';
    if (elements.modalTargetTitle) elements.modalTargetTitle.textContent = 'Wybierz Brzmienie Linii Basowej';
    currentCategoryFilter = 'basy';
  }

  // Update active category chip
  if (elements.modalCategoryTabs) {
    const chips = elements.modalCategoryTabs.querySelectorAll('.modal-cat-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-category') === currentCategoryFilter);
    });
  }

  renderInstrumentTiles();

  if (elements.instrumentModal) {
    elements.instrumentModal.style.display = 'flex';
    elements.instrumentModal.setAttribute('aria-hidden', 'false');
  }

  setTimeout(() => {
    if (elements.instrumentSearchInput) {
      elements.instrumentSearchInput.focus();
    }
  }, 60);
}

function closeInstrumentModal() {
  if (elements.instrumentModal) {
    elements.instrumentModal.style.display = 'none';
    elements.instrumentModal.setAttribute('aria-hidden', 'true');
  }
}

function ensureOptionExists(selectEl, inst) {
  if (!selectEl) return;
  for (let opt of selectEl.options) {
    if (opt.value === inst.id) return;
  }
  const opt = document.createElement('option');
  opt.value = inst.id;
  opt.textContent = `${inst.icon} ${inst.name} (${inst.enName})`;
  selectEl.appendChild(opt);
}

function selectInstrumentFromModal(instId) {
  const inst = getInstrumentById(instId);
  if (!inst) return;

  if (currentModalSlot === 'lead') {
    ensureOptionExists(elements.selectInstrument, inst);
    elements.selectInstrument.value = inst.id;
    audio.soundPreset = inst.id;
    audio.previewLead(inst.id);
  } else if (currentModalSlot === 'pad') {
    ensureOptionExists(elements.selectPadInstrument, inst);
    elements.selectPadInstrument.value = inst.id;
    audio.padPreset = inst.id;
    audio.previewPad(inst.id);
  } else if (currentModalSlot === 'bass') {
    ensureOptionExists(elements.selectBassInstrument, inst);
    elements.selectBassInstrument.value = inst.id;
    audio.bassPreset = inst.id;
    audio.previewBass(inst.id);
  }

  updateTriggerCards();
  updateCliPreview();
  renderInstrumentTiles(); // Refresh active tile border
}

function renderInstrumentTiles() {
  if (!elements.instrumentTilesGrid) return;
  elements.instrumentTilesGrid.innerHTML = '';

  let selectedId = 'piano';
  if (currentModalSlot === 'lead') {
    selectedId = elements.selectInstrument ? elements.selectInstrument.value : 'piano';
  } else if (currentModalSlot === 'pad') {
    selectedId = elements.selectPadInstrument ? elements.selectPadInstrument.value : 'warm_analog';
  } else if (currentModalSlot === 'bass') {
    selectedId = elements.selectBassInstrument ? elements.selectBassInstrument.value : 'moog';
  }

  const q = currentSearchQuery.trim().toLowerCase();

  const filtered = INSTRUMENT_CATALOG.filter(inst => {
    // Search query match
    if (q) {
      const matchName = inst.name.toLowerCase().includes(q);
      const matchEn = inst.enName.toLowerCase().includes(q);
      const matchCat = inst.categoryLabel.toLowerCase().includes(q);
      const matchId = inst.id.toLowerCase().includes(q);
      const matchGm = (`gm ${inst.gmNumber}`).includes(q) || inst.gmNumber.toString() === q;
      if (!matchName && !matchEn && !matchCat && !matchId && !matchGm) {
        return false;
      }
    }

    // Category filter
    if (currentCategoryFilter !== 'all' && inst.category !== currentCategoryFilter) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    elements.instrumentTilesGrid.innerHTML = `
      <div class="empty-tiles-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <div style="font-size: 2.4rem; margin-bottom: 10px;">🔍</div>
        <p style="font-size: 1rem; margin-bottom: 6px; font-weight: 600; color: var(--text-primary);">Nie znaleziono instrumentu "${q}"</p>
        <p style="font-size: 0.85rem;">Spróbuj wpisać inną frazę lub przełącz kategorię na "Wszystkie".</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(inst => {
    const isSelected = (inst.id === selectedId);
    const tile = document.createElement('div');
    tile.className = `instrument-tile ${isSelected ? 'active' : ''}`;
    tile.dataset.id = inst.id;
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.title = `${inst.name} (${inst.enName}) — kliknij, aby wybrać i odsłuchać`;

    tile.innerHTML = `
      <span class="tile-icon">${inst.icon}</span>
      <span class="tile-name">${inst.name}</span>
      <span class="tile-meta">${inst.enName} • GM ${inst.gmNumber}</span>
      <button type="button" class="btn-tile-preview" data-preview="${inst.id}" title="Odsłuchaj barwę ${inst.name}">▶</button>
    `;

    // Click on entire tile selects and previews
    tile.addEventListener('click', (e) => {
      selectInstrumentFromModal(inst.id);
    });

    // Enter / Space keys on focused tile
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectInstrumentFromModal(inst.id);
      }
    });

    // Preview button inside tile
    const previewBtn = tile.querySelector('.btn-tile-preview');
    if (previewBtn) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectInstrumentFromModal(inst.id);
      });
    }

    fragment.appendChild(tile);
  });

  elements.instrumentTilesGrid.appendChild(fragment);
}

// =========================================================================
// EVENT LISTENERS SETUP
// =========================================================================

function setupEventListeners() {
  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Esc: Close instrument modal if open
    if (e.code === 'Escape' || e.key === 'Escape') {
      if (elements.instrumentModal && elements.instrumentModal.style.display !== 'none') {
        e.preventDefault();
        closeInstrumentModal();
        return;
      }
    }

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

  // Instrument Trigger Cards -> Open Modal
  if (elements.triggerLead) {
    elements.triggerLead.addEventListener('click', (e) => {
      if (e.target.closest('#btnPreviewLeadCard')) return;
      openInstrumentModal('lead');
    });
  }
  if (elements.btnPreviewLeadCard) {
    elements.btnPreviewLeadCard.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.previewLead(elements.selectInstrument ? elements.selectInstrument.value : 'piano');
    });
  }

  if (elements.triggerPad) {
    elements.triggerPad.addEventListener('click', (e) => {
      if (e.target.closest('#btnPreviewPadCard')) return;
      openInstrumentModal('pad');
    });
  }
  if (elements.btnPreviewPadCard) {
    elements.btnPreviewPadCard.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.previewPad(elements.selectPadInstrument ? elements.selectPadInstrument.value : 'warm_analog');
    });
  }

  if (elements.triggerBass) {
    elements.triggerBass.addEventListener('click', (e) => {
      if (e.target.closest('#btnPreviewBassCard')) return;
      openInstrumentModal('bass');
    });
  }
  if (elements.btnPreviewBassCard) {
    elements.btnPreviewBassCard.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.previewBass(elements.selectBassInstrument ? elements.selectBassInstrument.value : 'moog');
    });
  }

  // Instrument Modal Close / Done / Backdrop Buttons
  if (elements.btnCloseInstrumentModal) {
    elements.btnCloseInstrumentModal.addEventListener('click', closeInstrumentModal);
  }
  if (elements.btnModalDone) {
    elements.btnModalDone.addEventListener('click', closeInstrumentModal);
  }
  if (elements.instrumentModal) {
    elements.instrumentModal.addEventListener('click', (e) => {
      if (e.target === elements.instrumentModal) {
        closeInstrumentModal();
      }
    });
  }

  // Category Tabs Filter
  if (elements.modalCategoryTabs) {
    elements.modalCategoryTabs.addEventListener('click', (e) => {
      const chip = e.target.closest('.modal-cat-chip');
      if (!chip) return;
      currentCategoryFilter = chip.getAttribute('data-category') || 'all';
      const chips = elements.modalCategoryTabs.querySelectorAll('.modal-cat-chip');
      chips.forEach(c => c.classList.toggle('active', c === chip));
      renderInstrumentTiles();
    });
  }

  // Search Input & Clear Search
  if (elements.instrumentSearchInput) {
    elements.instrumentSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (elements.btnClearSearch) {
        elements.btnClearSearch.style.display = currentSearchQuery ? 'block' : 'none';
      }
      renderInstrumentTiles();
    });
  }
  if (elements.btnClearSearch) {
    elements.btnClearSearch.addEventListener('click', () => {
      currentSearchQuery = '';
      if (elements.instrumentSearchInput) {
        elements.instrumentSearchInput.value = '';
        elements.instrumentSearchInput.focus();
      }
      elements.btnClearSearch.style.display = 'none';
      renderInstrumentTiles();
    });
  }

  // Multi-Track Arranger Tabs (Lead / Chords / Bass)
  const trackTabs = [
    { btn: elements.tabTrackMelody, track: 'melody', name: 'Melodia (Lead)', color: 'var(--accent-cyan)' },
    { btn: elements.tabTrackChords, track: 'chords', name: 'Akordy / Pady', color: '#a5b4fc' },
    { btn: elements.tabTrackBass, track: 'bass', name: 'Linia Basu', color: '#ffb703' }
  ];

  trackTabs.forEach(tab => {
    if (!tab.btn) return;
    tab.btn.addEventListener('click', () => {
      trackTabs.forEach(t => t.btn && t.btn.classList.remove('active'));
      tab.btn.classList.add('active');
      pianoRoll.setActiveTrack(tab.track);
      if (elements.trackEditingInfoText) {
        elements.trackEditingInfoText.innerHTML = `Edytujesz: <strong style="color: ${tab.color};">${tab.name}</strong> — pozostałe ścieżki widoczne jako ghost notes`;
      }
    });
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

  // Clear notes of currently active track
  elements.btnClearNotes.addEventListener('click', () => {
    if (!currentComposition) return;
    saveUndoState();
    audio.stop();
    updatePlayState(false);
    pianoRoll.setActiveNotes([]);
    pianoRoll.draw();
    updateTrackBadges();
    updateMetrics(currentComposition);
  });

  // Undo Button (Restores all 3 tracks)
  elements.btnUndo.addEventListener('click', () => {
    if (undoStack.length > 1) {
      undoStack.pop(); // Pop current state
      const prev = JSON.parse(undoStack[undoStack.length - 1]);
      if (prev.melodyNotes !== undefined) {
        currentComposition.melodyNotes = prev.melodyNotes;
        currentComposition.chordNotes = prev.chordNotes || [];
        currentComposition.bassNotes = prev.bassNotes || [];
      } else {
        // Fallback for legacy single-track snapshots
        currentComposition.melodyNotes = prev;
      }
      pianoRoll.draw();
      updateTrackBadges();
      updateMetrics(currentComposition);
    }
  });

  // Snap active track notes to current scale
  elements.btnSnapScale.addEventListener('click', () => {
    if (!currentComposition) return;
    const activeNotes = pianoRoll.getActiveNotes();
    if (!activeNotes || activeNotes.length === 0) return;
    saveUndoState();
    const scalePcs = currentComposition.scalePcs;
    activeNotes.forEach(n => {
      let pc = n.pitch % 12;
      if (!scalePcs.includes(pc)) {
        // Adjust by 1 semitone to nearest scale degree
        if (scalePcs.includes((pc + 1) % 12)) n.pitch += 1;
        else if (scalePcs.includes((pc - 1 + 12) % 12)) n.pitch -= 1;
        n.noteName = midiToNoteName(n.pitch);
      }
    });
    pianoRoll.draw();
    updateTrackBadges();
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

    // Adjust pitch range for the active track
    if (pianoRoll.activeTrack === 'bass') {
      newNotes.forEach(n => {
        n.pitch = Math.max(28, n.pitch - 24);
        n.noteName = midiToNoteName(n.pitch);
        n.role = 'chord_tone';
      });
    } else if (pianoRoll.activeTrack === 'chords') {
      newNotes.forEach(n => {
        n.pitch = Math.max(48, n.pitch - 12);
        n.noteName = midiToNoteName(n.pitch);
        n.role = 'chord_tone';
      });
    }

    const activeNotes = pianoRoll.getActiveNotes();
    activeNotes.push(...newNotes);
    activeNotes.sort((a, b) => a.startBeat - b.startBeat);
    pianoRoll.draw();
    updateTrackBadges();
    updateMetrics(currentComposition);

    // Audio preview of first note using matching timbre
    if (newNotes.length > 0) {
      audio.previewNote(newNotes[0].pitch, 0.4, 95, pianoRoll.activeTrack);
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

  // Master Spatial Effects (Reverb & Delay)
  if (elements.sliderReverb) {
    elements.sliderReverb.addEventListener('input', (e) => {
      const pct = parseInt(e.target.value, 10);
      elements.reverbVal.textContent = `${pct}%`;
      audio.setReverb(pct / 100);
    });
  }

  if (elements.sliderDelay) {
    elements.sliderDelay.addEventListener('input', (e) => {
      const pct = parseInt(e.target.value, 10);
      elements.delayVal.textContent = `${pct}%`;
      audio.setDelay(pct / 100);
    });
  }

  // Hidden Select changes -> update audio, trigger cards & CLI
  elements.selectInstrument.addEventListener('change', (e) => {
    audio.soundPreset = e.target.value;
    audio.previewLead(e.target.value);
    updateTriggerCards();
    updateCliPreview();
  });

  elements.selectPadInstrument.addEventListener('change', (e) => {
    audio.padPreset = e.target.value;
    audio.previewPad(e.target.value);
    updateTriggerCards();
    updateCliPreview();
  });

  elements.selectBassInstrument.addEventListener('change', (e) => {
    audio.bassPreset = e.target.value;
    audio.previewBass(e.target.value);
    updateTriggerCards();
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
      density: 'dense', rhythm: 'straight', instrument: 'harpsichord', padInstrument: 'organ', bassInstrument: 'upright', bpm: 116, accompaniment: 'arpeggio'
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
    ensureOptionExists(elements.selectInstrument, getInstrumentById(cfg.instrument));
    elements.selectInstrument.value = cfg.instrument;
    audio.soundPreset = cfg.instrument;
  }
  if (cfg.padInstrument) {
    ensureOptionExists(elements.selectPadInstrument, getInstrumentById(cfg.padInstrument));
    elements.selectPadInstrument.value = cfg.padInstrument;
    audio.padPreset = cfg.padInstrument;
  }
  if (cfg.bassInstrument) {
    ensureOptionExists(elements.selectBassInstrument, getInstrumentById(cfg.bassInstrument));
    elements.selectBassInstrument.value = cfg.bassInstrument;
    audio.bassPreset = cfg.bassInstrument;
  }

  elements.bpmSlider.value = cfg.bpm;
  elements.bpmValue.textContent = `${cfg.bpm} BPM`;

  updateTriggerCards();
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
  updateTrackBadges();
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
