"use client";

import { useEffect, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function band(progress: number, start: number, peak: number, end: number) {
  if (progress <= start || progress >= end) {
    return 0;
  }

  if (progress <= peak) {
    return (progress - start) / Math.max(peak - start, 0.001);
  }

  return 1 - (progress - peak) / Math.max(end - peak, 0.001);
}

export function ScrollBackdrop() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0
          ? clamp(window.scrollY / scrollableHeight, 0, 1)
          : 0;

      setProgress(nextProgress);
      frame = 0;
    };

    const onScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const first = band(progress, 0, 0.18, 0.42);
  const second = band(progress, 0.2, 0.5, 0.78);
  const third = band(progress, 0.56, 0.84, 1.02);
  const scan = band(progress, 0.02, 0.5, 0.98);
  const scanOffset = progress * 78;

  return (
    <div className="scroll-backdrop" aria-hidden="true">
      <div
        className="scroll-backdrop-grid"
        style={{
          opacity: 0.12 + scan * 0.12,
        }}
      />
      <div
        className="scroll-backdrop-layer scroll-backdrop-layer-a"
        style={{
          opacity: 0.22 + first * 0.34,
          transform: `translate3d(0, ${first * -2.5}%, 0)`,
        }}
      />
      <div
        className="scroll-backdrop-layer scroll-backdrop-layer-b"
        style={{
          opacity: second * 0.38,
          transform: `translate3d(0, ${second * -3.5}%, 0)`,
        }}
      />
      <div
        className="scroll-backdrop-layer scroll-backdrop-layer-c"
        style={{
          opacity: third * 0.4,
          transform: `translate3d(0, ${third * -4.5}%, 0)`,
        }}
      />
      <div
        className="scroll-backdrop-scan"
        style={{
          opacity: scan * 0.82,
          transform: `translate3d(0, ${scanOffset}vh, 0) scale(${0.96 + scan * 0.05})`,
        }}
      />
    </div>
  );
}
