/**
 * Harmonic Forge - Enhanced Polyphonic Web Audio Engine V2.3
 * Features:
 * - 8 Lead Melody Instruments: Grand Piano, Rhodes MK I, Moog Saw Lead, 8-Bit Chiptune,
 *   Crystal Marimba/Pluck, Jazzy Vibraphone, Ethereal Flute, Acoustic Nylon Guitar.
 * - 6 Harmony Pad Instruments: Warm Analog Pad, Shimmer Pad, Symphonic Strings,
 *   80s Synth Brass, Church Pipe Organ, Lo-Fi Electric Chords.
 * - 6 Bassline Instruments: Moog Funk Bass, Deep Sub Bass, Acoustic Upright Bass,
 *   Picked Electric Bass, Acid 303 Bass, 808 Boom Bass.
 * - Dynamic preview for all instruments, full voice cancellation, zero click/bleed.
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.delayNode = null;
    this.delayGain = null;
    this.compressor = null;

    this.isPlaying = false;
    this.isPaused = false;
    this.currentBeat = 0;
    this.totalBeats = 32;
    this.bpm = 120;
    this.loop = true;

    // Selected Instrument Presets
    this.soundPreset = 'piano';         // Lead instrument
    this.padPreset = 'warm_analog';     // Harmony pad instrument
    this.bassPreset = 'moog';           // Bassline instrument

    this.enableMelody = true;
    this.enableChords = true;
    this.enableBass = true;

    // Registry of all scheduled Web Audio nodes to allow instantaneous stop & pause
    this.scheduledOscs = [];
    this.scheduledGains = [];

    this.timerId = null;
    this.startTime = 0;
    this.pausedAtBeat = 0;
    this.composition = null;

    this.onBeatUpdate = null;
    this.onPlaybackEnd = null;
  }

  init() {
    if (this.ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Compressor / Limiter
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    // Reverb using synthetic impulse response
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this._buildImpulseResponse(2.2, 2.0);

    const reverbGain = this.ctx.createGain();
    reverbGain.gain.setValueAtTime(0.24, this.ctx.currentTime);
    this.reverbNode.connect(reverbGain);
    reverbGain.connect(this.compressor);

    // Stereo Delay
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.28, this.ctx.currentTime);
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    const delayFeedback = this.ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.30, this.ctx.currentTime);

    this.delayNode.connect(delayFeedback);
    delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.compressor);

    // Routing
    this.masterGain.connect(this.compressor);
    this.masterGain.connect(this.reverbNode);
    this.masterGain.connect(this.delayNode);

    this.compressor.connect(this.ctx.destination);
  }

  _buildImpulseResponse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = (1 - i / length) ** decay;
      left[i] = (Math.random() * 2 - 1) * n;
      right[i] = (Math.random() * 2 - 1) * n;
    }
    return impulse;
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  _registerOsc(osc) {
    this.scheduledOscs.push(osc);
  }

  _registerGain(gain) {
    this.scheduledGains.push(gain);
  }

  _stopAllNodes() {
    if (this.scheduledOscs && this.scheduledOscs.length > 0) {
      for (const osc of this.scheduledOscs) {
        try {
          osc.stop(0);
          osc.disconnect();
        } catch (e) {}
      }
      this.scheduledOscs = [];
    }

    if (this.scheduledGains && this.scheduledGains.length > 0) {
      for (const g of this.scheduledGains) {
        try {
          g.disconnect();
        } catch (e) {}
      }
      this.scheduledGains = [];
    }
  }

  previewNote(pitch, duration = 0.35, velocity = 95) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx) {
      this.playNote(pitch, this.ctx.currentTime, duration, velocity, 'melody');
    }
  }

  previewLead(leadType = null) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx) {
      const saved = this.soundPreset;
      if (leadType) this.soundPreset = leadType;
      const t = this.ctx.currentTime;
      // Play a quick 3-note melodic motif preview: C5 -> E5 -> G5
      this.playNote(72, t, 0.22, 95, 'melody');
      this.playNote(76, t + 0.14, 0.22, 95, 'melody');
      this.playNote(79, t + 0.28, 0.45, 100, 'melody');
      this.soundPreset = saved;
    }
  }

  previewPad(padType = null) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx) {
      const saved = this.padPreset;
      if (padType) this.padPreset = padType;
      const t = this.ctx.currentTime;
      // Play a lush Cmaj chord preview
      [60, 64, 67, 71].forEach(p => {
        this.playNote(p, t, 1.2, 85, 'chord');
      });
      this.padPreset = saved;
    }
  }

  previewBass(bassType = null) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx) {
      const saved = this.bassPreset;
      if (bassType) this.bassPreset = bassType;
      const t = this.ctx.currentTime;
      this.playNote(36, t, 0.6, 95, 'bass');
      this.bassPreset = saved;
    }
  }

  playNote(pitch, time, duration, velocity = 90, type = 'melody') {
    if (!this.ctx) return;
    const freq = this.midiToFreq(pitch);
    const velNorm = (velocity / 127);

    if (type === 'melody') {
      this._playMelodyPreset(freq, time, duration, velNorm);
    } else if (type === 'chord') {
      this._playChordPad(freq, time, duration, velNorm);
    } else if (type === 'bass') {
      this._playBassVoice(freq, time, duration, velNorm);
    }
  }

  // =========================================================================
  // LEAD INSTRUMENTS (8 BARW)
  // =========================================================================
  _playMelodyPreset(freq, time, duration, vel) {
    const ctx = this.ctx;

    if (this.soundPreset === 'piano') {
      // Warm Concert Grand Piano
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq, time);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 2, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(6500, freq * 4.5), time);
      filter.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.2), time + duration);

      const noteGain = vel * 0.45;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(noteGain, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(noteGain * 0.4, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.15);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(time);
      osc2.start(time);
      osc3.start(time);
      osc1.stop(time + duration + 0.2);
      osc2.stop(time + duration + 0.2);
      osc3.stop(time + duration + 0.2);

      this._registerOsc(osc1); this._registerOsc(osc2); this._registerOsc(osc3);
      this._registerGain(gain);

    } else if (this.soundPreset === 'rhodes') {
      // Neo-Soul FM Rhodes MK I
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const mainGain = ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, time);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 2, time);

      modGain.gain.setValueAtTime(freq * 1.6 * vel, time);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.05, time + duration * 0.8);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      const peakGain = vel * 0.4;
      mainGain.gain.setValueAtTime(0.0001, time);
      mainGain.gain.linearRampToValueAtTime(peakGain, time + 0.015);
      mainGain.gain.exponentialRampToValueAtTime(peakGain * 0.5, time + 0.4);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

      carrier.connect(mainGain);
      mainGain.connect(this.masterGain);

      carrier.start(time); modulator.start(time);
      carrier.stop(time + duration + 0.25); modulator.stop(time + duration + 0.25);

      this._registerOsc(carrier); this._registerOsc(modulator);
      this._registerGain(mainGain); this._registerGain(modGain);

    } else if (this.soundPreset === 'synth_lead') {
      // Moog 80s Sawtooth Lead with 24dB Resonant Filter Sweep
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, time);
      osc1.detune.setValueAtTime(-8, time);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq, time);
      osc2.detune.setValueAtTime(8, time);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(5.0, time);
      filter.frequency.setValueAtTime(freq * 1.2, time);
      filter.frequency.linearRampToValueAtTime(freq * 5.2, time + 0.08);
      filter.frequency.exponentialRampToValueAtTime(freq * 2.0, time + duration);

      const peak = vel * 0.35;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);

      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.25); osc2.stop(time + duration + 0.25);

      this._registerOsc(osc1); this._registerOsc(osc2);
      this._registerGain(gain);

    } else if (this.soundPreset === 'chiptune') {
      // 8-Bit Retro Arcade Square Lead
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      const peak = vel * 0.25;
      gain.gain.setValueAtTime(peak, time);
      gain.gain.setValueAtTime(peak * 0.8, time + duration * 0.8);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration + 0.05);

      this._registerOsc(osc);
      this._registerGain(gain);

    } else if (this.soundPreset === 'vibraphone') {
      // Jazzy Vibraphone with Tremolo LFO
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 3.98, time); // Metallic modal overtone

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(5.5, time); // 5.5 Hz tremolo
      lfoGain.gain.setValueAtTime(0.15, time);
      lfo.connect(lfoGain);

      const peak = vel * 0.45;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(peak * 0.35, time + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.3);

      lfoGain.connect(gain.gain);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time); overtone.start(time); lfo.start(time);
      osc.stop(time + duration + 0.35); overtone.stop(time + duration + 0.35); lfo.stop(time + duration + 0.35);

      this._registerOsc(osc); this._registerOsc(overtone); this._registerOsc(lfo);
      this._registerGain(gain);

    } else if (this.soundPreset === 'flute') {
      // Ethereal Soft Flute / Woodwind
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.0, time);

      const peak = vel * 0.40;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.06); // Breath attack
      gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration + 0.2);

      this._registerOsc(osc);
      this._registerGain(gain);

    } else if (this.soundPreset === 'guitar') {
      // Acoustic Nylon Guitar Pluck
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(5000, freq * 3.5), time);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.1, time + duration * 0.8);

      const peak = vel * 0.50;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration + 0.15);

      this._registerOsc(osc);
      this._registerGain(gain);

    } else {
      // Crystal Marimba / Pluck
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const peak = vel * 0.5;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.8));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + Math.min(duration, 0.8) + 0.05);

      this._registerOsc(osc);
      this._registerGain(gain);
    }
  }

  // =========================================================================
  // HARMONY PAD INSTRUMENTS (6 BARW)
  // =========================================================================
  _playChordPad(freq, time, duration, vel) {
    const ctx = this.ctx;

    if (this.padPreset === 'shimmer') {
      // Ethereal Shimmer Pad (Airy octaves with deep reverb)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, time); // High octave shimmer

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(350, time);

      const padVol = vel * 0.14;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.25);
      gain.gain.setValueAtTime(padVol * 0.9, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.5);

      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);

      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.55); osc2.stop(time + duration + 0.55);

      this._registerOsc(osc1); this._registerOsc(osc2);
      this._registerGain(gain);

    } else if (this.padPreset === 'strings') {
      // Symphonic Strings (Slow attack lush saw ensemble)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, time);
      osc1.detune.setValueAtTime(-10, time);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq, time);
      osc2.detune.setValueAtTime(10, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, time);

      const padVol = vel * 0.12;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.35); // Slow string bow attack
      gain.gain.setValueAtTime(padVol * 0.95, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.6);

      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);

      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.65); osc2.stop(time + duration + 0.65);

      this._registerOsc(osc1); this._registerOsc(osc2);
      this._registerGain(gain);

    } else if (this.padPreset === 'brass') {
      // 80s Poly Synth Brass
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(3.0, time);
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.linearRampToValueAtTime(2800, time + 0.08); // Brass punch opening
      filter.frequency.exponentialRampToValueAtTime(1200, time + duration);

      const padVol = vel * 0.18;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.3);

      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.35);

      this._registerOsc(osc); this._registerGain(gain);

    } else if (this.padPreset === 'organ') {
      // Church Pipe Organ (Harmonic drawbar additive)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine'; osc1.frequency.setValueAtTime(freq, time); // 8'
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq * 2, time); // 4'
      osc3.type = 'sine'; osc3.frequency.setValueAtTime(freq * 3, time); // 2 2/3'

      const padVol = vel * 0.15;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.04);
      gain.gain.setValueAtTime(padVol, time + duration * 0.85);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.2);

      osc1.connect(gain); osc2.connect(gain); osc3.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(time); osc2.start(time); osc3.start(time);
      osc1.stop(time + duration + 0.25); osc2.stop(time + duration + 0.25); osc3.stop(time + duration + 0.25);

      this._registerOsc(osc1); this._registerOsc(osc2); this._registerOsc(osc3);
      this._registerGain(gain);

    } else if (this.padPreset === 'lofi') {
      // Lo-Fi Warm Electric Chords with filter cutoff
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, time); // Lo-fi muffling

      const padVol = vel * 0.18;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.25);

      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.3);

      this._registerOsc(osc); this._registerGain(gain);

    } else {
      // Default: Warm Analog Synth Pad
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, time);
      osc1.detune.setValueAtTime(-5, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq, time);
      osc2.detune.setValueAtTime(5, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);

      const padVol = vel * 0.16;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.15);
      gain.gain.setValueAtTime(padVol * 0.9, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.4);

      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);

      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.45); osc2.stop(time + duration + 0.45);

      this._registerOsc(osc1); this._registerOsc(osc2);
      this._registerGain(gain);
    }
  }

  // =========================================================================
  // BASSLINE INSTRUMENTS (6 BARW)
  // =========================================================================
  _playBassVoice(freq, time, duration, vel) {
    const ctx = this.ctx;

    if (this.bassPreset === 'sub') {
      // Deep Sub Bass (Pure sine wave power)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const bassVol = vel * 0.48;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.03);
      gain.gain.setValueAtTime(bassVol * 0.9, time + duration * 0.8);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.1);

      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);

      this._registerOsc(osc); this._registerGain(gain);

    } else if (this.bassPreset === 'upright') {
      // Acoustic Upright / Walking Double Bass
      const osc = ctx.createOscillator();
      const body = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      body.type = 'bandpass';
      body.frequency.setValueAtTime(220, time); // Wooden acoustic body resonance
      body.Q.setValueAtTime(1.5, time);

      const bassVol = vel * 0.45;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(bassVol * 0.4, time + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);

      osc.connect(body); body.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);

      this._registerOsc(osc); this._registerGain(gain);

    } else if (this.bassPreset === 'picked') {
      // Bright Picked / Slap Electric Bass
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, time);
      filter.frequency.exponentialRampToValueAtTime(450, time + 0.15); // Pick snap

      const bassVol = vel * 0.38;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);

      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);

      this._registerOsc(osc); this._registerGain(gain);

    } else if (this.bassPreset === 'acid') {
      // Acid 303 Resonant Bassline
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(9.5, time); // High resonance squeal
      filter.frequency.setValueAtTime(freq * 6.0, time);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.2);

      const bassVol = vel * 0.35;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);

      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);

      this._registerOsc(osc); this._registerGain(gain);

    } else if (this.bassPreset === 'boom808') {
      // 808 Trap Boom Bass (Pitch drop sub)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2.2, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.06); // 808 pitch glide

      const bassVol = vel * 0.52;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(bassVol * 0.7, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.25);

      this._registerOsc(osc); this._registerGain(gain);

    } else {
      // Default: Moog Funk Synth Bass
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, time);

      const bassVol = vel * 0.38;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(bassVol * 0.6, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);

      osc.connect(filter); sub.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);

      osc.start(time); sub.start(time);
      osc.stop(time + duration + 0.15); sub.stop(time + duration + 0.15);

      this._registerOsc(osc); this._registerOsc(sub);
      this._registerGain(gain);
    }
  }

  playComposition(composition, fromBeat = 0, loop = true) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
    this._stopAllNodes();

    this.isPlaying = true;
    this.isPaused = false;
    this.loop = loop;
    this.composition = composition;
    this.bpm = composition.bpm || 120;
    this.totalBeats = (composition.totalBars || 8) * 4;

    const secondsPerBeat = 60 / this.bpm;
    this.startTime = this.ctx.currentTime - (fromBeat * secondsPerBeat);
    this.pausedAtBeat = fromBeat;

    this._scheduleNotes(fromBeat);
    this._startProgressTracker();
  }

  _scheduleNotes(startBeatOffset) {
    const secondsPerBeat = 60 / this.bpm;
    const now = this.ctx.currentTime;

    const scheduleTrack = (notes, type) => {
      if (!notes) return;
      notes.forEach(note => {
        if (note.startBeat >= startBeatOffset) {
          const noteStartSec = (note.startBeat - startBeatOffset) * secondsPerBeat;
          const noteTime = now + noteStartSec;
          const noteDurSec = note.durationBeats * secondsPerBeat;
          this.playNote(note.pitch, noteTime, noteDurSec, note.velocity, type);
        }
      });
    };

    if (this.enableMelody) scheduleTrack(this.composition.melodyNotes, 'melody');
    if (this.enableChords) scheduleTrack(this.composition.chordNotes, 'chord');
    if (this.enableBass) scheduleTrack(this.composition.bassNotes, 'bass');
  }

  _startProgressTracker() {
    const secondsPerBeat = 60 / this.bpm;

    const update = () => {
      if (!this.isPlaying || this.isPaused) return;

      const elapsedSec = this.ctx.currentTime - this.startTime;
      const beat = elapsedSec / secondsPerBeat;

      if (beat >= this.totalBeats) {
        if (this.loop) {
          this.playComposition(this.composition, 0, true);
          return;
        } else {
          this.stop();
          if (this.onPlaybackEnd) this.onPlaybackEnd();
          return;
        }
      }

      this.currentBeat = beat;
      if (this.onBeatUpdate) this.onBeatUpdate(beat);

      this.timerId = requestAnimationFrame(update);
    };

    this.timerId = requestAnimationFrame(update);
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPaused = true;
    this.isPlaying = false;
    this.pausedAtBeat = this.currentBeat;

    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }

    this._stopAllNodes();
  }

  resume() {
    if (this.isPaused && this.composition) {
      this.playComposition(this.composition, this.pausedAtBeat, this.loop);
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentBeat = 0;
    this.pausedAtBeat = 0;

    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }

    this._stopAllNodes();
    if (this.onBeatUpdate) this.onBeatUpdate(0);
  }
}
