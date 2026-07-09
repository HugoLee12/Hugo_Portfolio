class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private ambientLfoGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private initialized = false;
  private unlocked = false;
  private unlockCleanup: (() => void) | null = null;
  private muted = this.readMutedPreference();
  private muteListeners = new Set<(muted: boolean) => void>();

  private getContext() {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    return this.ctx;
  }

  private readMutedPreference() {
    if (typeof window === "undefined") return false;

    try {
      return window.localStorage.getItem("hugo-portfolio-audio-muted") === "true";
    } catch (e) {
      return false;
    }
  }

  private persistMutedPreference() {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        "hugo-portfolio-audio-muted",
        String(this.muted),
      );
    } catch (e) {}
  }

  private getOutputNode() {
    const ctx = this.getContext();
    if (!ctx) return null;

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
      this.applyMuteState();
    }

    return this.masterGain;
  }

  private applyMuteState() {
    if (!this.masterGain || !this.ctx) return;

    this.masterGain.gain.setTargetAtTime(
      this.muted ? 0 : 1,
      this.ctx.currentTime,
      0.015,
    );
  }

  isMuted() {
    return this.muted;
  }

  subscribeMuted(listener: (muted: boolean) => void) {
    this.muteListeners.add(listener);
    return () => {
      this.muteListeners.delete(listener);
    };
  }

  setMuted(muted: boolean) {
    if (this.muted === muted) return this.muted;

    this.muted = muted;
    this.persistMutedPreference();
    this.applyMuteState();
    this.muteListeners.forEach((listener) => listener(this.muted));

    if (!this.muted) {
      this.unlock().catch(() => {});
    }

    return this.muted;
  }

  toggleMuted() {
    return this.setMuted(!this.muted);
  }

  init() {
    if (this.initialized) return;

    try {
      const ctx = this.getContext();
      const output = this.getOutputNode();
      if (!ctx || !output) return;

      this.ambientOsc = ctx.createOscillator();
      this.ambientOsc.type = "sine";
      this.ambientOsc.frequency.value = 50;

      this.ambientLfo = ctx.createOscillator();
      this.ambientLfo.type = "sine";
      this.ambientLfo.frequency.value = 2;
      this.ambientLfoGain = ctx.createGain();
      this.ambientLfoGain.gain.value = 10;
      
      this.ambientLfo.connect(this.ambientLfoGain);
      this.ambientLfoGain.connect(this.ambientOsc.frequency);
      this.ambientLfo.start();

      this.ambientFilter = ctx.createBiquadFilter();
      this.ambientFilter.type = "lowpass";
      this.ambientFilter.frequency.value = 100;

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.value = 0.5;

      this.ambientOsc.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(output);

      this.ambientOsc.start();
      this.initialized = true;

      this.unlock().catch((e) => console.warn("Failed initial resume:", e));
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  }

  async unlock() {
    const ctx = this.getContext();
    const output = this.getOutputNode();
    if (!ctx || !output) return false;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (ctx.state === "running" && !this.unlocked) {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(output);
      source.start(0);
      this.unlocked = true;
    }

    if (this.unlocked) {
      this.clearUnlockListeners();
    }

    return this.unlocked;
  }

  resume() {
    if (this.muted) return;

    if (this.ctx?.state === "suspended") {
      this.ctx.resume().catch((e) => console.warn("Failed to resume:", e));
    }
  }

  startPortalHoverDrone() {
    if (this.muted) return null;

    const ctx = this.getContext();
    const output = this.getOutputNode();
    if (!ctx || !output) return null;

    this.unlock().catch(() => {});

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);
    gainNode.connect(output);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(65.41, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(196.0, ctx.currentTime);
    osc2.detune.setValueAtTime(5, ctx.currentTime);

    const osc3 = ctx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(523.25, ctx.currentTime);

    const osc3Gain = ctx.createGain();
    osc3Gain.gain.value = 0.05;
    osc3.connect(osc3Gain);
    osc3Gain.connect(gainNode);

    osc1.connect(gainNode);
    osc2.connect(gainNode);

    const oscillators = [osc1, osc2, osc3];
    oscillators.forEach((osc) => osc.start());

    return {
      stop: () => {
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

        window.setTimeout(() => {
          oscillators.forEach((osc) => {
            try {
              osc.stop();
            } catch (e) {
              // Oscillators can already be stopped during fast hover churn.
            }
            try {
              osc.disconnect();
            } catch (e) {}
          });
          try {
            osc3Gain.disconnect();
          } catch (e) {}
          try {
            gainNode.disconnect();
          } catch (e) {}
        }, 500);
      },
    };
  }

  setAmbientIntensity(intensity: number) {
    if (this.muted) return;
    if (!this.initialized || !this.ambientFilter || !this.ambientGain) return;

    const targetFreq = 100 + intensity * 200;
    const targetGain = 0.4 + intensity * 0.4;

    this.ambientFilter.frequency.setTargetAtTime(
      targetFreq,
      this.ctx!.currentTime,
      0.5,
    );
    this.ambientGain.gain.setTargetAtTime(
      targetGain,
      this.ctx!.currentTime,
      0.5,
    );
  }

  private ensureAwake() {
    if (this.muted) return;
    if (!this.ctx || this.ctx.state !== "suspended") return;

    this.ctx.resume().catch((e) => console.warn("Failed to wake audio context:", e));
    if (this.unlockCleanup) return;
      
    const unlock = () => {
      this.unlock().catch(() => {});
    };
      
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);

    this.unlockCleanup = () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      this.unlockCleanup = null;
    };
  }

  private clearUnlockListeners() {
    this.unlockCleanup?.();
  }

  stopAmbient() {
    if (!this.initialized) return;
    try {
      if (this.ambientOsc) {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientOsc = null;
      }
      if (this.ambientLfo) {
        this.ambientLfo.stop();
        this.ambientLfo.disconnect();
        this.ambientLfo = null;
      }
      if (this.ambientLfoGain) {
        this.ambientLfoGain.disconnect();
        this.ambientLfoGain = null;
      }
      if (this.ambientFilter) {
        this.ambientFilter.disconnect();
        this.ambientFilter = null;
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
      this.initialized = false;
    } catch (e) {
      console.warn("Failed to stop ambient sound:", e);
    }
  }

  playBleep(pitch = 800, duration = 0.05, vol = 0.1) {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

    osc.frequency.exponentialRampToValueAtTime(
      pitch * 0.8,
      this.ctx.currentTime + duration,
    );

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playTyping() {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(
      100 + Math.random() * 500,
      this.ctx.currentTime,
    );

    filter.type = "bandpass";
    filter.frequency.value = 4000;

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playScan() {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";

    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      2000,
      this.ctx.currentTime + 0.3,
    );

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playSuckIn() {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(50, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.8, this.ctx.currentTime + 1.5);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 2.0);

    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(this.ctx.currentTime);
    lfo.stop(this.ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 2.0);
  }

  playZap() {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.1);

    filter.type = "highpass";
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    const lfo = this.ctx.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = 40;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 1.0;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start(this.ctx.currentTime);
    lfo.stop(this.ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playPowerDown() {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playExplosion() {
    if (!this.ctx || this.muted) return;
    this.ensureAwake();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + 1.5,
    );

    gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(this.getOutputNode() || this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 2.0);
  }
}

export const audioManager = new AudioManager();
