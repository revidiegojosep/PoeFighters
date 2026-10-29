/**
 * Audio Engine using Web Audio API
 * Generates all SFX and dynamic battle music synthesized procedurally in real-time.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.volume = {
      master: 0.8,
      sfx: 0.8,
      music: 0.35
    };
    this.lastSfxTimes = {};

    try {
      const saved = localStorage.getItem('pokefighters_volume');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.master !== undefined) this.volume.master = parsed.master;
        if (parsed.sfx !== undefined) this.volume.sfx = parsed.sfx;
        if (parsed.music !== undefined) this.volume.music = parsed.music;
        if (parsed.muted !== undefined) this.isMuted = parsed.muted;
      }
    } catch (e) {}
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume.master, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.volume.sfx, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.volume.music, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSfx(name, pitchVariation = 0.05) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // Throttle fast repeating sounds
    const now = performance.now();
    if (this.lastSfxTimes[name] && now - this.lastSfxTimes[name] < 45) return;
    this.lastSfxTimes[name] = now;

    const t = this.ctx.currentTime;
    const pitch = 1 + (Math.random() * 2 - 1) * pitchVariation;

    switch (name) {
      case 'jump': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(380 * pitch, t + 0.12);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }

      case 'djump': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(640 * pitch, t + 0.16);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }

      case 'hit_light': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }

      case 'hit_medium': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
        this._noise(t, 0.1, 0.2);
        break;
      }

      case 'hit_heavy': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);
        g.gain.setValueAtTime(0.55, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
        this._noise(t, 0.22, 0.4);
        break;
      }

      case 'shock': {
        // High frequency buzzing electric attack
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime((440 + i * 220) * pitch, t + i * 0.03);
          osc.frequency.linearRampToValueAtTime(800 + Math.random() * 400, t + (i + 1) * 0.04);
          g.gain.setValueAtTime(0.2, t + i * 0.03);
          g.gain.exponentialRampToValueAtTime(0.01, t + (i + 1) * 0.04);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t + i * 0.03);
          osc.stop(t + (i + 1) * 0.04);
        }
        break;
      }

      case 'thunder': {
        // Huge lightning strike
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.45);
        g.gain.setValueAtTime(0.65, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.45);
        this._noise(t, 0.5, 0.6);
        break;
      }

      case 'whip': {
        // Sharp vine snap
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        this._noise(t, 0.08, 0.25);
        break;
      }

      case 'razor_leaf': {
        // Cutting sharp whoosh
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(550 * pitch, t);
        osc.frequency.linearRampToValueAtTime(250, t + 0.15);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'blast_ko': {
        // Ring out KO explosion
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.8);
        g.gain.setValueAtTime(0.8, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.8);
        this._noise(t, 0.8, 0.7);

        // High victory shine chime
        const bell = this.ctx.createOscillator();
        const bellG = this.ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(987.77, t + 0.05); // B5
        bell.frequency.exponentialRampToValueAtTime(1318.51, t + 0.4); // E6
        bellG.gain.setValueAtTime(0.3, t + 0.05);
        bellG.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        bell.connect(bellG).connect(this.sfxGain);
        bell.start(t + 0.05);
        bell.stop(t + 0.5);
        break;
      }

      case 'quick_attack': {
        // High speed zip
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(1200 * pitch, t + 0.14);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
        break;
      }

      case 'seed_bomb': {
        // Launch and explosive pop
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
        this._noise(t, 0.18, 0.3);
        break;
      }

      case 'grab': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(110 * pitch, t + 0.12);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        this._noise(t, 0.08, 0.15);
        break;
      }

      case 'throw': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(450 * pitch, t + 0.18);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.18);
        this._noise(t, 0.14, 0.25);
        break;
      }

      case 'flamethrower': {
        this._noise(t, 0.16, 0.28);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(90 * pitch, t + 0.14);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
        break;
      }

      case 'flare_blitz': {
        this._noise(t, 0.32, 0.45);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(320 * pitch, t + 0.26);
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.26);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.26);
        break;
      }

      case 'rock_smash': {
        this._noise(t, 0.25, 0.5);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.22);
        g.gain.setValueAtTime(0.55, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.22);
        break;
      }

      case 'wing_flap': {
        this._noise(t, 0.12, 0.22);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.15);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'select': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.setValueAtTime(800, t + 0.04);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      case 'victory': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + i * 0.12);
          g.gain.setValueAtTime(0.3, t + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.35);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t + i * 0.12);
          osc.stop(t + i * 0.12 + 0.35);
        });
        break;
      }

      case 'defeat': {
        const notes = [392.00, 369.99, 349.23, 311.13];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + i * 0.16);
          g.gain.setValueAtTime(0.25, t + i * 0.16);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.16 + 0.35);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t + i * 0.16);
          osc.stop(t + i * 0.16 + 0.35);
        });
        break;
      }

      case 'poison': {
        // Toxic poison bubble tick
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(140 * pitch, t + 0.12);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }

      case 'shadow': {
        // Shadow Ball dark energy projectile
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(90 * pitch, t + 0.22);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.22);
        this._noise(t, 0.16, 0.22);
        break;
      }

      case 'lick': {
        // Ghostly tongue whip slap
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.14);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
        break;
      }

      case 'teleport': {
        // Shadow Teleport ethereal warp
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(680 * pitch, t + 0.18);
        g.gain.setValueAtTime(0.28, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }

      case 'poison': {
        // Toxic bubbling hiss / veneno sound
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 * pitch, t);
        osc.frequency.linearRampToValueAtTime(140 * pitch, t + 0.10);
        osc.frequency.linearRampToValueAtTime(260 * pitch, t + 0.20);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.20);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.20);
        this._noise(t, 0.15, 0.18);
        break;
      }

      case 'charge': {
        // High-energy rising pitch power accumulation
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(540 * pitch, t + 0.35);
        g.gain.setValueAtTime(0.24, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }

      case 'smash': {
        // Booming explosive Smash attack release
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.38);
        g.gain.setValueAtTime(0.65, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.38);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.38);
        this._noise(t, 0.35, 0.55);
        break;
      }

      case 'parry_shield': {
        // Metallic perfect shield bell chime with high resonant overtone
        const osc1 = this.ctx.createOscillator();
        const g1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1174.66, t); // D6
        osc1.frequency.exponentialRampToValueAtTime(1760.00, t + 0.08); // A6
        g1.gain.setValueAtTime(0.55, t);
        g1.gain.exponentialRampToValueAtTime(0.005, t + 0.42);
        osc1.connect(g1).connect(this.sfxGain);
        osc1.start(t);
        osc1.stop(t + 0.42);

        // Metallic second harmonic ping
        const osc2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(2349.32, t); // D7
        g2.gain.setValueAtTime(0.40, t);
        g2.gain.exponentialRampToValueAtTime(0.005, t + 0.28);
        osc2.connect(g2).connect(this.sfxGain);
        osc2.start(t);
        osc2.stop(t + 0.28);
        break;
      }

      case 'ledge_grab': {
        // Crisp ledge snap and hand grab
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(440 * pitch, t + 0.09);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.09);
        this._noise(t, 0.06, 0.2);
        break;
      }

      case 'grab': {
        // Swift whoosh into wrestling grip snap
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(320 * pitch, t + 0.06);
        osc.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.12);
        g.gain.setValueAtTime(0.40, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
        this._noise(t, 0.08, 0.25);
        break;
      }

      case 'throw': {
        // Heavy impact whip and aerodynamic launch whoosh
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(110 * pitch, t + 0.16);
        g.gain.setValueAtTime(0.55, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.18);
        this._noise(t, 0.12, 0.40);
        break;
      }

      case 'lava_burn': {
        // Magma sizzle & fiery blast
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(240 * pitch, t + 0.22);
        g.gain.setValueAtTime(0.60, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.35);
        this._noise(t, 0.30, 0.65);
        break;
      }

      case 'electric_arc': {
        // High voltage crackling tesla arc
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440 * pitch, t);
        osc.frequency.linearRampToValueAtTime(880 * pitch, t + 0.08);
        osc.frequency.linearRampToValueAtTime(220 * pitch, t + 0.16);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.20);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.20);
        this._noise(t, 0.15, 0.30);
        break;
      }

      case 'countdown_beep': {
        // High retro arcade beep for 3.. 2.. 1..
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.005, t + 0.14);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
        break;
      }

      case 'countdown_go': {
        // Triumphant double chord for ¡YA!
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.28, t);
          g.gain.exponentialRampToValueAtTime(0.005, t + 0.45);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.45);
        });
        break;
      }

      case 'sing': {
        // Sweet melodic chime notes for Jigglypuff's Sing (Lullaby)
        const notes = [587.33, 659.25, 523.25]; // D5, E5, C5
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + i * 0.12);
          g.gain.setValueAtTime(0.24, t + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.005, t + i * 0.12 + 0.28);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t + i * 0.12);
          osc.stop(t + i * 0.12 + 0.28);
        });
        break;
      }

      case 'rest': {
        // Sonic boom + critical snap for Rest
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
        g.gain.setValueAtTime(0.8, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.4);
        this._noise(t, 0.4, 0.7);

        // High sharp ping
        const ping = this.ctx.createOscillator();
        const pingG = this.ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1760, t);
        ping.frequency.exponentialRampToValueAtTime(2200, t + 0.25);
        pingG.gain.setValueAtTime(0.4, t);
        pingG.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        ping.connect(pingG).connect(this.sfxGain);
        ping.start(t);
        ping.stop(t + 0.25);
        break;
      }

      case 'rollout': {
        // Revving turbine pitch sweep
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.3);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }

      case 'slap': {
        // Sharp physical slap for Jigglypuff
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
        this._noise(t, 0.08, 0.35);
        break;
      }

      case 'hyper_beam': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.45);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.45);
        this._noise(t, 0.42, 0.4);
        break;
      }

      case 'draining_kiss': {
        const freqs = [659.25, 880, 1174.66];
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f * pitch, t + i * 0.07);
          g.gain.setValueAtTime(0.22, t + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.005, t + i * 0.07 + 0.22);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t + i * 0.07);
          osc.stop(t + i * 0.07 + 0.22);
        });
        break;
      }

      case 'moonblast': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780 * pitch, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.32);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.32);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.32);
        this._noise(t, 0.22, 0.25);
        break;
      }

      case 'baby_doll_eyes': {
        const freqs = [783.99, 1046.50, 1318.51];
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f * pitch, t + i * 0.06);
          g.gain.setValueAtTime(0.22, t + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.005, t + i * 0.06 + 0.18);
          osc.connect(g).connect(this.sfxGain);
          osc.start(t + i * 0.06);
          osc.stop(t + i * 0.06 + 0.18);
        });
        break;
      }
    }
  }

  _noise(startTime, duration, volume = 0.2) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(volume, startTime);
    g.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    noise.connect(g).connect(this.sfxGain);
    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  toggleMusic() {
    this.ensureContext();
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    this.ensureContext();
    if (this.musicPlaying || !this.ctx) return;
    this.musicPlaying = true;
    this._playMusicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _playMusicLoop() {
    if (!this.musicPlaying || !this.ctx) return;
    const bpm = 138;
    const beat = 60 / bpm;
    const sixteenth = beat / 4;

    // Pokemon battle bass + arpeggio progression (C minor / Eb / F / G)
    const chords = [
      [130.81, 155.56, 196.00], // C3, Eb3, G3
      [116.54, 138.59, 174.61], // Bb2, Db3, F3
      [103.83, 130.81, 155.56], // Ab2, C3, Eb3
      [98.00,  123.47, 146.83]  // G2, B2, D3
    ];

    const startTime = this.ctx.currentTime + 0.05;
    let barDuration = beat * 4;

    chords.forEach((chord, chordIdx) => {
      const chordStart = startTime + chordIdx * barDuration;
      // 16th notes synth arpeggio
      for (let s = 0; s < 16; s++) {
        const noteTime = chordStart + s * sixteenth;
        const noteFreq = chord[s % 3] * (s % 4 === 0 ? 2 : 1);

        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = s % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(noteFreq, noteTime);

        const vol = s % 4 === 0 ? 0.07 : 0.035;
        g.gain.setValueAtTime(vol, noteTime);
        g.gain.exponentialRampToValueAtTime(0.001, noteTime + sixteenth * 0.9);

        osc.connect(g).connect(this.musicGain);
        osc.start(noteTime);
        osc.stop(noteTime + sixteenth);
      }

      // Bass drum & snare rhythm
      for (let b = 0; b < 4; b++) {
        const beatTime = chordStart + b * beat;
        // Kick on 1 and 3
        if (b === 0 || b === 2) {
          const kick = this.ctx.createOscillator();
          const kickG = this.ctx.createGain();
          kick.frequency.setValueAtTime(110, beatTime);
          kick.frequency.exponentialRampToValueAtTime(40, beatTime + 0.1);
          kickG.gain.setValueAtTime(0.2, beatTime);
          kickG.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.1);
          kick.connect(kickG).connect(this.musicGain);
          kick.start(beatTime);
          kick.stop(beatTime + 0.1);
        }
        // Snare / clap on 2 and 4
        if (b === 1 || b === 3) {
          this._synthSnare(beatTime, 0.08);
        }
      }
    });

    const loopTime = chords.length * barDuration * 1000;
    this.musicTimer = setTimeout(() => {
      if (this.musicPlaying) {
        this._playMusicLoop();
      }
    }, loopTime - 80);
  }

  _synthSnare(time, volume) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.08);
    g.gain.setValueAtTime(volume, time);
    g.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    osc.connect(g).connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.08);

    // Noise buffer for snare crack
    const noiseLen = 0.09;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * noiseLen), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.7;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(volume * 0.6, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + noiseLen);
    src.connect(ng).connect(this.musicGain);
    src.start(time);
    src.stop(time + noiseLen);
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : this.volume.master, this.ctx.currentTime);
    }
    this._save();
  }

  setMasterVolume(val) {
    this.volume.master = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume.master, this.ctx.currentTime);
    }
    this._save();
  }

  setMusicVolume(val) {
    this.volume.music = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.volume.music, this.ctx.currentTime);
    }
    this._save();
  }

  setSfxVolume(val) {
    this.volume.sfx = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.volume.sfx, this.ctx.currentTime);
    }
    this._save();
  }

  _save() {
    try {
      localStorage.setItem('pokefighters_volume', JSON.stringify({
        master: this.volume.master,
        sfx: this.volume.sfx,
        music: this.volume.music,
        muted: this.isMuted
      }));
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
