/**
 * Ambient background illustration: a Dubai skyline in outline, sitting on the
 * horizon the fleet drives along. Windows light up on a stagger and the spire's
 * beacon breathes, so the block never reads as a flat sticker.
 *
 * Decorative only. Every silhouette is stylised — none is a specific building.
 */

const HORIZON = 200;

// Left to right along the horizon. The tapered spire in the middle is the tall
// anchor; everything else steps down away from it.
const BUILDINGS = [
  "M20 200 V110 H66 V200",
  "M74 200 V60 H108 V200",
  "M132 200 L140 70 L150 18 L160 70 L168 200 Z",
  "M186 200 V104 H206 V88 H228 V104 H238 V200",
  "M252 200 V60 L290 40 V200",
  "M304 200 V104 H364 V200",
  "M376 200 V68 H416 V200",
  "M428 200 V116 H492 V200",
];

// Lit windows, as [x, y] pairs on the faces above.
const WINDOWS = [
  [32, 128], [46, 128], [32, 150], [46, 150], [32, 172],
  [86, 82], [86, 104], [86, 126], [96, 82], [96, 126],
  [196, 122], [212, 122], [196, 148], [212, 148], [228, 122],
  [262, 92], [276, 92], [262, 120], [276, 120], [262, 148],
  [318, 126], [336, 126], [350, 126], [318, 158], [336, 158],
  [386, 92], [402, 92], [386, 122], [402, 122], [386, 152],
  [442, 138], [462, 138], [478, 138], [442, 168], [462, 168],
] as const;

export default function CitySkyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {BUILDINGS.map((d) => (
        <path key={d} d={d} stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
      ))}

      {WINDOWS.map(([x, y], i) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="6"
          height="9"
          fill="#10B981"
          className="animate-pulse-soft"
          // Prime-ish step so neighbouring windows never light in step.
          style={{ animationDelay: `${(i % 7) * 0.43}s` }}
        />
      ))}

      {/* Spire beacon */}
      <circle
        cx="150"
        cy="14"
        r="11"
        stroke="#F59E0B"
        strokeWidth="1.5"
        className="animate-ripple"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx="150" cy="14" r="3.5" fill="#F59E0B" className="animate-pulse-soft" />

      {/* Horizon, with the road running along it */}
      <line x1="0" y1={HORIZON} x2="520" y2={HORIZON} stroke="#10B981" strokeWidth="2" />
      <line
        x1="-40"
        y1={HORIZON + 16}
        x2="560"
        y2={HORIZON + 16}
        stroke="#F59E0B"
        strokeWidth="2"
        strokeDasharray="16 16"
        className="animate-dash-flow"
      />
    </svg>
  );
}
