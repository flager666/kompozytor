/**
 * Harmonic Forge - Interactive Piano Roll & MIDI Block Arranger V2.2
 * Full DAW-style editing:
 * - ✏️ Draw notes by clicking empty grid
 * - ↕️ Move & transpose single or multi-selected notes
 * - ↔️ Resize duration by dragging right edge
 * - ⌨️ Ctrl + Drag: Marquee Selection (zaznaczanie prostokątem)
 * - 🖱️ Right Click & Drag: Instant Erase / Swipe Erase
 * - ⌨️ Delete / Backspace: Remove selected notes
 * - 🎵 Real-time audio preview on click & drag
 * - 💡 Scale & chord degree row highlights
 */

import { NOTE_NAMES, midiToNoteName, analyzeNoteRole } from './music-theory.js';

export const ROLE_COLORS = {
  chord_tone: { fill: '#00e5ff', stroke: '#80f2ff', label: 'Dźwięk akordowy (Chord Tone)' },
  passing_tone: { fill: '#fb8500', stroke: '#ffb703', label: 'Dźwięk przejściowy (Passing Tone)' },
  neighbor_tone: { fill: '#06d6a0', stroke: '#83f8d6', label: 'Dźwięk pomocniczy (Neighbor Tone)' },
  suspension: { fill: '#ef476f', stroke: '#f78da7', label: 'Opóźnienie (Suspension)' },
  gap_fill_resolution: { fill: '#48cae4', stroke: '#90e0ef', label: 'Wyrównanie skoku (Gap-Fill)' },
  climax: { fill: '#f72585', stroke: '#ff70a6', label: 'Kulminacja frazy (Climax)' },
  cadence_resolution: { fill: '#ffd166', stroke: '#fff1c5', label: 'Rozwiązanie kadencji (Tonic)' },
  half_cadence_question: { fill: '#9b5de5', stroke: '#c77dff', label: 'Półkadencja (Pytanie)' },
  expressive_leap: { fill: '#7209b7', stroke: '#a370f7', label: 'Skok ekspresyjny (Leap)' }
};

export class PianoRoll {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.composition = null;
    this.currentBeat = 0;
    this.hoveredNote = null;

    // Viewport bounds
    this.minPitch = 55; // G3
    this.maxPitch = 86; // D6
    this.leftGutter = 56; // Width of pitch labels gutter
    this.topGutter = 40;  // Width of chord header

    // Interactive MIDI Editing State
    this.currentTool = 'draw'; // 'draw', 'select', 'erase'
    this.snap = 0.5; // Snap grid in beats (0.25 = 16th, 0.5 = 8th, 1.0 = quarter)
    this.isMouseDown = false;
    this.isDraggingNote = false;
    this.isResizingNote = false;
    this.isRightClickSwiping = false;

    // Selection State (Ctrl + Drag Marquee & Multi-drag)
    this.selectedIndices = new Set();
    this.isMarqueeSelecting = false;
    this.marqueeStart = { x: 0, y: 0 };
    this.marqueeCurrent = { x: 0, y: 0 };

    this.activeNoteIndex = -1;
    this.dragStartMusical = { beat: 0, pitch: 60 };
    this.multiDragInitial = new Map(); // index -> { startBeat, pitch }

    // Callbacks
    this.onSeek = options.onSeek || null;
    this.onNotePreview = options.onNotePreview || null;
    this.onCompositionChange = options.onCompositionChange || null;

