// Procedural Dynamic Stadium Audio & Passionate Music Engine using browser Web Audio API
class StadiumAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicVolume: number = 0.35;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private crowdNode: AudioNode | null = null;
  private isCrowdRunning: boolean = false;

  // Music Sequencer State
  private musicInterval: number | null = null;
  private currentStep: number = 0;
  private tempo: number = 126; // BPM
  private currentTrack: 'euphoria' | 'cyber' | 'champions' = 'euphoria';

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime);
    }
    if (this.crowdGain && this.ctx) {
      this.crowdGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- PASSIONATE STADIUM MUSIC SYNTHESIS ---

  public startMusic() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.currentStep = 0;

    const stepDurationMs = (60 / this.tempo / 4) * 1000;

    this.musicInterval = window.setInterval(() => {
      this.playMusicStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 32;
    }, stepDurationMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public setTrack(track: 'euphoria' | 'cyber' | 'champions') {
    this.currentTrack = track;
    if (track === 'euphoria') this.tempo = 126;
    if (track === 'cyber') this.tempo = 132;
    if (track === 'champions') this.tempo = 122;

    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }

  public getCurrentTrack(): string {
    return this.currentTrack;
  }

  private playMusicStep(step: number) {
    if (!this.ctx || this.isMuted || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // 1. Kick Drum (Four-on-the-floor: beats 0, 4, 8, 12, 16, 20, 24, 28)
    if (step % 4 === 0) {
      this.synthKick(t);
    }

    // 2. Offbeat Open Hi-Hat (beats 2, 6, 10, 14, 18, 22, 26, 30)
    if (step % 4 === 2) {
      this.synthHiHat(t, 0.08, 0.09);
    } else if (step % 2 === 0) {
      // Quiet closed 16th hat
      this.synthHiHat(t, 0.03, 0.04);
    }

    // 3. Anthemic Chord Progression & Bassline
    // Progression: Am (0-7), F (8-15), C (16-23), G (24-31)
    const bar = Math.floor(step / 8); // 0, 1, 2, 3
    const rootNotes = [110, 87.31, 130.81, 98.0]; // A2, F2, C3, G2
    const chordFrequencies = [
      [220, 261.63, 329.63, 440], // A minor
      [174.61, 220, 261.63, 349.23], // F major
      [261.63, 329.63, 392, 523.25], // C major
      [196, 246.94, 293.66, 392], // G major
    ];

    // Bass synth pulse on 16th notes
    if (step % 2 === 0) {
      const bassNote = rootNotes[bar];
      this.synthBass(t, bassNote);
    }

    // Anthemic Synth Stabs on syncopated stadium anthem beats
    if (step % 8 === 0 || step % 8 === 3 || step % 8 === 6) {
      const chord = chordFrequencies[bar];
      this.synthAnthemChord(t, chord);
    }

    // 4. Soaring Passionate Stadium Lead Melody (Iconic Football Anthem Theme)
    const anthemMelody = [
      440, 0, 523.25, 0, 659.25, 0, 783.99, 659.25, // Bar 1 (Am): A4 - C5 - E5 - G5 - E5
      698.46, 0, 659.25, 0, 523.25, 0, 440, 0,       // Bar 2 (F):  F5 - E5 - C5 - A4
      523.25, 0, 659.25, 0, 783.99, 0, 880, 0,        // Bar 3 (C):  C5 - E5 - G5 - A5
      987.77, 0, 1046.5, 0, 1174.66, 0, 1318.51, 0,  // Bar 4 (G):  B5 - C6 - D6 - E6 Climax!
    ];

    const currentNote = anthemMelody[step];
    if (currentNote && currentNote > 0) {
      this.synthLeadMelody(t, currentNote);
    }
  }

  // Synthesizer: Soaring Passionate Lead Melody
  private synthLeadMelody(t: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Warm resonant bandpass for anthemic brass feel
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // Synthesizer: Punchy Kick Drum
  private synthKick(t: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Synthesizer: Crisp Hi-Hat
  private synthHiHat(t: number, vol: number, decay: number) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * decay;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }

  // Synthesizer: Rolling Cyber Bassline
  private synthBass(t: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Synthesizer: Passionate Brass/Lead Stadium Chords
  private synthAnthemChord(t: number, freqs: number[]) {
    if (!this.ctx || !this.musicGain) return;

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // --- SOUND EFFECTS ---

  public playClick(freq = 800) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playCardWoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2 + white * 0.1) * 0.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.15);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  public playCardFlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playRarityFanfare(rarity: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chords =
      rarity === 'Cyber-Icon'
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51]
        : [440, 554.37, 659.25, 880];

    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = rarity === 'Cyber-Icon' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, this.ctx!.currentTime + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + 1.3);
    });
  }

  public playClash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.35);
    gain1.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.35);

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, this.ctx.currentTime + 0.05);
    subOsc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.5);
    subGain.gain.setValueAtTime(0.35, this.ctx.currentTime + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(this.ctx.currentTime + 0.05);
    subOsc.stop(this.ctx.currentTime + 0.55);
  }

  public playGoalExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    const hornNotes = [233.08, 293.66, 349.23];
    hornNotes.forEach((f) => {
      const horn = this.ctx!.createOscillator();
      const hGain = this.ctx!.createGain();
      horn.type = 'sawtooth';
      horn.frequency.setValueAtTime(f, t);
      hGain.gain.setValueAtTime(0.14, t);
      hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      horn.connect(hGain);
      hGain.connect(this.masterGain!);
      horn.start(t);
      horn.stop(t + 0.85);
    });

    const roarBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2.2, this.ctx.sampleRate);
    const roarData = roarBuffer.getChannelData(0);
    for (let i = 0; i < roarData.length; i++) {
      roarData[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const roarSource = this.ctx.createBufferSource();
    roarSource.buffer = roarBuffer;

    const roarFilter = this.ctx.createBiquadFilter();
    roarFilter.type = 'bandpass';
    roarFilter.frequency.setValueAtTime(600, t);
    roarFilter.frequency.linearRampToValueAtTime(1100, t + 0.6);
    roarFilter.Q.value = 1.2;

    const roarGain = this.ctx.createGain();
    roarGain.gain.setValueAtTime(0.01, t);
    roarGain.gain.linearRampToValueAtTime(0.3, t + 0.2);
    roarGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    roarSource.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(this.masterGain);

    roarSource.start(t);
  }

  public playWhistle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    [0, 0.16].forEach((delay) => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2600, this.ctx!.currentTime + delay);
      osc2.frequency.setValueAtTime(2650, this.ctx!.currentTime + delay);

      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain!);

      osc1.start(this.ctx!.currentTime + delay);
      osc2.start(this.ctx!.currentTime + delay);
      osc1.stop(this.ctx!.currentTime + delay + 0.13);
      osc2.stop(this.ctx!.currentTime + delay + 0.13);
    });
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.ctx!.currentTime + idx * 0.07);
      osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.35);
    });
  }

  public startAmbientCrowd() {
    if (this.isCrowdRunning || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.crowdGain);
      this.crowdGain.connect(this.masterGain);

      noise.start();
      this.crowdNode = noise;
      this.isCrowdRunning = true;
    } catch {
      // Audio autoplay policy catch
    }
  }

  public stopAmbientCrowd() {
    if (this.crowdNode) {
      try {
        (this.crowdNode as AudioBufferSourceNode).stop();
      } catch {
        // Ignored
      }
      this.crowdNode = null;
      this.isCrowdRunning = false;
    }
  }
}

export const audioEngine = new StadiumAudioEngine();
