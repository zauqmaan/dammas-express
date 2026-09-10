/**
 * Ambient background illustration: a 24-hour dial with the two shift windows we
 * actually run highlighted as arcs — 07:00-10:00 (morning pickup) and
 * 17:00-20:00 (evening return). Decorative only; the real timings are stated in
 * text elsewhere on the page.
 *
 * Geometry note: angles are measured clockwise from 12 o'clock, so an hour is
 * 15deg and a point on the rim is (cx + r*sin, cy - r*cos).
 */

const CX = 200;
const CY = 200;
const R = 150;

function rim(hour: number, radius: number) {
  const rad = ((hour * 15 - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)] as const;
}

function arc(fromHour: number, toHour: number, radius: number) {
  const [x1, y1] = rim(fromHour, radius);
  const [x2, y2] = rim(toHour, radius);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ShiftDial({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Rim and inner guide */}
      <circle cx={CX} cy={CY} r={R} stroke="#10B981" strokeWidth="1" />
      <circle
        cx={CX}
        cy={CY}
        r={R - 34}
        stroke="#10B981"
        strokeWidth="1"
        strokeDasharray="2 8"
      />

      {/* Hour ticks — every sixth hour reads longer so the quarters are legible */}
      {HOURS.map((hour) => {
        const long = hour % 6 === 0;
        const [x1, y1] = rim(hour, R);
        const [x2, y2] = rim(hour, R - (long ? 16 : 8));
        return (
          <line
            key={hour}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke="#10B981"
            strokeWidth={long ? 1.5 : 1}
          />
        );
      })}

      {/* Morning shift */}
      <path d={arc(7, 10, R)} stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
      {/* Evening shift */}
      <path d={arc(17, 20, R)} stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />

      {/* Hand sweeping the dial. The hand's own bounding box is centred on its
          midpoint, not the hub, so the origin is pinned in viewBox units. */}
      <g
        className="animate-spin-slow"
        style={{ transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` }}
      >
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - (R - 42)}
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY - (R - 42)} r="3.5" fill="#10B981" />
      </g>

      {/* Hub */}
      <circle cx={CX} cy={CY} r="4" fill="#10B981" />
      <circle cx={CX} cy={CY} r="14" stroke="#10B981" strokeWidth="1" />

      {/* Labels sit inboard of their own arc, at the arc's midpoint angle */}
      <text
        x="285"
        y="274"
        textAnchor="middle"
        fill="#10B981"
        fontSize="14"
        letterSpacing="2"
        fontFamily="ui-monospace, monospace"
      >
        07—10
      </text>
      <text
        x="92"
        y="188"
        textAnchor="middle"
        fill="#F59E0B"
        fontSize="14"
        letterSpacing="2"
        fontFamily="ui-monospace, monospace"
      >
        17—20
      </text>
    </svg>
  );
}
