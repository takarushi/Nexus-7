// src/sounds/audioEngine.js
// SFX generated programmatically via Web Audio API (blips, sweeps, noise).
// Intro music is a static MP3 streamed via HTMLAudioElement.
// Every oscillator uses an explicit gain envelope (attack + exponential decay)
// to avoid click/pop artifacts that happen when gain jumps abruptly.

import introMusicFile from "./Boss_Fight_Rising.mp3";

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

// Resume the AudioContext if it was created before the user gesture.
// Browsers suspend contexts created without a gesture; ctx.resume() requires
// a gesture to succeed. We call this at the top of every play fn as a cheap
// no-op safety net.
function ensureCtx() {
  const ac = getCtx();
  if (ac.state === "suspended") ac.resume().catch(() => { });
  return ac;
}

// Auto-unlock on the first user gesture anywhere on the page, so sounds
// queued during the intro (before a click) start working once the user
// interacts.
if (typeof window !== "undefined") {
  const unlock = () => {
    const ac = getCtx();
    if (ac.state === "suspended") ac.resume().catch(() => { });
  };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
    document.addEventListener(ev, unlock, { once: true, capture: true })
  );
}

// Schedule an oscillator with a smooth envelope. Returns nothing.
function blip(ac, { type, freq, peak, attack = 0.004, decay, startAt = 0 }) {
  const now = ac.currentTime + startAt;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  if (typeof freq === "function") freq(o, now);
  else o.frequency.value = freq;
  o.connect(g);
  g.connect(ac.destination);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  o.start(now);
  o.stop(now + decay + 0.02);
}

// Soft mechanical key click — triangle with short envelope, no pops
export function playKeyClick() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "triangle",
      freq: 620 + Math.random() * 120,
      peak: 0.05,
      attack: 0.002,
      decay: 0.035,
    });
  } catch (_) { }
}

// Success jingle — ascending arp
export function playSuccess() {
  try {
    const ac = ensureCtx();
    [440, 554, 659, 880].forEach((f, i) => {
      blip(ac, { type: "sine", freq: f, peak: 0.12, decay: 0.32, startAt: i * 0.1 });
    });
  } catch (_) { }
}

// Error buzz — low sawtooth
export function playError() {
  try {
    const ac = ensureCtx();
    blip(ac, { type: "sawtooth", freq: 120, peak: 0.15, decay: 0.42 });
  } catch (_) { }
}

// Trap alarm — rising siren, three pulses
export function playTrap() {
  try {
    const ac = ensureCtx();
    for (let i = 0; i < 3; i++) {
      blip(ac, {
        type: "sawtooth",
        freq: (o, t) => {
          o.frequency.setValueAtTime(300, t);
          o.frequency.linearRampToValueAtTime(600, t + 0.2);
        },
        peak: 0.2,
        decay: 0.24,
        startAt: i * 0.25,
      });
    }
  } catch (_) { }
}

// Game over — descending doom
export function playGameOver() {
  try {
    const ac = ensureCtx();
    [400, 300, 200, 100].forEach((f, i) => {
      blip(ac, { type: "sawtooth", freq: f, peak: 0.18, decay: 0.52, startAt: i * 0.3 });
    });
  } catch (_) { }
}

// Victory fanfare
export function playVictory() {
  try {
    const ac = ensureCtx();
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
      blip(ac, { type: "sine", freq: f, peak: 0.14, decay: 0.28, startAt: i * 0.15 });
    });
  } catch (_) { }
}

// EMP — white noise burst with envelope
export function playEMP() {
  try {
    const ac = ensureCtx();
    const now = ac.currentTime;
    const bufferSize = ac.sampleRate * 0.8;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = buffer;
    src.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.3, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    src.start(now);
    src.stop(now + 0.85);
  } catch (_) { }
}

// ===== Intro sounds =====

// "Booting up" — short noise burst with an ascending tone on top
export function playIntroBoot() {
  try {
    const ac = ensureCtx();
    const now = ac.currentTime;

    // 1. Ruido de fondo (el "grano" del sistema)
    // Disparamos ráfagas cortas de 'sawtooth' muy graves para el "ruido"
    for (let i = 0; i < 8; i++) {
      blip(ac, {
        type: "sawtooth",
        freq: 60 + (i * 10),
        peak: 0.03,
        attack: 0.01,
        decay: 0.05,
        // CORRECCIÓN: Usamos startAt para crear el redoble
        startAt: i * 0.05
      });
    }

    // 2. El tono ascendente principal (el "lead")
    blip(ac, {
      type: "square",
      freq: (o, t) => {
        // Empezamos el tono después de las primeras ráfagas de ruido
        o.frequency.setValueAtTime(200, t + 0.2);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.6);
      },
      peak: 0.06,
      attack: 0.1,
      decay: 0.6, // Un poco más de decay para que no se corte antes de tiempo
      startAt: 0.2 // Lanzamos el blip completo con el desfase
    });
  } catch (err) {
    console.warn("Error en audio intro:", err);
  }
}

