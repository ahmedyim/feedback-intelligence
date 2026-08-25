import SignalBars from "./SignalBars";

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  barValues: number[];
  color?: string;
}

export default function StatCard({ label, value, detail, barValues, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <SignalBars values={barValues} color={color} height={22} />
      </div>
      <div className="stat-card__value">{value}</div>
      {detail && <div className="stat-card__detail">{detail}</div>}
    </div>
  );
}
