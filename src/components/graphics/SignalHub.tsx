/**
 * Ambient background illustration: the Al Quoz hub broadcasting to the pickup
 * zones around it. Three rings leave the centre on a stagger — one keyframe,
 * three delays — over a slowly turning coverage ring.
 *
 * Decorative only; the served areas are named in the route marquee and cards.
 */

const CX = 200;
const CY = 200;

// Pickup markers on the coverage ring, at the four diagonals.
const SPOKE_R = 118;
const PINS = [45, 135, 225, 315].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    deg,
    x: +(CX + SPOKE_R * Math.cos(rad)).toFixed(2),
    y: +(CY + SPOKE_R * Math.sin(rad)).toFixed(2),
  };
});

// 4s animation split three ways.
const RING_DELAYS = [0, 1.33, 2.66];

export default function SignalHub({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Expanding signal. fill-box scales each ring about its own centre, which
          is already the hub. */}
      {RING_DELAYS.map((delay) => (
        <circle
          key={delay}
          cx={CX}
          cy={CY}
          r="160"
          stroke="#10B981"
          strokeWidth="2"
          className="animate-ripple"
          style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${delay}s` }}
        />
      ))}

      {/* Coverage ring, turning */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }} className="animate-spin-slow">
        <circle cx={CX} cy={CY} r="160" stroke="#10B981" strokeWidth="1" strokeDasharray="3 13" />
      </g>

      <circle cx={CX} cy={CY} r={SPOKE_R} stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" />

      {PINS.map(({ deg, x, y }) => (
        <g key={deg}>
          <line
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 12"
            className="animate-dash-flow"
          />
          <circle cx={x} cy={y} r="6" fill="#030712" stroke="#10B981" strokeWidth="2" />
        </g>
      ))}

      {/* Hub */}
      <circle cx={CX} cy={CY} r="26" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 6" />
      <circle cx={CX} cy={CY} r="14" fill="#030712" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx={CX} cy={CY} r="5" fill="#F59E0B" />

      <text
        x={CX}
        y="256"
        textAnchor="middle"
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
