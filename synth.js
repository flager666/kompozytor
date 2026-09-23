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
    this.reverbGain = null;
    this.delayNode = null;
    this.delayGain = null;
    this.compressor = null;

    this.reverbLevel = 0.18; // Default 18% (warm subtle studio space)
    this.delayLevel = 0.0;   // Default 0% (off by default)

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

    // Warm Studio Reverb with Lowpass Damping & Highpass Bass Cut
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this._buildImpulseResponse(2.0, 2.2);

    const reverbHighpass = this.ctx.createBiquadFilter();
    reverbHighpass.type = 'highpass';
    reverbHighpass.frequency.setValueAtTime(130, this.ctx.currentTime);

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.reverbLevel * 0.5, this.ctx.currentTime);

    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);

    // Stereo Delay
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.28, this.ctx.currentTime);

    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(this.delayLevel * 0.4, this.ctx.currentTime);

    const delayFeedback = this.ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.28, this.ctx.currentTime);

    this.delayNode.connect(delayFeedback);
    delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.compressor);

    // Routing
    this.masterGain.connect(this.compressor);
    this.masterGain.connect(reverbHighpass);
    reverbHighpass.connect(this.reverbNode);
    this.masterGain.connect(this.delayNode);

    this.compressor.connect(this.ctx.destination);
  }

  _buildImpulseResponse(duration = 2.0, decay = 2.2) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    let lastL = 0;
    let lastR = 0;

    for (let i = 0; i < length; i++) {
      // Exponential decay envelope
      const progress = i / length;
      const env = Math.exp(-progress * decay * 3.5);

      // Acoustic damping: high frequencies decay progressively faster
      const alpha = Math.max(0.08, 0.42 * (1 - progress * 0.85));

      const rawL = (Math.random() * 2 - 1) * env;
      const rawR = (Math.random() * 2 - 1) * env;

      // 1-pole low-pass acoustic smoothing
      lastL = lastL + alpha * (rawL - lastL);
      lastR = lastR + alpha * (rawR - lastR);

      left[i] = lastL;
      right[i] = lastR;
    }
    return impulse;
  }

  setReverb(val) {
    this.reverbLevel = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.ctx) {
      const gainVal = this.reverbLevel * 0.5;
      this.reverbGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.03);
    }
  }

  setDelay(val) {
    this.delayLevel = Math.max(0, Math.min(1, val));
    if (this.delayGain && this.ctx) {
      const gainVal = this.delayLevel * 0.4;
      this.delayGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.03);
    }
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

  previewNote(pitch, duration = 0.35, velocity = 95, track = 'melody') {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx) {
      const targetTrack = track === 'chords' || track === 'chord' ? 'chord' : (track === 'bass' ? 'bass' : 'melody');
      this.playNote(pitch, this.ctx.currentTime, duration, velocity, targetTrack);
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
      this._playInstrument(this.soundPreset, freq, time, duration, velNorm, 'melody');
    } else if (type === 'chord') {
      this._playInstrument(this.padPreset, freq, time, duration, velNorm, 'chord');
    } else if (type === 'bass') {
      this._playInstrument(this.bassPreset, freq, time, duration, velNorm, 'bass');
    }
  }

  _playMelodyPreset(freq, time, duration, vel) {
    this._playInstrument(this.soundPreset, freq, time, duration, vel, 'melody');
  }

  _playChordPad(freq, time, duration, vel) {
    this._playInstrument(this.padPreset, freq, time, duration, vel, 'chord');
  }

  _playBassVoice(freq, time, duration, vel) {
    this._playInstrument(this.bassPreset, freq, time, duration, vel, 'bass');
  }

  // =========================================================================
  // UNIVERSAL INSTRUMENT ROUTER
  // =========================================================================
  _playInstrument(inst, freq, time, duration, vel, role = 'melody') {
    if (!this.ctx) return;
    // Scale volume according to musical role
    const roleGain = (role === 'chord') ? 0.55 : (role === 'bass' ? 0.95 : 1.0);
    const v = vel * roleGain;

    switch (inst) {
      // 1. Klawiszowe i Pianina
      case 'piano':
      case 'acoustic_grand_piano':
        this._synthPiano(freq, time, duration, v, false, false);
        break;
      case 'bright_acoustic_piano':
      case 'electric_grand_piano':
        this._synthPiano(freq, time, duration, v, true, false);
        break;
      case 'honky_tonk_piano':
        this._synthPiano(freq, time, duration, v, false, true);
        break;
      case 'rhodes':
      case 'electric_piano_1':
        this._synthRhodes(freq, time, duration, v);
        break;
      case 'electric_piano_2':
      case 'dx7':
        this._synthDX7(freq, time, duration, v);
        break;
      case 'harpsichord':
        this._synthHarpsichord(freq, time, duration, v);
        break;
      case 'clavinet':
        this._synthClavinet(freq, time, duration, v);
        break;
      case 'drawbar_organ':
      case 'hammond':
      case 'percussive_organ':
      case 'rock_organ':
        this._synthHammondOrgan(freq, time, duration, v);
        break;
      case 'organ':
      case 'church_organ':
      case 'reed_organ':
        this._synthChurchOrgan(freq, time, duration, v);
        break;
      case 'accordion':
      case 'bandoneon':
        this._synthAccordion(freq, time, duration, v, false);
        break;
      case 'harmonica':
        this._synthAccordion(freq, time, duration, v, true);
        break;

      // 2. Smyczkowe i Orkiestrowe
      case 'violin':
        this._synthSoloStrings(freq, time, duration, v, 'violin');
        break;
      case 'viola':
        this._synthSoloStrings(freq, time, duration, v, 'viola');
        break;
      case 'cello':
        this._synthSoloStrings(freq, time, duration, v, 'cello');
        break;
      case 'contrabass':
        this._synthSoloStrings(freq, time, duration, v, 'contrabass');
        break;
      case 'strings':
      case 'string_ensemble_1':
      case 'string_ensemble_2':
      case 'synth_strings_1':
      case 'synth_strings_2':
        this._synthEnsembleStrings(freq, time, duration, v, false);
        break;
      case 'tremolo_strings':
        this._synthEnsembleStrings(freq, time, duration, v, true);
        break;
      case 'pizzicato_strings':
        this._synthPizzicato(freq, time, duration, v);
        break;
      case 'orchestral_harp':
        this._synthHarp(freq, time, duration, v);
        break;
      case 'timpani':
        this._synthTimpani(freq, time, duration, v);
        break;

      // 3. Gitary i Instrumenty Szarpane
      case 'guitar':
      case 'acoustic_guitar_nylon':
        this._synthAcousticGuitar(freq, time, duration, v, false);
        break;
      case 'acoustic_guitar_steel':
      case 'guitar_harmonics':
        this._synthAcousticGuitar(freq, time, duration, v, true);
        break;
      case 'electric_guitar_jazz':
      case 'electric_guitar_clean':
        this._synthElectricGuitar(freq, time, duration, v, false, false);
        break;
      case 'electric_guitar_muted':
        this._synthElectricGuitar(freq, time, duration, v, false, true);
        break;
      case 'overdriven_guitar':
      case 'distortion_guitar':
        this._synthElectricGuitar(freq, time, duration, v, true, false);
        break;
      case 'sitar':
      case 'banjo':
      case 'shamisen':
      case 'koto':
        this._synthEthnicPluck(freq, time, duration, v, inst);
        break;

      // 4. Dęte Blaszane
      case 'trumpet':
      case 'muted_trumpet':
        this._synthBrass(freq, time, duration, v, 'trumpet');
        break;
      case 'trombone':
        this._synthBrass(freq, time, duration, v, 'trombone');
        break;
      case 'tuba':
        this._synthBrass(freq, time, duration, v, 'tuba');
        break;
      case 'french_horn':
        this._synthBrass(freq, time, duration, v, 'french_horn');
        break;
      case 'brass_section':
        this._synthBrass(freq, time, duration, v, 'brass_section');
        break;
      case 'brass':
      case 'synth_brass_1':
      case 'synth_brass_2':
        this._synthBrass(freq, time, duration, v, 'synth_brass');
        break;

      // 5. Dęte Drewniane i Saksofony
      case 'piccolo':
        this._synthWoodwind(freq, time, duration, v, 'piccolo');
        break;
      case 'flute':
        this._synthWoodwind(freq, time, duration, v, 'flute');
        break;
      case 'recorder':
      case 'whistle':
        this._synthWoodwind(freq, time, duration, v, 'recorder');
        break;
      case 'pan_flute':
      case 'ocarina':
      case 'shakuhachi':
        this._synthWoodwind(freq, time, duration, v, 'pan_flute');
        break;
      case 'clarinet':
        this._synthReed(freq, time, duration, v, 'clarinet');
        break;
      case 'oboe':
      case 'english_horn':
        this._synthReed(freq, time, duration, v, 'oboe');
        break;
      case 'bassoon':
        this._synthReed(freq, time, duration, v, 'bassoon');
        break;
      case 'soprano_sax':
        this._synthSax(freq, time, duration, v, 'soprano');
        break;
      case 'alto_sax':
        this._synthSax(freq, time, duration, v, 'alto');
        break;
      case 'tenor_sax':
        this._synthSax(freq, time, duration, v, 'tenor');
        break;
      case 'baritone_sax':
        this._synthSax(freq, time, duration, v, 'baritone');
        break;

      // 6. Basy
      case 'upright':
      case 'acoustic_bass':
        this._synthBass(freq, time, duration, v, 'upright');
        break;
      case 'electric_bass_finger':
        this._synthBass(freq, time, duration, v, 'finger');
        break;
      case 'picked':
      case 'electric_bass_pick':
        this._synthBass(freq, time, duration, v, 'picked');
        break;
      case 'fretless_bass':
        this._synthBass(freq, time, duration, v, 'fretless');
        break;
      case 'slap_bass_1':
      case 'slap_bass_2':
        this._synthBass(freq, time, duration, v, 'slap');
        break;
      case 'moog':
      case 'synth_bass_1':
        this._synthBass(freq, time, duration, v, 'moog');
        break;
      case 'acid':
        this._synthBass(freq, time, duration, v, 'acid');
        break;
      case 'sub':
      case 'synth_bass_2':
        this._synthBass(freq, time, duration, v, 'sub');
        break;
      case 'boom808':
        this._synthBass(freq, time, duration, v, 'boom808');
        break;

      // 7. Syntezatory Lead
      case 'chiptune':
      case 'lead_square':
        this._synthLead(freq, time, duration, v, 'square');
        break;
      case 'synth_lead':
      case 'lead_sawtooth':
        this._synthLead(freq, time, duration, v, 'saw');
        break;
      case 'lead_calliope':
        this._synthLead(freq, time, duration, v, 'calliope');
        break;
      case 'lead_chiff':
        this._synthLead(freq, time, duration, v, 'chiff');
        break;
      case 'lead_charang':
        this._synthLead(freq, time, duration, v, 'charang');
        break;
      case 'lead_voice':
        this._synthLead(freq, time, duration, v, 'voice');
        break;
      case 'lead_fifths':
        this._synthLead(freq, time, duration, v, 'fifths');
        break;
      case 'lead_bass_lead':
        this._synthLead(freq, time, duration, v, 'bass_lead');
        break;

      // 8. Pady, Chóry i Tła
      case 'warm_analog':
      case 'pad_warm':
        this._synthPad(freq, time, duration, v, 'warm');
        break;
      case 'pad_polysynth':
        this._synthPad(freq, time, duration, v, 'polysynth');
        break;
      case 'shimmer':
      case 'pad_choir':
      case 'pad_halo':
        this._synthPad(freq, time, duration, v, 'shimmer');
        break;
      case 'pad_bowed':
        this._synthPad(freq, time, duration, v, 'bowed');
        break;
      case 'pad_metallic':
      case 'pad_new_age':
        this._synthPad(freq, time, duration, v, 'metallic');
        break;
      case 'pad_sweep':
        this._synthPad(freq, time, duration, v, 'sweep');
        break;
      case 'choir_aahs':
        this._synthChoir(freq, time, duration, v, 'aahs');
        break;
      case 'voice_oohs':
      case 'synth_voice':
        this._synthChoir(freq, time, duration, v, 'oohs');
        break;
      case 'lofi':
        this._synthPad(freq, time, duration, v, 'lofi');
        break;

      // 9. Melodyczne Perkusyjne
      case 'marimba':
      case 'pluck':
        this._synthMallet(freq, time, duration, v, 'marimba');
        break;
      case 'vibraphone':
        this._synthMallet(freq, time, duration, v, 'vibraphone');
        break;
      case 'xylophone':
        this._synthMallet(freq, time, duration, v, 'xylophone');
        break;
      case 'glockenspiel':
        this._synthMallet(freq, time, duration, v, 'glockenspiel');
        break;
      case 'celesta':
        this._synthMallet(freq, time, duration, v, 'celesta');
        break;
      case 'music_box':
        this._synthMallet(freq, time, duration, v, 'music_box');
        break;
      case 'tubular_bells':
        this._synthMallet(freq, time, duration, v, 'tubular_bells');
        break;
      case 'kalimba':
      case 'dulcimer':
        this._synthMallet(freq, time, duration, v, 'kalimba');
        break;
      case 'steel_drums':
        this._synthMallet(freq, time, duration, v, 'steel_drums');
        break;

      default:
        if (role === 'bass') {
          this._synthBass(freq, time, duration, v, 'moog');
        } else if (role === 'chord') {
          this._synthPad(freq, time, duration, v, 'warm');
        } else {
          this._synthPiano(freq, time, duration, v, false, false);
        }
    }
  }

  // =========================================================================
  // 1. KLAWISZOWE & PIANINA
  // =========================================================================
  _synthPiano(freq, time, duration, vel, isBright = false, isHonkyTonk = false) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    const detune = isHonkyTonk ? 14 : 2;
    osc2.frequency.setValueAtTime(freq, time);
    osc2.detune.setValueAtTime(detune, time);

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * (isBright ? 3 : 2), time);
    osc3.detune.setValueAtTime(-detune, time);

    filter.type = 'lowpass';
    const cutoff = isBright ? Math.min(8500, freq * 6) : Math.min(6500, freq * 4.5);
    filter.frequency.setValueAtTime(cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.2), time + duration);

    const peak = vel * 0.44;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(peak * 0.38, time + 0.32);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.18);

    osc1.connect(filter); osc2.connect(filter); osc3.connect(filter);
    filter.connect(gain); gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time); osc3.start(time);
    const stopT = time + duration + 0.22;
    osc1.stop(stopT); osc2.stop(stopT); osc3.stop(stopT);

    this._registerOsc(osc1); this._registerOsc(osc2); this._registerOsc(osc3);
    this._registerGain(gain);
  }

  _synthRhodes(freq, time, duration, vel) {
    const ctx = this.ctx;
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, time);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * 2, time);

    modGain.gain.setValueAtTime(freq * 1.6 * vel, time);
    modGain.gain.exponentialRampToValueAtTime(freq * 0.04, time + duration * 0.85);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    const peak = vel * 0.40;
    mainGain.gain.setValueAtTime(0.0001, time);
    mainGain.gain.linearRampToValueAtTime(peak, time + 0.015);
    mainGain.gain.exponentialRampToValueAtTime(peak * 0.48, time + 0.42);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.22);

    carrier.connect(mainGain);
    mainGain.connect(this.masterGain);

    carrier.start(time); modulator.start(time);
    const stopT = time + duration + 0.25;
    carrier.stop(stopT); modulator.stop(stopT);

    this._registerOsc(carrier); this._registerOsc(modulator);
    this._registerGain(mainGain); this._registerGain(modGain);
  }

  _synthDX7(freq, time, duration, vel) {
    const ctx = this.ctx;
    const carrier = ctx.createOscillator();
    const mod1 = ctx.createOscillator();
    const mod1Gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, time);

    mod1.type = 'sine';
    mod1.frequency.setValueAtTime(freq * 7, time); // FM 7x tine bell
    mod1Gain.gain.setValueAtTime(freq * 2.2 * vel, time);
    mod1Gain.gain.exponentialRampToValueAtTime(1, time + 0.15);

    mod1.connect(mod1Gain);
    mod1Gain.connect(carrier.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5500, time);

    const peak = vel * 0.36;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(peak * 0.35, time + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

    carrier.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    carrier.start(time); mod1.start(time);
    const stopT = time + duration + 0.25;
    carrier.stop(stopT); mod1.stop(stopT);

    this._registerOsc(carrier); this._registerOsc(mod1);
    this._registerGain(gain); this._registerGain(mod1Gain);
  }

  _synthHarpsichord(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, time);
    filter.Q.setValueAtTime(1.8, time);

    const peak = vel * 0.38;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.65));

    osc1.connect(filter); osc2.connect(filter);
    filter.connect(gain); gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time);
    const stopT = time + Math.min(duration, 0.65) + 0.08;
    osc1.stop(stopT); osc2.stop(stopT);

    this._registerOsc(osc1); this._registerOsc(osc2);
    this._registerGain(gain);
  }

  _synthClavinet(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.2, time);
    filter.frequency.setValueAtTime(2800, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + 0.12);

    const peak = vel * 0.42;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.45));

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time);
    const stopT = time + Math.min(duration, 0.45) + 0.05;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  _synthChurchOrgan(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine'; osc1.frequency.setValueAtTime(freq, time); // 8'
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq * 2, time); // 4'
    osc3.type = 'sine'; osc3.frequency.setValueAtTime(freq * 3, time); // 2 2/3'

    const peak = vel * 0.22;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.05);
    gain.gain.setValueAtTime(peak * 0.95, time + duration * 0.85);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.28);

    osc1.connect(gain); osc2.connect(gain); osc3.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time); osc3.start(time);
    const stopT = time + duration + 0.32;
    osc1.stop(stopT); osc2.stop(stopT); osc3.stop(stopT);

    this._registerOsc(osc1); this._registerOsc(osc2); this._registerOsc(osc3);
    this._registerGain(gain);
  }

  _synthHammondOrgan(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const gain = ctx.createGain();

    osc1.type = 'triangle'; osc1.frequency.setValueAtTime(freq, time);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq * 2, time);
    osc3.type = 'sine'; osc3.frequency.setValueAtTime(freq * 4, time);

    // Key click transient
    click.type = 'square'; click.frequency.setValueAtTime(freq * 8, time);
    clickGain.gain.setValueAtTime(vel * 0.15, time);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);
    click.connect(clickGain); clickGain.connect(gain);

    const peak = vel * 0.25;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.02);
    gain.gain.setValueAtTime(peak, time + duration * 0.9);
    gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.15);

    osc1.connect(gain); osc2.connect(gain); osc3.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time); osc3.start(time); click.start(time);
    const stopT = time + duration + 0.2;
    osc1.stop(stopT); osc2.stop(stopT); osc3.stop(stopT); click.stop(time + 0.03);

    this._registerOsc(osc1); this._registerOsc(osc2); this._registerOsc(osc3); this._registerOsc(click);
    this._registerGain(gain); this._registerGain(clickGain);
  }

  _synthAccordion(freq, time, duration, vel, isHarmonica = false) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc1.detune.setValueAtTime(isHarmonica ? 0 : 8, time);

    osc2.type = isHarmonica ? 'square' : 'sawtooth';
    osc2.frequency.setValueAtTime(freq * (isHarmonica ? 2 : 1), time);
    osc2.detune.setValueAtTime(isHarmonica ? -6 : -8, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHarmonica ? 1600 : 1200, time);
    filter.Q.setValueAtTime(1.5, time);

    const peak = vel * 0.26;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.04);
    gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.85);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.15);

    osc1.connect(filter); osc2.connect(filter);
    filter.connect(gain); gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time);
    const stopT = time + duration + 0.2;
    osc1.stop(stopT); osc2.stop(stopT);

    this._registerOsc(osc1); this._registerOsc(osc2);
    this._registerGain(gain);
  }

  // =========================================================================
  // 2. SMYCZKOWE & ORKIESTROWE
  // =========================================================================
  _synthSoloStrings(freq, time, duration, vel, type = 'violin') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const bodyFilter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Vibrato LFO with natural onset
    lfo.frequency.setValueAtTime(5.6, time);
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.015, time + 0.18);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    bodyFilter.type = 'bandpass';
    const bodyFreq = (type === 'cello' || type === 'contrabass') ? 450 : 1800;
    bodyFilter.frequency.setValueAtTime(bodyFreq, time);
    bodyFilter.Q.setValueAtTime(2.2, time);

    const attack = (type === 'cello' || type === 'contrabass') ? 0.08 : 0.045;
    const peak = vel * 0.36;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + attack);
    gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.25);

    osc.connect(bodyFilter); bodyFilter.connect(gain); gain.connect(this.masterGain);

    osc.start(time); lfo.start(time);
    const stopT = time + duration + 0.3;
    osc.stop(stopT); lfo.stop(stopT);

    this._registerOsc(osc); this._registerOsc(lfo);
    this._registerGain(gain); this._registerGain(lfoGain);
  }

  _synthEnsembleStrings(freq, time, duration, vel, tremolo = false) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc1.detune.setValueAtTime(-12, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, time);
    osc2.detune.setValueAtTime(12, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);

    let tremLfo = null, tremGain = null;
    if (tremolo) {
      tremLfo = ctx.createOscillator();
      tremGain = ctx.createGain();
      tremLfo.frequency.setValueAtTime(6.8, time);
      tremGain.gain.setValueAtTime(0.3, time);
      tremLfo.connect(tremGain);
      tremGain.connect(gain.gain);
      tremLfo.start(time);
      tremLfo.stop(time + duration + 0.4);
      this._registerOsc(tremLfo); this._registerGain(tremGain);
    }

    const peak = vel * 0.22;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.22);
    gain.gain.setValueAtTime(peak * 0.95, time + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.45);

    osc1.connect(filter); osc2.connect(filter);
    filter.connect(gain); gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time);
    const stopT = time + duration + 0.5;
    osc1.stop(stopT); osc2.stop(stopT);

    this._registerOsc(osc1); this._registerOsc(osc2);
    this._registerGain(gain);
  }

  _synthPizzicato(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.15);

    const peak = vel * 0.45;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.4));

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time);
    const stopT = time + Math.min(duration, 0.4) + 0.05;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  _synthHarp(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine'; osc1.frequency.setValueAtTime(freq, time);
    osc2.type = 'triangle'; osc2.frequency.setValueAtTime(freq * 2, time);

    const peak = vel * 0.38;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration + 0.3, 1.2));

    osc1.connect(gain); osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time); osc2.start(time);
    const stopT = time + Math.min(duration + 0.3, 1.2) + 0.1;
    osc1.stop(stopT); osc2.stop(stopT);

    this._registerOsc(osc1); this._registerOsc(osc2);
    this._registerGain(gain);
  }

  _synthTimpani(freq, time, duration, vel) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.08);

    const peak = vel * 0.55;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration + 0.4, 0.9));

    osc.connect(gain); gain.connect(this.masterGain);
    osc.start(time);
    const stopT = time + Math.min(duration + 0.4, 0.9) + 0.1;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  // =========================================================================
  // 3. GITARY & INSTRUMENTY SZARPANE
  // =========================================================================
  _synthAcousticGuitar(freq, time, duration, vel, isSteel = false) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = isSteel ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    const cutoff = isSteel ? Math.min(6500, freq * 4.8) : Math.min(4800, freq * 3.5);
    filter.frequency.setValueAtTime(cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.1, time + duration * 0.85);

    const peak = vel * 0.44;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.12);

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time);
    const stopT = time + duration + 0.18;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  _synthElectricGuitar(freq, time, duration, vel, isOverdrive = false, isMuted = false) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isOverdrive ? 1800 : 1200, time);
    filter.Q.setValueAtTime(isOverdrive ? 3.5 : 1.2, time);

    const decayTime = isMuted ? 0.12 : (isOverdrive ? duration + 0.3 : duration + 0.1);
    const peak = vel * (isOverdrive ? 0.32 : 0.40);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decayTime);

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time);
    const stopT = time + decayTime + 0.05;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  _synthEthnicPluck(freq, time, duration, vel, type = 'sitar') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = (type === 'banjo' || type === 'sitar') ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(4.0, time);

    const peak = vel * 0.42;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.7));

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
    osc.start(time);
    const stopT = time + Math.min(duration, 0.7) + 0.06;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  // =========================================================================
  // 4. DĘTE BLASZANE
  // =========================================================================
  _synthBrass(freq, time, duration, vel, type = 'trumpet') {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = (type === 'brass_section' || type === 'synth_brass') ? ctx.createOscillator() : null;
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    if (osc2) {
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq, time);
      osc2.detune.setValueAtTime(type === 'synth_brass' ? 8 : 10, time);
      osc1.detune.setValueAtTime(type === 'synth_brass' ? -8 : -10, time);
    }

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(type === 'synth_brass' ? 3.5 : 2.0, time);
    const baseCutoff = (type === 'tuba' || type === 'trombone') ? 350 : 650;
    const peakCutoff = (type === 'tuba') ? 1400 : 3800;

    filter.frequency.setValueAtTime(baseCutoff, time);
    filter.frequency.linearRampToValueAtTime(peakCutoff, time + 0.06);
    filter.frequency.exponentialRampToValueAtTime(baseCutoff * 1.8, time + duration);

    const peak = vel * 0.32;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.04);
    gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

    osc1.connect(filter);
    if (osc2) osc2.connect(filter);
    filter.connect(gain); gain.connect(this.masterGain);

    osc1.start(time);
    if (osc2) osc2.start(time);
    const stopT = time + duration + 0.25;
    osc1.stop(stopT);
    if (osc2) osc2.stop(stopT);

    this._registerOsc(osc1);
    if (osc2) this._registerOsc(osc2);
    this._registerGain(gain);
  }

  // =========================================================================
  // 5. DĘTE DREWNIANE & SAKSOFONY
  // =========================================================================
  _synthWoodwind(freq, time, duration, vel, type = 'flute') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    // Natural flute vibrato
    lfo.frequency.setValueAtTime(5.2, time);
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.012, time + 0.15);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'piccolo' ? 6000 : 3200, time);

    const peak = vel * 0.38;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.05); // Breath attack
    gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.16);

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);

    osc.start(time); lfo.start(time);
    const stopT = time + duration + 0.22;
    osc.stop(stopT); lfo.stop(stopT);

    this._registerOsc(osc); this._registerOsc(lfo);
    this._registerGain(gain); this._registerGain(lfoGain);
  }

  _synthReed(freq, time, duration, vel, type = 'clarinet') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Clarinet has predominantly odd harmonics (square wave)
    osc.type = (type === 'clarinet') ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    const fCenter = (type === 'bassoon') ? 600 : (type === 'oboe' ? 1800 : 1400);
    filter.frequency.setValueAtTime(fCenter, time);
    filter.Q.setValueAtTime(1.8, time);

    const peak = vel * 0.30;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.035);
    gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.18);

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);

    osc.start(time);
    const stopT = time + duration + 0.22;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  _synthSax(freq, time, duration, vel, type = 'alto') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    lfo.frequency.setValueAtTime(5.4, time);
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.016, time + 0.18);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'bandpass';
    const fRange = (type === 'soprano') ? 2200 : (type === 'baritone' ? 800 : 1500);
    filter.frequency.setValueAtTime(fRange, time);
    filter.Q.setValueAtTime(2.2, time);

    const peak = vel * 0.35;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.04);
    gain.gain.setValueAtTime(peak * 0.9, time + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

    osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);

    osc.start(time); lfo.start(time);
    const stopT = time + duration + 0.25;
    osc.stop(stopT); lfo.stop(stopT);

    this._registerOsc(osc); this._registerOsc(lfo);
    this._registerGain(gain); this._registerGain(lfoGain);
  }

  // =========================================================================
  // 6. BASY
  // =========================================================================
  _synthBass(freq, time, duration, vel, type = 'moog') {
    const ctx = this.ctx;

    if (type === 'sub') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, time);
      const bassVol = vel * 0.50;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.025);
      gain.gain.setValueAtTime(bassVol * 0.9, time + duration * 0.8);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.1);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);
      this._registerOsc(osc); this._registerGain(gain);

    } else if (type === 'boom808') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2.2, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.06);
      const bassVol = vel * 0.52;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(bassVol * 0.7, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.25);
      this._registerOsc(osc); this._registerGain(gain);

    } else if (type === 'upright') {
      const osc = ctx.createOscillator();
      const body = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
      body.type = 'bandpass'; body.frequency.setValueAtTime(220, time); body.Q.setValueAtTime(1.5, time);
      const bassVol = vel * 0.46;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(bassVol * 0.4, time + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);
      osc.connect(body); body.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);
      this._registerOsc(osc); this._registerGain(gain);

    } else if (type === 'picked' || type === 'slap') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'slap' ? 3800 : 2400, time);
      filter.frequency.exponentialRampToValueAtTime(450, time + 0.15);
      const bassVol = vel * 0.40;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);
      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);
      this._registerOsc(osc); this._registerGain(gain);

    } else if (type === 'acid') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass'; filter.Q.setValueAtTime(9.5, time);
      filter.frequency.setValueAtTime(freq * 6.0, time);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.2);
      const bassVol = vel * 0.36;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);
      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.15);
      this._registerOsc(osc); this._registerGain(gain);

    } else {
      // Default: Moog / Finger electric bass
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
      sub.type = 'sine'; sub.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(520, time);
      const bassVol = vel * 0.40;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(bassVol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(bassVol * 0.6, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.1);
      osc.connect(filter); sub.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); sub.start(time);
      osc.stop(time + duration + 0.15); sub.stop(time + duration + 0.15);
      this._registerOsc(osc); this._registerOsc(sub); this._registerGain(gain);
    }
  }

  // =========================================================================
  // 7. SYNTEZATORY LEAD
  // =========================================================================
  _synthLead(freq, time, duration, vel, type = 'saw') {
    const ctx = this.ctx;

    if (type === 'square') {
      // 8-bit retro arcade
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(freq, time);
      const peak = vel * 0.25;
      gain.gain.setValueAtTime(peak, time);
      gain.gain.setValueAtTime(peak * 0.8, time + duration * 0.8);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.02);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.05);
      this._registerOsc(osc); this._registerGain(gain);

    } else if (type === 'fifths') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(freq, time);
      osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(freq * 1.4983, time); // Fifth
      const peak = vel * 0.25;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);
      osc1.connect(gain); osc2.connect(gain); gain.connect(this.masterGain);
      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.25); osc2.stop(time + duration + 0.25);
      this._registerOsc(osc1); this._registerOsc(osc2); this._registerGain(gain);

    } else {
      // Default: Dual detuned saw Moog lead
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(freq, time); osc1.detune.setValueAtTime(-8, time);
      osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(freq, time); osc2.detune.setValueAtTime(8, time);
      filter.type = 'lowpass'; filter.Q.setValueAtTime(5.0, time);
      filter.frequency.setValueAtTime(freq * 1.2, time);
      filter.frequency.linearRampToValueAtTime(freq * 5.2, time + 0.08);
      filter.frequency.exponentialRampToValueAtTime(freq * 2.0, time + duration);
      const peak = vel * 0.32;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);
      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);
      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.25); osc2.stop(time + duration + 0.25);
      this._registerOsc(osc1); this._registerOsc(osc2); this._registerGain(gain);
    }
  }

  // =========================================================================
  // 8. PADY, CHÓRY & TŁA
  // =========================================================================
  _synthPad(freq, time, duration, vel, type = 'warm') {
    const ctx = this.ctx;

    if (type === 'shimmer') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc1.type = 'sine'; osc1.frequency.setValueAtTime(freq, time);
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq * 2, time);
      filter.type = 'highpass'; filter.frequency.setValueAtTime(350, time);
      const padVol = vel * 0.16;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.25);
      gain.gain.setValueAtTime(padVol * 0.9, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.5);
      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);
      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.55); osc2.stop(time + duration + 0.55);
      this._registerOsc(osc1); this._registerOsc(osc2); this._registerGain(gain);

    } else if (type === 'lofi') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(750, time);
      const padVol = vel * 0.20;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.25);
      osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.3);
      this._registerOsc(osc); this._registerGain(gain);

    } else {
      // Default: Warm Analog Pad
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc1.type = 'triangle'; osc1.frequency.setValueAtTime(freq, time); osc1.detune.setValueAtTime(-6, time);
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq, time); osc2.detune.setValueAtTime(6, time);
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(1400, time);
      const padVol = vel * 0.18;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + 0.16);
      gain.gain.setValueAtTime(padVol * 0.9, time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.42);
      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(this.masterGain);
      osc1.start(time); osc2.start(time);
      osc1.stop(time + duration + 0.48); osc2.stop(time + duration + 0.48);
      this._registerOsc(osc1); this._registerOsc(osc2); this._registerGain(gain);
    }
  }

  _synthChoir(freq, time, duration, vel, type = 'aahs') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const f1 = ctx.createBiquadFilter();
    const f2 = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Formant filter simulating human vocal tract
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(type === 'aahs' ? 800 : 450, time);
    f1.Q.setValueAtTime(3.5, time);

    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(type === 'aahs' ? 1250 : 950, time);
    f2.Q.setValueAtTime(3.5, time);

    const padVol = vel * 0.18;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(padVol, time + 0.22);
    gain.gain.setValueAtTime(padVol * 0.9, time + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.45);

    osc.connect(f1); osc.connect(f2);
    f1.connect(gain); f2.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    const stopT = time + duration + 0.5;
    osc.stop(stopT);

    this._registerOsc(osc); this._registerGain(gain);
  }

  // =========================================================================
  // 9. MELODYCZNE PERKUSYJNE
  // =========================================================================
  _synthMallet(freq, time, duration, vel, type = 'marimba') {
    const ctx = this.ctx;

    if (type === 'vibraphone') {
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, time);
      overtone.type = 'sine'; overtone.frequency.setValueAtTime(freq * 3.98, time);
      lfo.type = 'sine'; lfo.frequency.setValueAtTime(5.5, time);
      lfoGain.gain.setValueAtTime(0.15, time);
      lfo.connect(lfoGain); lfoGain.connect(gain.gain);
      const peak = vel * 0.45;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(peak * 0.35, time + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.3);
      osc.connect(gain); overtone.connect(gain); gain.connect(this.masterGain);
      osc.start(time); overtone.start(time); lfo.start(time);
      const stopT = time + duration + 0.35;
      osc.stop(stopT); overtone.stop(stopT); lfo.stop(stopT);
      this._registerOsc(osc); this._registerOsc(overtone); this._registerOsc(lfo);
      this._registerGain(gain);

    } else if (type === 'celesta' || type === 'glockenspiel' || type === 'music_box') {
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, time);
      overtone.type = 'sine'; overtone.frequency.setValueAtTime(freq * 2.76, time);
      const peak = vel * 0.38;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration + 0.3, 0.8));
      osc.connect(gain); overtone.connect(gain); gain.connect(this.masterGain);
      osc.start(time); overtone.start(time);
      const stopT = time + Math.min(duration + 0.3, 0.8) + 0.08;
      osc.stop(stopT); overtone.stop(stopT);
      this._registerOsc(osc); this._registerOsc(overtone); this._registerGain(gain);

    } else {
      // Default: Marimba / Pluck
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, time);
      const peak = vel * 0.48;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.75));
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(time);
      const stopT = time + Math.min(duration, 0.75) + 0.05;
      osc.stop(stopT);
      this._registerOsc(osc); this._registerGain(gain);
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
