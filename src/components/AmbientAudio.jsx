import { useCallback, useEffect, useRef, useState } from "react";
import "./AmbientAudio.css";

const MASTER_LEVEL = 0.13;
const FADE_IN = 3.6;
const FADE_OUT = 0.9;
const FILE_TIMEOUT = 1800;

/**
 * Builds a very quiet ambient bed. An optional /audio/ambient.mp3 is used when
 * present; otherwise a small Web Audio graph supplies hiss, hum and a soft pad.
 */
function createEngine() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const stopped = [];
  let mode = null;
  let fileTimer = 0;
  let element = null;

  const fade = (target, seconds) => {
    const gain = master.gain;
    const now = ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(target, now + seconds);
  };

  const startProcedural = () => {
    if (mode) return;
    mode = "procedural";

    const seconds = 10;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.022 * white) / 1.022;
      data[i] = last * 3.2;
    }
    // Soft ends keep the loop from clicking at the seam.
    const edge = Math.floor(ctx.sampleRate * 0.06);
    for (let i = 0; i < edge; i += 1) {
      const fadeIn = i / edge;
      const fadeOut = (data.length - 1 - i) / edge;
      const amount = Math.min(fadeIn, fadeOut);
      data[i] *= amount;
      data[data.length - 1 - i] *= amount;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 760;
    lowpass.Q.value = 0.4;

    const hiss = ctx.createBiquadFilter();
    hiss.type = "highpass";
    hiss.frequency.value = 3200;
    hiss.Q.value = 0.5;

    const rain = ctx.createBiquadFilter();
    rain.type = "bandpass";
    rain.frequency.value = 1800;
    rain.Q.value = 0.7;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.085;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.018;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.012;

    noise.connect(lowpass).connect(noiseGain).connect(master);
    noise.connect(hiss).connect(hissGain).connect(master);
    noise.connect(rain).connect(rainGain).connect(master);

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.03;
    droneGain.connect(master);

    const tones = [55, 82.41, 110].map((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 1 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      osc.detune.value = index * 3 - 3;
      const gain = ctx.createGain();
      gain.gain.value = index === 2 ? 0.22 : 0.42;
      osc.connect(gain).connect(droneGain);
      osc.start();
      stopped.push(osc);
      return osc;
    });

    const slowLfo = ctx.createOscillator();
    slowLfo.type = "sine";
    slowLfo.frequency.value = 0.035;
    const slowDepth = ctx.createGain();
    slowDepth.gain.value = 0.016;
    slowLfo.connect(slowDepth).connect(droneGain.gain);
    slowLfo.start();

    const filterLfo = ctx.createOscillator();
    filterLfo.type = "sine";
    filterLfo.frequency.value = 0.055;
    const filterDepth = ctx.createGain();
    filterDepth.gain.value = 240;
    filterLfo.connect(filterDepth).connect(lowpass.frequency);
    filterLfo.start();

    const rainLfo = ctx.createOscillator();
    rainLfo.type = "sine";
    rainLfo.frequency.value = 0.08;
    const rainDepth = ctx.createGain();
    rainDepth.gain.value = 0.008;
    rainLfo.connect(rainDepth).connect(rainGain.gain);
    rainLfo.start();

    noise.start();
    stopped.push(noise, slowLfo, filterLfo, rainLfo);
  };

  const startFile = () => {
    if (mode) return;
    mode = "file";
    window.clearTimeout(fileTimer);
    try {
      const source = ctx.createMediaElementSource(element);
      const gain = ctx.createGain();
      gain.gain.value = 0.42;
      source.connect(gain).connect(master);
      element.play().catch(() => {
        // Autoplay or decode failure: switch to the self-contained bed.
        if (mode === "file") {
          mode = null;
          startProcedural();
        }
      });
    } catch {
      mode = null;
      startProcedural();
    }
  };

  const onError = () => {
    if (mode === "file") {
      mode = null;
      element.pause();
    }
    startProcedural();
  };

  element = new Audio(`${import.meta.env.BASE_URL}audio/ambient.mp3`);
  element.loop = true;
  element.preload = "metadata";
  element.addEventListener("canplay", startFile, { once: true });
  element.addEventListener("error", onError);
  fileTimer = window.setTimeout(() => {
    if (!mode) startProcedural();
  }, FILE_TIMEOUT);
  element.load();

  return {
    ctx,
    fade,
    resume: () => ctx.resume(),
    get isRunning() {
      return ctx.state === "running";
    },
    dispose() {
      window.clearTimeout(fileTimer);
      element.removeEventListener("canplay", startFile);
      element.removeEventListener("error", onError);
      element.pause();
      element.removeAttribute("src");
      element.load();
      stopped.forEach((node) => {
        try {
          node.stop();
        } catch {
          /* already stopped */
        }
      });
      master.disconnect();
      ctx.close().catch(() => {});
    },
  };
}

export default function AmbientAudio({ active }) {
  const [enabled, setEnabled] = useState(true);
  const engineRef = useRef(null);
  const enabledRef = useRef(enabled);
  const retryRef = useRef(null);

  useEffect(() => {
    enabledRef.current = enabled;
    const engine = engineRef.current;
    if (!engine || !active) return;
    engine.fade(enabled ? MASTER_LEVEL : 0, enabled ? FADE_IN : FADE_OUT);
  }, [enabled, active]);

  useEffect(() => {
    if (!active) return undefined;

    const engine = createEngine();
    if (!engine) return undefined;
    engineRef.current = engine;

    engine.resume().catch(() => {});
    engine.fade(enabledRef.current ? MASTER_LEVEL : 0, FADE_IN);

    function removeRetry() {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      retryRef.current = null;
    }

    function retry() {
      if (engine.isRunning) {
        removeRetry();
        return;
      }
      engine.resume().then(() => {
        engine.fade(enabledRef.current ? MASTER_LEVEL : 0, 2.4);
      }).catch(() => {});
      removeRetry();
    }

    if (!engine.isRunning) {
      retryRef.current = removeRetry;
      window.addEventListener("pointerdown", retry);
      window.addEventListener("keydown", retry);
    }

    return () => {
      if (retryRef.current) {
        retryRef.current();
        retryRef.current = null;
      }
      engine.dispose();
      engineRef.current = null;
    };
  }, [active]);

  const toggle = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  if (!active) return null;

  return (
    <button
      type="button"
      className={`ambient-audio${enabled ? " is-on" : " is-off"}`}
      onClick={toggle}
      aria-label={enabled ? "Mute ambient sound" : "Play ambient sound"}
      aria-pressed={enabled}
      title={enabled ? "Mute ambient sound" : "Play ambient sound"}
    >
      <span className="ambient-audio__note" aria-hidden="true">
        ♫
      </span>
      <span className="ambient-audio__slash" aria-hidden="true" />
    </button>
  );
}
