/**
 * Ambient background illustration: a transit-diagram style line running through
 * five pickup points down to the Al Quoz terminal. Drawn with the 90/45-degree
 * turns real transit maps use, so every stop lands on an exact coordinate.
 * Decorative only — the routes themselves are listed in the cards.
 */

const LINE = "M50 30 V140 L140 230 V340 L60 420 V500";

const STOPS = [
  [50, 30],
  [50, 140],
  [140, 230],
  [140, 340],
  [60, 420],
] as const;

const TERMINAL = [60, 500] as const;

export default function RouteSchematic({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 560"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Casing under the line keeps stop markers readable where they overlap */}
      <path d={LINE} stroke="#030712" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
      <path d={LINE} stroke="#10B981" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

      {/* A shuttle running the line: one short dash travelling the whole path.
          10+22 keeps the dash cycle at 32, one loop of the dash-flow keyframe. */}
      <path
        d={LINE}
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="10 22"
        className="animate-dash-flow"
      />

      {STOPS.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="7"
          fill="#030712"
          stroke="#10B981"
          strokeWidth="2.5"
        />
      ))}

      {/* Direction of travel, dropped between the second and third stop */}
      <path
        d="M133 272 L140 284 L147 272"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal, with a signal leaving it */}
      <circle
        cx={TERMINAL[0]}
        cy={TERMINAL[1]}
        r="30"
        stroke="#F59E0B"
        strokeWidth="2"
        className="animate-ripple"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx={TERMINAL[0]} cy={TERMINAL[1]} r="20" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx={TERMINAL[0]} cy={TERMINAL[1]} r="11" fill="#030712" stroke="#F59E0B" strokeWidth="3" />
      <circle cx={TERMINAL[0]} cy={TERMINAL[1]} r="4" fill="#F59E0B" />

      <text
        x="94"
        y="505"
        fill="#F59E0B"
        fontSize="14"
        letterSpacing="3"
        fontFamily="ui-monospace, monospace"
      >
        AL QUOZ
      </text>
    </svg>
  );
}
