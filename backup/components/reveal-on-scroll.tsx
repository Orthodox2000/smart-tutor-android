"use client";

import { useEffect, useRef, useState } from "react";

type RevealOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
};

export function RevealOnScroll({
  children,
  className = "",
  delayMs = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? "reveal-on-scroll-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
