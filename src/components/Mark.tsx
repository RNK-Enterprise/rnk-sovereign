import { useId } from "react";

type MarkProps = {
  size?: number;
};

export function Mark({ size = 36 }: MarkProps) {
  const uid = useId().replace(/:/g, "");
  const g = `g-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className="mark-svg"
    >
      <defs>
        <linearGradient id={g} x1="0%" y1="90%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2EE6C8" />
          <stop offset="100%" stopColor="#7CFF6B" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="#070B14" />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14"
        fill="none"
        stroke={`url(#${g})`}
        strokeWidth="1.4"
      />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fill={`url(#${g})`}
        fontFamily="Outfit, system-ui, sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="0.5"
      >
        RNK
      </text>
    </svg>
  );
}
