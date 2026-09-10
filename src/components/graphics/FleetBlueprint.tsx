/**
 * Ambient background illustration: a side elevation of the HiAce-shaped van the
 * fleet runs on, drawn as a workshop blueprint. The wheels turn and the road
 * dashes crawl, so the van reads as moving while standing still.
 *
 * Decorative only — the real vehicle specs live in the fleet cards.
 *
 * Geometry: the ground sits at y=218 and both wheels are r=30, so their centres
 * are on the body's bottom edge (y=188) and the arches are cut straight out of
 * the body outline rather than drawn over it.
 */

const GROUND_Y = 218;
const AXLE_Y = 188;
const WHEEL_R = 30;
const RIM_R = 17;

// Body outline, walked clockwise from the bottom of the nose: up the front,
// along the windscreen and roof, down the rear, then back along the underside
// with a 30r arch lifted out over each wheel.
const BODY =
  "M34 188 V138 L84 102 H352 A10 10 0 0 1 362 112 V188 " +
  "H336 A30 30 0 0 0 276 188 H138 A30 30 0 0 0 78 188 Z";

const WINDOWS = [104, 186, 268];

function Wheel({ cx }: { cx: number }) {
  // 60deg apart, so three lines read as six spokes.
  const spokes = [0, 60, 120].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const dx = RIM_R * Math.cos(rad);
    const dy = RIM_R * Math.sin(rad);
    return {
      deg,
      x1: (cx - dx).toFixed(2),
      y1: (AXLE_Y - dy).toFixed(2),
      x2: (cx + dx).toFixed(2),
      y2: (AXLE_Y + dy).toFixed(2),
    };
  });

  return (
    <>
      <circle cx={cx} cy={AXLE_Y} r={WHEEL_R} stroke="#10B981" strokeWidth="2" />
      {/* fill-box puts the rotation origin on the group's own centre, which is
          the axle — no per-wheel transform-origin to keep in sync. */}
      <g
        className="animate-spin-slow"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle cx={cx} cy={AXLE_Y} r={RIM_R} stroke="#10B981" strokeWidth="1.5" />
        {spokes.map(({ deg, x1, y1, x2, y2 }) => (
          <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="1" />
        ))}
      </g>
      <circle cx={cx} cy={AXLE_Y} r="3" fill="#10B981" />
    </>
  );
}

export default function FleetBlueprint({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 280"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Speed streaks off the back of the van */}
      {[152, 166, 180].map((y, i) => (
        <line
          key={y}
          x1="374"
          y1={y}
          x2={410 - i * 10}
          y2={y}
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-pulse-soft"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      <path d={BODY} stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Windscreen, then the passenger glass down the flank */}
      <path d="M48 142 L88 112 H96 V142 Z" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round" />
      {WINDOWS.map((x) => (
        <rect key={x} x={x} y="112" width="70" height="30" rx="3" stroke="#10B981" strokeWidth="1.5" />
      ))}

      {/* Sliding door and its handle */}
      <line x1="180" y1="142" x2="180" y2="188" stroke="#10B981" strokeWidth="1" />
      <line x1="164" y1="160" x2="174" y2="160" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      {/* Headlight */}
      <rect x="36" y="156" width="12" height="9" rx="2" stroke="#F59E0B" strokeWidth="1.5" />

      <Wheel cx={108} />
      <Wheel cx={306} />

      {/* Road. The 32px dash cycle matches one loop of the dash-flow keyframe. */}
      <line
        x1="-40"
        y1={GROUND_Y}
        x2="460"
        y2={GROUND_Y}
        stroke="#10B981"
        strokeWidth="2"
        strokeDasharray="16 16"
        className="animate-dash-flow"
      />

      {/* Overall-length dimension, broken around its own label */}
      <path d="M34 244 V256 M34 250 H150 M246 250 H362 M362 244 V256" stroke="#F59E0B" strokeWidth="1" />
      <text
        x="198"
        y="255"
        textAnchor="middle"
        fill="#F59E0B"
        fontSize="13"
        letterSpacing="2"
        fontFamily="ui-monospace, monospace"
      >
        15 SEATS
      </text>
    </svg>
  );
}
