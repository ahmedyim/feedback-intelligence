interface SignalBarsProps {
  /** Values 0-1, one bar per entry */
  values: number[];
  color?: string;
  height?: number;
}

/**
 * Fineto's signature motif: feedback-as-signal, rendered as a small
 * equalizer. Reused at different scales throughout the dashboard so the
 * "raw noise -> readable signal" idea stays visually consistent.
 */
export default function SignalBars({ values, color = "var(--brand-bright)", height = 28 }: SignalBarsProps) {
  return (
    <div className="signal-bars" style={{ height }} aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className="signal-bars__bar"
          style={{
            height: `${Math.max(v, 0.08) * 100}%`,
            background: color,
          }}
        />
      ))}
    </div>
  );
}
