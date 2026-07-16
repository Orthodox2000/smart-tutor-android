"use client";

import { useEffect, useState } from "react";

type LiveClockProps = {
  label: string;
  timezone?: string;
  className?: string;
};

export function LiveClock({
  label,
  timezone = "Asia/Kolkata",
  className = "",
}: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: timezone,
      }).format(now)
    : "--:--:--";

  const date = now
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: timezone,
      }).format(now)
    : "Loading date";

  return (
    <div className={`surface-soft rounded-3xl p-4 ${className}`}>
      <p className="text-[11px] font-semibold tracking-[0.04em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-heading)]">
        {time}
      </p>
      <p className="mt-2 text-xs tracking-[0.04em] text-[var(--color-muted)]">{date}</p>
    </div>
  );
}
