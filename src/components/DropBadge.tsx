import { useEffect, useState } from "react";
import { getNextDropInstant } from "../podcast";

function until(drop: Date) {
  const ms = drop.getTime() - Date.now();
  if (ms <= 0) return null; // drop passed — badge goes away
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  if (days >= 2) return `${days} days`;
  if (days >= 1) return `1 day ${hours}h`;
  if (hours >= 1) return `${hours}h ${mins % 60}m`;
  const secs = Math.floor(ms / 1000);
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export function DropBadge() {
  const [drop] = useState(() => getNextDropInstant());
  const [label, setLabel] = useState<string | null>(() => until(drop));

  useEffect(() => {
    const t = setInterval(() => {
      const next = until(drop);
      setLabel(next);
      if (next === null) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [drop]);

  if (label === null) return null;

  return (
    <span className="drop-badge" role="status" aria-label={`Episode 1 drops in ${label}`}>
      {label}
    </span>
  );
}
