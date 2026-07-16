"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CountUpValueProps = {
  value: string;
  className?: string;
};

function parseValue(value: string) {
  const match = value.match(/(\d+)(\D*)/);

  if (!match) {
    return { target: 0, prefix: "", suffix: value };
  }

  const [, digits, suffix] = match;
  const prefix = value.slice(0, match.index ?? 0);

  return {
    target: Number(digits),
    prefix,
    suffix,
  };
}

export function CountUpValue({
  value,
  className = "",
}: CountUpValueProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const parts = useMemo(() => parseValue(value), [value]);

  useEffect(() => {
    const node = ref.current;

    if (!node || hasAnimated || parts.target <= 0) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setHasAnimated(true);
        observer.disconnect();

        const duration = 1200;
        const start = performance.now();

        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(parts.target * eased);

          setDisplayValue(`${parts.prefix}${current}${parts.suffix}`);

          if (progress < 1) {
            window.requestAnimationFrame(animate);
          } else {
            setDisplayValue(value);
          }
        };

        window.requestAnimationFrame(animate);
      },
      {
        threshold: 0.45,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasAnimated, parts.prefix, parts.suffix, parts.target, value]);

  return (
    <p
      ref={ref}
      className={className}
    >
      {displayValue}
    </p>
  );
}
