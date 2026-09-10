/**
 * Ambient background illustration: the monthly commute pass, drawn as a ticket
 * with a tear-off stub. The day grid lights up one dot at a time and the stub's
 * validation stamp turns, so the pass reads as in-use rather than printed.
 *
 * Decorative only — actual pricing and terms are in the service cards.
 */

// Two rows of ten: the rides drawn down over a month.
const DAY_COLS = 10;
const DAYS = [104, 132].flatMap((y, row) =>
  Array.from({ length: DAY_COLS }, (_, col) => ({
    x: 36 + col * 20,
    y,
    index: row * DAY_COLS + col,
  }))
);

// Where the stub tears off.
const PERF_X = 252;
const STAMP = { cx: 301, cy: 74, r: 26 } as const;

export default function MonthlyPass({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 210"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="10" y="10" width="340" height="190" rx="14" stroke="#10B981" strokeWidth="2" />

      {/* Perforation, with a punched notch top and bottom so the tear line reads */}
      <line
        x1={PERF_X}
        y1="10"
        x2={PERF_X}
        y2="200"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />
      <circle cx={PERF_X} cy="10" r="7" fill="#030712" stroke="#10B981" strokeWidth="1.5" />
      <circle cx={PERF_X} cy="200" r="7" fill="#030712" stroke="#10B981" strokeWidth="1.5" />

      <text
        x="36"
        y="52"
        fill="#F59E0B"
        fontSize="14"
        letterSpacing="3"
        fontFamily="ui-monospace, monospace"
      >
        MONTHLY PASS
      </text>
      <text
        x="36"
        y="76"
        fill="#10B981"
        fillOpacity="0.75"
        fontSize="11"
        letterSpacing="2"
        fontFamily="ui-monospace, monospace"
      >
        AL QUOZ · FIXED SHIFT SEAT
      </text>

      {/* The stagger runs along the row, so the light travels left to right. */}
      {DAYS.map(({ x, y, index }) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="3.5"
          fill={index > 17 ? "#F59E0B" : "#10B981"}
          className="animate-pulse-soft"
          style={{ animationDelay: `${index * 0.12}s` }}
        />
      ))}

      {/* Route line under the grid — 4+12 keeps the dash cycle at 16, a clean
          divisor of the dash-flow loop. */}
      <line
        x1="36"
        y1="164"
        x2="228"
        y2="164"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeDasharray="4 12"
        className="animate-dash-flow"
      />

      {/* Stub: a turning validation stamp over a static tick */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }} className="animate-spin-slow">
        <circle
          cx={STAMP.cx}
          cy={STAMP.cy}
          r={STAMP.r}
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />
      </g>
      <circle cx={STAMP.cx} cy={STAMP.cy} r={STAMP.r - 8} stroke="#F59E0B" strokeWidth="1" />
      <path
        d="M291 74 L298 82 L312 66"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x="301"
        y="150"
        textAnchor="middle"
        fill="#10B981"
        fontSize="11"
        letterSpacing="4"
        fontFamily="ui-monospace, monospace"
      >
        VALID
      </text>
      <line x1="272" y1="168" x2="330" y2="168" stroke="#10B981" strokeWidth="1" />
      <line x1="272" y1="176" x2="318" y2="176" stroke="#10B981" strokeWidth="1" />
    </svg>
  );
}
