// Generative sound for the Game of Life banner. Each call to play() gets the
// horizontal positions (0–1) of a few cells born this generation and plays them
// on a two-octave major pentatonic scale: left is low, right is high. Pentatonic
// means any combination of notes sounds consonant, however chaotic the colony.
// Browsers only allow audio after a user gesture, so create the synth from a click.

const PENTATONIC = [0, 2, 4, 7, 9];
const DEGREES = PENTATONIC.length * 2; // two octaves

// how each rule sounds: calm Conway, brighter HighLife, slow Day & Night, frantic Seeds
const VOICES = {
  conway: { wave: 'sine', decay: 1.4, root: 57, cutoff: 2400 },
  highlife: { wave: 'triangle', decay: 1.0, root: 62, cutoff: 3200 },
  daynight: { wave: 'sine', decay: 2.4, root: 50, cutoff: 1600 },
  seeds: { wave: 'square', decay: 0.14, root: 64, cutoff: 1400 },
};

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

export function createSynth() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';

  // a feedback echo gives single notes some space
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.33;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  const wet = ctx.createGain();
  wet.gain.value = 0.28;

  master.connect(filter).connect(ctx.destination);
  filter.connect(delay).connect(feedback).connect(delay);
  delay.connect(wet).connect(ctx.destination);

  function note(midi, voice, velocity, when) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = voice.wave;
    osc.frequency.value = freq(midi);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.exponentialRampToValueAtTime(velocity, when + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, when + voice.decay);
    osc.connect(env).connect(master);
    osc.start(when);
    osc.stop(when + voice.decay + 0.05);
  }

  return {
    // xs: positions of up to a few births; births: how many cells were born in total
    play(xs, births, rule) {
      if (ctx.state !== 'running' || !xs.length) return;
      const voice = VOICES[rule] ?? VOICES.conway;
      filter.frequency.setTargetAtTime(voice.cutoff, ctx.currentTime, 0.2);
      // busier generations are a little louder, split across the notes played
      const velocity = Math.min(0.9, 0.25 + Math.log10(births + 1) / 4) / xs.length;
      xs.forEach((x, k) => {
        const d = Math.min(DEGREES - 1, Math.floor(x * DEGREES));
        const midi = voice.root + 12 * Math.floor(d / PENTATONIC.length) + PENTATONIC[d % PENTATONIC.length];
        note(midi, voice, velocity, ctx.currentTime + k * 0.045); // slight strum
      });
    },
    setOn(on) {
      if (on) ctx.resume();
      master.gain.setTargetAtTime(on ? 0.14 : 0, ctx.currentTime, 0.15);
    },
  };
}