    this._setupEvents();
    this.resize();
  }

  setTool(tool) {
    this.currentTool = tool;
    this.draw();
  }

  setSnap(snapVal) {
    this.snap = parseFloat(snapVal) || 0.5;
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = Math.max(380, rect.height);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
    this.draw();
  }

  setComposition(comp) {
    this.composition = comp;
    this.selectedIndices.clear();
    if (comp && comp.melodyNotes && comp.melodyNotes.length > 0) {
      const pitches = comp.melodyNotes.map(n => n.pitch);
      this.minPitch = Math.max(36, Math.min(...pitches) - 3);
      this.maxPitch = Math.min(96, Math.max(...pitches) + 3);
    }
    this.draw();
  }

  setPlayhead(beat) {
    this.currentBeat = beat;
    this.draw();
  }

  snapBeat(beat) {
    return Math.round(beat / this.snap) * this.snap;
  }

  _screenToMusical(x, y) {
    if (!this.composition) return { beat: 0, rawBeat: 0, pitch: 60 };

    const gridW = this.width - this.leftGutter;
    const gridH = this.height - this.topGutter;
    const totalBeats = (this.composition.totalBars || 8) * 4;
    const beatW = gridW / totalBeats;
    const pitchCount = this.maxPitch - this.minPitch + 1;
    const pitchH = gridH / pitchCount;

    const rawBeat = Math.max(0, (x - this.leftGutter) / beatW);
    const snappedBeat = this.snapBeat(rawBeat);

    const pitchOffset = Math.floor((y - this.topGutter) / pitchH);
    const pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.maxPitch - pitchOffset));

    return { beat: snappedBeat, rawBeat, pitch };
  }

  _findNoteAt(x, y) {
    if (!this.composition || !this.composition.melodyNotes) return null;

    const gridW = this.width - this.leftGutter;
    const gridH = this.height - this.topGutter;
    const totalBeats = (this.composition.totalBars || 8) * 4;
    const beatW = gridW / totalBeats;
    const pitchCount = this.maxPitch - this.minPitch + 1;
    const pitchH = gridH / pitchCount;

    for (let i = this.composition.melodyNotes.length - 1; i >= 0; i--) {
      const note = this.composition.melodyNotes[i];
      const nx = this.leftGutter + note.startBeat * beatW;
      const nw = Math.max(6, note.durationBeats * beatW - 2);
      const ny = this.topGutter + (this.maxPitch - note.pitch) * pitchH + 1;
      const nh = Math.max(4, pitchH - 2);

      if (x >= nx && x <= nx + nw && y >= ny && y <= ny + nh) {
        const isRightEdge = (x >= nx + nw - 8 && x <= nx + nw + 3);
        return { index: i, note, nx, nw, ny, nh, isRightEdge };
      }
    }
    return null;
  }

  deleteSelectedNotes() {
    if (!this.composition || !this.composition.melodyNotes || this.selectedIndices.size === 0) return;

    this.composition.melodyNotes = this.composition.melodyNotes.filter((_, idx) => !this.selectedIndices.has(idx));
    this.selectedIndices.clear();
    this.hoveredNote = null;
    this.draw();
    if (this.onCompositionChange) this.onCompositionChange(this.composition);
  }

  _setupEvents() {
    window.addEventListener('resize', () => this.resize());

    // Prevent default browser context menu completely
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 1. Scrub playhead on top chord header
      if (y < this.topGutter && x >= this.leftGutter && this.composition) {
        const { rawBeat } = this._screenToMusical(x, y);
        if (this.onSeek) this.onSeek(rawBeat);
        return;
      }

      if (x < this.leftGutter || !this.composition) return;

      const hit = this._findNoteAt(x, y);

      // 2. RIGHT CLICK: Instant Erase / Swipe Erase
      if (e.button === 2) {
        this.isRightClickSwiping = true;
        if (hit) {
          this.composition.melodyNotes.splice(hit.index, 1);
          this.selectedIndices.delete(hit.index);
          this.hoveredNote = null;
          this.draw();
          if (this.onCompositionChange) this.onCompositionChange(this.composition);
        }
        return;
      }

      // Left click
      if (e.button === 0) {
        this.isMouseDown = true;

        // 3. CTRL KEY: Marquee selection or toggle select
        if (e.ctrlKey || e.metaKey) {
          if (hit) {
            // Toggle single note in selection
            if (this.selectedIndices.has(hit.index)) {
              this.selectedIndices.delete(hit.index);
            } else {
              this.selectedIndices.add(hit.index);
            }
            this.draw();
          } else {
            // Start Marquee Box Selection!
            this.isMarqueeSelecting = true;
            this.marqueeStart = { x, y };
            this.marqueeCurrent = { x, y };
            this.selectedIndices.clear();
            this.draw();
          }
          return;
        }

        // 4. Eraser tool
        if (this.currentTool === 'erase') {
          if (hit) {
            this.composition.melodyNotes.splice(hit.index, 1);
            this.selectedIndices.delete(hit.index);
            this.hoveredNote = null;
            this.draw();
            if (this.onCompositionChange) this.onCompositionChange(this.composition);
          }
          return;
        }

        // 5. Click on existing note
        if (hit) {
          if (hit.isRightEdge || (this.currentTool === 'select' && hit.isRightEdge)) {
            // Resize single note
            this.activeNoteIndex = hit.index;
            this.isResizingNote = true;
          } else {
            // Drag note (or multi-drag if multiple notes are selected)
            if (!this.selectedIndices.has(hit.index)) {
              this.selectedIndices.clear();
              this.selectedIndices.add(hit.index);
            }

            this.activeNoteIndex = hit.index;
            this.isDraggingNote = true;

            const { beat, pitch } = this._screenToMusical(x, y);
            this.dragStartMusical = { beat: hit.note.startBeat, pitch: hit.note.pitch };

            // Store initial positions for all selected notes
            this.multiDragInitial.clear();
            this.selectedIndices.forEach(idx => {
              const n = this.composition.melodyNotes[idx];
              if (n) this.multiDragInitial.set(idx, { startBeat: n.startBeat, pitch: n.pitch });
            });

            if (this.onNotePreview) this.onNotePreview(hit.note.pitch);
          }
          this.draw();
          return;
        }

        // 6. Click on empty space: clear selection & CREATE NEW BLOCK in 'draw' or 'select' mode
        this.selectedIndices.clear();

        if (this.currentTool === 'draw' || this.currentTool === 'select') {
          const { beat, pitch } = this._screenToMusical(x, y);
          const role = analyzeNoteRole(pitch, beat, this.composition.chords, this.composition.keyRoot, this.composition.scalePcs);

          const newNote = {
            pitch,
            startBeat: beat,
            durationBeats: this.snap,
            velocity: 95,
            role,
            noteName: midiToNoteName(pitch)
          };

          if (!this.composition.melodyNotes) this.composition.melodyNotes = [];
          this.composition.melodyNotes.push(newNote);
          const newIdx = this.composition.melodyNotes.length - 1;
          this.activeNoteIndex = newIdx;
          this.selectedIndices.add(newIdx);
          this.isResizingNote = true; // Dragging immediately stretches duration

          if (this.onNotePreview) this.onNotePreview(pitch);
          this.draw();
          if (this.onCompositionChange) this.onCompositionChange(this.composition);
        }
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Swipe erase with right click
      if (this.isRightClickSwiping) {
        const hit = this._findNoteAt(x, y);
        if (hit && this.composition && this.composition.melodyNotes) {
          this.composition.melodyNotes.splice(hit.index, 1);
          this.selectedIndices.delete(hit.index);
          this.hoveredNote = null;
          this.draw();
          if (this.onCompositionChange) this.onCompositionChange(this.composition);
        }
        return;
      }

      // Marquee Box Selection
      if (this.isMarqueeSelecting) {
        this.marqueeCurrent = { x, y };
        this._updateMarqueeSelection();
        this.draw();
        return;
      }

      // Resizing note
      if (this.isMouseDown && this.isResizingNote && this.activeNoteIndex !== -1 && this.composition) {
        const note = this.composition.melodyNotes[this.activeNoteIndex];
        if (note) {
          const { beat } = this._screenToMusical(x, y);
          const newDur = Math.max(this.snap, this.snapBeat(beat - note.startBeat + this.snap));
          note.durationBeats = newDur;
          this.draw();
        }
        return;
      }

      // Multi-drag moving selected notes
      if (this.isMouseDown && this.isDraggingNote && this.activeNoteIndex !== -1 && this.composition) {
        const { beat, pitch } = this._screenToMusical(x, y);
        const anchorInitial = this.multiDragInitial.get(this.activeNoteIndex);

        if (anchorInitial) {
          const deltaBeats = this.snapBeat(beat - anchorInitial.startBeat);
          const deltaPitch = pitch - anchorInitial.pitch;
          const totalBeats = (this.composition.totalBars || 8) * 4;

          this.selectedIndices.forEach(idx => {
            const init = this.multiDragInitial.get(idx);
            const n = this.composition.melodyNotes[idx];
            if (init && n) {
              n.startBeat = Math.max(0, Math.min(totalBeats - n.durationBeats, init.startBeat + deltaBeats));
              const newPitch = Math.max(this.minPitch, Math.min(this.maxPitch, init.pitch + deltaPitch));
              if (newPitch !== n.pitch) {
                n.pitch = newPitch;
                n.noteName = midiToNoteName(newPitch);
                n.role = analyzeNoteRole(newPitch, n.startBeat, this.composition.chords, this.composition.keyRoot, this.composition.scalePcs);
              }
            }
          });

          // Play preview if anchor pitch moved
          const anchorNote = this.composition.melodyNotes[this.activeNoteIndex];
          if (anchorNote && anchorNote.pitch !== this.lastPreviewPitch) {
            this.lastPreviewPitch = anchorNote.pitch;
            if (this.onNotePreview) this.onNotePreview(anchorNote.pitch);
          }

          this.draw();
        }
        return;
      }

      // Update Cursor & Hover
      this._updateCursorAndHover(x, y);
    });

    const finishInteraction = () => {
      this.isRightClickSwiping = false;

      if (this.isMarqueeSelecting) {
        this.isMarqueeSelecting = false;
        this.draw();
      }

      if (this.isMouseDown) {
        this.isMouseDown = false;
        if (this.isDraggingNote || this.isResizingNote) {
          this.isDraggingNote = false;
          this.isResizingNote = false;
          this.activeNoteIndex = -1;
          this.multiDragInitial.clear();
          this.lastPreviewPitch = null;

          if (this.composition && this.composition.melodyNotes) {
            this.composition.melodyNotes.sort((a, b) => a.startBeat - b.startBeat);
            if (this.onCompositionChange) this.onCompositionChange(this.composition);
          }
          this.draw();
        }
      }
    };

    window.addEventListener('mouseup', finishInteraction);
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredNote = null;
      if (!this.isMouseDown && !this.isRightClickSwiping) this.draw();
    });
  }

  _updateMarqueeSelection() {
    if (!this.composition || !this.composition.melodyNotes) return;

    const x1 = Math.min(this.marqueeStart.x, this.marqueeCurrent.x);
    const x2 = Math.max(this.marqueeStart.x, this.marqueeCurrent.x);
    const y1 = Math.min(this.marqueeStart.y, this.marqueeCurrent.y);
    const y2 = Math.max(this.marqueeStart.y, this.marqueeCurrent.y);

    const gridW = this.width - this.leftGutter;
    const gridH = this.height - this.topGutter;
    const totalBeats = (this.composition.totalBars || 8) * 4;
    const beatW = gridW / totalBeats;
    const pitchCount = this.maxPitch - this.minPitch + 1;
    const pitchH = gridH / pitchCount;

    this.selectedIndices.clear();

    this.composition.melodyNotes.forEach((note, idx) => {
      const nx = this.leftGutter + note.startBeat * beatW;
      const nw = Math.max(6, note.durationBeats * beatW - 2);
      const ny = this.topGutter + (this.maxPitch - note.pitch) * pitchH + 1;
      const nh = Math.max(4, pitchH - 2);

      // Check intersection
      const intersects = (nx <= x2 && nx + nw >= x1 && ny <= y2 && ny + nh >= y1);
      if (intersects) {
        this.selectedIndices.add(idx);
      }
    });
  }

  _updateCursorAndHover(x, y) {
    if (x < this.leftGutter || y < this.topGutter) {
      this.canvas.style.cursor = 'default';
      this.hoveredNote = null;
      return;
    }

    const hit = this._findNoteAt(x, y);

    if (this.currentTool === 'erase') {
      this.canvas.style.cursor = hit ? 'pointer' : 'not-allowed';
      this.hoveredNote = hit;
      this.draw();
      return;
    }

    if (hit) {
      if (hit.isRightEdge) {
        this.canvas.style.cursor = 'ew-resize';
      } else {
        this.canvas.style.cursor = 'grab';
      }
      this.hoveredNote = hit;
    } else {
      this.canvas.style.cursor = this.currentTool === 'draw' ? 'crosshair' : 'default';
      this.hoveredNote = null;
    }
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, w, h);

    if (!this.composition) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kliknij "Generuj Melodię" lub postaw własne klocki MIDI...', w / 2, h / 2);
      return;
    }

    const gridW = w - this.leftGutter;
    const gridH = h - this.topGutter;
    const totalBars = this.composition.totalBars || 8;
    const totalBeats = totalBars * 4;
    const beatW = gridW / totalBeats;
    const barW = beatW * 4;

    const pitchCount = this.maxPitch - this.minPitch + 1;
    const pitchH = gridH / pitchCount;

    const scalePcs = this.composition.scalePcs || [];

    // 1. Draw Pitch Rows with Scale Tone Highlights
    for (let p = this.minPitch; p <= this.maxPitch; p++) {
      const y = this.topGutter + (this.maxPitch - p) * pitchH;
      const pc = p % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(pc);
      const isScaleTone = scalePcs.includes(pc);

      if (isScaleTone) {
        ctx.fillStyle = isBlack ? '#171d30' : '#1c2238';
      } else {
        ctx.fillStyle = isBlack ? '#0c0f18' : '#121624';
      }
      ctx.fillRect(this.leftGutter, y, gridW, pitchH);

      ctx.strokeStyle = isScaleTone ? '#2a3454' : '#181d2e';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.leftGutter, y + pitchH);
      ctx.lineTo(w, y + pitchH);
      ctx.stroke();

      // Piano Key in Gutter
      ctx.fillStyle = isBlack ? '#0a0d15' : '#22293f';
      ctx.fillRect(0, y, this.leftGutter, pitchH);

      if (isScaleTone) {
        ctx.fillStyle = (pc === this.composition.keyRoot) ? '#00e5ff' : '#6366f1';
        ctx.fillRect(this.leftGutter - 4, y + 2, 3, pitchH - 4);
      }

      ctx.strokeStyle = '#27304b';
      ctx.strokeRect(0, y, this.leftGutter, pitchH);

      const noteStr = midiToNoteName(p);
      ctx.fillStyle = isScaleTone ? '#ffffff' : (isBlack ? '#5f6c8d' : '#8c9ab8');
      ctx.font = `${Math.max(9, Math.min(12, pitchH * 0.72))}px "Fira Code", monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(noteStr, this.leftGutter - 8, y + pitchH * 0.72);
    }

    // 2. Phrase Boundaries
    const midBarX = this.leftGutter + (totalBars / 2) * barW;
    ctx.fillStyle = 'rgba(0, 229, 255, 0.03)';
    ctx.fillRect(this.leftGutter, this.topGutter, midBarX - this.leftGutter, gridH);
    ctx.fillStyle = 'rgba(247, 37, 133, 0.03)';
    ctx.fillRect(midBarX, this.topGutter, w - midBarX, gridH);

    // 3. Sub-beat & Bar Lines
    const stepBeats = Math.max(0.25, this.snap);
    for (let b = 0; b <= totalBeats; b += stepBeats) {
      const x = this.leftGutter + b * beatW;
      const isBar = (b % 4 === 0);
      const isBeat = (b % 1 === 0);

      ctx.strokeStyle = isBar ? '#434f75' : (isBeat ? '#252d47' : '#171d30');
      ctx.lineWidth = isBar ? 1.6 : (isBeat ? 0.8 : 0.4);
      ctx.beginPath();
      ctx.moveTo(x, this.topGutter);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // 4. Top Chord & Bar Header
    ctx.fillStyle = '#0f1424';
    ctx.fillRect(0, 0, w, this.topGutter);
    ctx.strokeStyle = '#2d3756';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.topGutter);
    ctx.lineTo(w, this.topGutter);
    ctx.stroke();

    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'left';
    ctx.fillText('FRAZA A: POPRZEDNIK (PYTANIE)', this.leftGutter + 8, 14);

    ctx.fillStyle = '#f72585';
    ctx.fillText('FRAZA B: NASTĘPNIK (ODPOWIEDŹ)', midBarX + 8, 14);

    if (this.composition.chords) {
      let chordBeat = 0;
      for (const chord of this.composition.chords) {
        const cx = this.leftGutter + chordBeat * beatW;
        const cw = chord.durationBeats * beatW;

        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chord.name, cx + cw / 2, 30);

        ctx.fillStyle = '#818cf8';
        ctx.font = '10px "Inter", sans-serif';
        ctx.fillText(`(${chord.roman})`, cx + cw / 2 + 28, 30);

        chordBeat += chord.durationBeats;
      }
    }

    // 5. Harmony Chords
    if (this.composition.chordNotes) {
      this.composition.chordNotes.forEach(cn => {
        if (cn.pitch >= this.minPitch && cn.pitch <= this.maxPitch) {
          const nx = this.leftGutter + cn.startBeat * beatW;
          const nw = cn.durationBeats * beatW - 2;
          const ny = this.topGutter + (this.maxPitch - cn.pitch) * pitchH + 1;
          const nh = pitchH - 2;

          ctx.fillStyle = 'rgba(129, 140, 248, 0.12)';
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.28)';
          ctx.lineWidth = 0.8;
          this._roundRect(ctx, nx, ny, nw, nh, 3);
          ctx.fill();
          ctx.stroke();
        }
      });
    }

    // 6. Draw Melody Notes (Interactive MIDI Blocks)
    if (this.composition.melodyNotes) {
      this.composition.melodyNotes.forEach((n, idx) => {
        const nx = this.leftGutter + n.startBeat * beatW;
        const nw = Math.max(6, n.durationBeats * beatW - 2);
        const ny = this.topGutter + (this.maxPitch - n.pitch) * pitchH + 1;
        const nh = Math.max(4, pitchH - 2);

        const colorCfg = ROLE_COLORS[n.role] || ROLE_COLORS.chord_tone;
        const isActive = (this.currentBeat >= n.startBeat && this.currentBeat < n.startBeat + n.durationBeats);
        const isHovered = (this.hoveredNote && this.hoveredNote.index === idx);
        const isSelected = this.selectedIndices.has(idx);

        ctx.save();
        if (isActive) {
          ctx.shadowColor = colorCfg.fill;
          ctx.shadowBlur = 16;
        } else if (isSelected) {
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = isActive ? '#ffffff' : (isSelected ? '#fff' : colorCfg.fill);
        ctx.strokeStyle = isSelected ? '#00e5ff' : (isHovered ? '#ffffff' : colorCfg.stroke);
        ctx.lineWidth = isSelected ? 2.5 : (isHovered ? 2.0 : 1.2);

        this._roundRect(ctx, nx, ny, nw, nh, 4);
        ctx.fill();
        ctx.stroke();

        // Right Edge Resize Handle Indicator
        ctx.fillStyle = isHovered || isSelected ? 'rgba(0, 229, 255, 0.8)' : 'rgba(0,0,0,0.35)';
        ctx.fillRect(nx + nw - 4, ny + 2, 2, nh - 4);

        if (nw > 20 && nh > 10) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = isActive || isSelected ? '#000000' : '#0a0d16';
          ctx.font = `bold ${Math.max(9, Math.min(11, nh * 0.72))}px "Inter", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(n.noteName, nx + nw / 2 - 2, ny + nh * 0.72);
        }
        ctx.restore();
      });
    }

    // 7. Draw Marquee Selection Box (Ctrl + Drag)
    if (this.isMarqueeSelecting) {
      const mx1 = Math.min(this.marqueeStart.x, this.marqueeCurrent.x);
      const mx2 = Math.max(this.marqueeStart.x, this.marqueeCurrent.x);
      const my1 = Math.min(this.marqueeStart.y, this.marqueeCurrent.y);
      const my2 = Math.max(this.marqueeStart.y, this.marqueeCurrent.y);
      const mw = mx2 - mx1;
      const mh = my2 - my1;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.fillRect(mx1, my1, mw, mh);
      ctx.strokeRect(mx1, my1, mw, mh);
      ctx.restore();
    }

    // 8. Draw Playhead
    const playheadX = this.leftGutter + this.currentBeat * beatW;
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 9. Hover Tooltip
    if (this.hoveredNote && !this.isMouseDown && !this.isMarqueeSelecting) {
      this._drawTooltip(ctx, this.hoveredNote);
    }
  }

  _drawTooltip(ctx, hoverData) {
    const { note, nx, nw, ny } = hoverData;
    const colorCfg = ROLE_COLORS[note.role] || ROLE_COLORS.chord_tone;

    const line1 = `Klocek: ${note.noteName} (MIDI ${note.pitch})`;
    const line2 = `Rola: ${colorCfg.label}`;
    const line3 = `Takt ${(note.startBeat / 4 + 1).toFixed(2)} | Trwanie: ${note.durationBeats.toFixed(2)} uderz.`;

    ctx.font = '11px "Inter", sans-serif';
    const textW = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width, ctx.measureText(line3).width) + 24;
    const tooltipH = 68;

    let tx = nx + nw / 2 - textW / 2;
    let ty = ny - tooltipH - 10;
    if (tx < this.leftGutter) tx = this.leftGutter + 4;
    if (tx + textW > this.width) tx = this.width - textW - 8;
    if (ty < this.topGutter) ty = ny + 26;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.strokeStyle = colorCfg.fill;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;

    this._roundRect(ctx, tx, ty, textW, tooltipH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(line1, tx + 12, ty + 18);

    ctx.fillStyle = colorCfg.fill;
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText(line2, tx + 12, ty + 36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillText(line3, tx + 12, ty + 54);

    ctx.restore();
  }

  _roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