// Short beep on every narrative line that appears
export function playIntroLine() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "sine",
      freq: 280 + Math.random() * 100,
      peak: 0.07,
      attack: 0.005,
      decay: 0.12,
    });
  } catch (_) { }
}

// Two-note chime when the intro finishes and the button is ready
export function playIntroReady() {
  try {
    const ac = ensureCtx();
    [660, 880].forEach((f, i) => {
      blip(ac, { type: "sine", freq: f, peak: 0.1, decay: 0.35, startAt: i * 0.1 });
    });
  } catch (_) { }
}

// Looping intro music played from an MP3 asset. Returns stop() that fades
// out and cleans up. Handles three edge cases:
//   1. Autoplay blocked before first gesture — retry on pointerdown.
//   2. stop() called before audio ever started — don't accidentally play
//      it on the next screen via the deferred interaction handler.
//   3. stop() called twice — idempotent, no double fades.
let currentMusic = null;
// Volume persists across sessions so the user's preference is remembered.
const MUSIC_VOLUME_KEY = "nexus7.introMusicVolume";
let introMusicVolume = (() => {
  try {
    const saved = parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY));
    return Number.isFinite(saved) ? Math.max(0, Math.min(1, saved)) : 0.4;
  } catch (_) {
    return 0.4;
  }
})();

export function getIntroMusicVolume() {
  return introMusicVolume;
}

export function setIntroMusicVolume(v) {
  const clamped = Math.max(0, Math.min(1, Number(v) || 0));
  introMusicVolume = clamped;
  try { localStorage.setItem(MUSIC_VOLUME_KEY, String(clamped)); } catch (_) {}
  if (currentMusic && !currentMusic.stopped) {
    currentMusic.audio.volume = clamped;
  }
}

export function playIntroMusic() {
  try {
    // Replace any existing instance (e.g. hot reload, fast restart)
    if (currentMusic) {
      currentMusic.audio.pause();
      currentMusic = null;
    }

    const audio = new Audio(introMusicFile);
    audio.loop = true;
    audio.volume = introMusicVolume;

    const state = { audio, stopped: false, startTimer: null, pointerHandler: null };
    currentMusic = state;

    // Try to play 1s after mount. Browsers without prior engagement with the
    // origin will reject play() — in that case we fall back to the first
    // user interaction (the docs call this a "user activation gesture").
    const tryPlay = () => audio.play().catch((err) => {
      console.warn("[audioEngine] intro music autoplay blocked, will retry on interaction:", err?.message || err);
      const onInteraction = () => {
        document.removeEventListener("pointerdown", onInteraction);
        document.removeEventListener("keydown", onInteraction);
        state.pointerHandler = null;
        if (!state.stopped) audio.play().catch(() => {});
      };
      state.pointerHandler = onInteraction;
      document.addEventListener("pointerdown", onInteraction, { once: true });
      document.addEventListener("keydown", onInteraction, { once: true });
    });

    state.startTimer = setTimeout(() => {
      state.startTimer = null;
      if (!state.stopped) tryPlay();
    }, 1000);

    return () => {
      if (state.stopped) return;
      state.stopped = true;
      if (state.startTimer) {
        clearTimeout(state.startTimer);
        state.startTimer = null;
      }
      if (state.pointerHandler) {
        document.removeEventListener("pointerdown", state.pointerHandler);
        document.removeEventListener("keydown", state.pointerHandler);
        state.pointerHandler = null;
      }
      // Fade from current volume to 0 over ~350ms, then pause.
      const fade = setInterval(() => {
        const next = audio.volume - 0.05;
        if (next > 0) {
          audio.volume = next;
        } else {
          audio.volume = 0;
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fade);
          if (currentMusic === state) currentMusic = null;
        }
      }, 50);
    };
  } catch (err) {
    console.error("[audioEngine] intro music failed:", err);
    return () => {};
  }
}

// Transition sweep — plays when the player clicks "INICIAR INFILTRACIÓN"
export function playIntroStart() {
  try {
    const ac = ensureCtx();
    blip(ac, {
      type: "sawtooth",
      freq: (o, t) => {
        o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.4);
        o.frequency.exponentialRampToValueAtTime(1400, t + 0.6);
      },
      peak: 0.13,
      attack: 0.03,
      decay: 0.7,
    });
  } catch (_) { }
}
