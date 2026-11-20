import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { memoryOrder, memories, getImageUrl } from "./data/memories.js";
import Intro from "./components/Intro.jsx";
import MemoryWall from "./components/MemoryWall.jsx";
import CenterStage from "./components/CenterStage.jsx";
import Controls from "./components/Controls.jsx";
import AmbientAudio from "./components/AmbientAudio.jsx";

const PHRASE_INTERVAL = 18_000;
const CHANNEL_SWAP_DELAY = 260;
const CHANNEL_TOTAL = 1_150;

export default function App() {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [entered, setEntered] = useState(false);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [switching, setSwitching] = useState(false);
  const timers = useRef([]);

  const memory = memories[memoryOrder[memoryIndex]];

  const subtitle = useMemo(() => {
    const phrases = [memory.subtitle, ...(memory.phrases ?? [])];
    return phrases[phraseIndex % phrases.length];
  }, [memory, phraseIndex]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!entered || prefersReducedMotion) return undefined;
    const interval = window.setInterval(() => {
      setPhraseIndex((current) => current + 1);
    }, PHRASE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [entered, prefersReducedMotion, memoryIndex]);

  useEffect(() => {
    if (!entered) return undefined;

    const sources = Object.values(memories)
      .flatMap((collection) => collection.images)
      .map((image) => getImageUrl(image));

    const preload = () => {
      sources.forEach((src) => {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
      });
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(preload, 1200);
    return () => window.clearTimeout(id);
  }, [entered]);

  const handleEnter = useCallback(() => {
    setEntered(true);
  }, []);

  const handleNextMemory = useCallback(() => {
    if (!entered || switching) return;

    if (prefersReducedMotion) {
      setMemoryIndex((current) => (current + 1) % memoryOrder.length);
      setPhraseIndex(0);
      return;
    }

    setSwitching(true);
    clearTimers();
    timers.current = [
      window.setTimeout(() => {
        setMemoryIndex((current) => (current + 1) % memoryOrder.length);
        setPhraseIndex(0);
      }, CHANNEL_SWAP_DELAY),
      window.setTimeout(() => {
        setSwitching(false);
        timers.current = [];
      }, CHANNEL_TOTAL),
    ];
  }, [clearTimers, entered, prefersReducedMotion, switching]);

  return (
    <MotionConfig reducedMotion="user">
      <main
        className={[
          "experience",
          entered ? "is-entered" : "is-unentered",
          switching ? "is-switching" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          "--accent": memory.accent,
          "--accent-rgb": memory.accentRgb,
        }}
        data-memory={memory.id}
      >
        <div className="atmosphere" aria-hidden="true" />

        <div className="wall-layer" key={memory.id}>
          <MemoryWall
            memory={memory}
            entered={entered}
            reducedMotion={prefersReducedMotion}
          />
        </div>

        <div className="center-veil" aria-hidden="true" />

        <CenterStage
          memory={memory}
          subtitle={subtitle}
          entered={entered}
          switching={switching}
          reducedMotion={prefersReducedMotion}
        />

        {switching && !prefersReducedMotion ? (
          <div className="channel-change" aria-hidden="true" />
        ) : null}

        <Controls
          memory={memory}
          index={memoryIndex}
          total={memoryOrder.length}
          entered={entered}
          switching={switching}
          onNext={handleNextMemory}
        />

        <AmbientAudio active={entered} />

        <AnimatePresence>
          {!entered ? <Intro key="intro" onEnter={handleEnter} /> : null}
        </AnimatePresence>

        <div className="grain" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
      </main>
    </MotionConfig>
  );
}
