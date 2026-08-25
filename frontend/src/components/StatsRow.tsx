import type { FeedbackStats } from "../types/feedback";
import StatCard from "./StatCard";

export default function StatsRow({ stats }: { stats: FeedbackStats }) {
  const catMix = stats.categories.map((c) => c.percentage / 100);
  const bugPct = stats.categories.find((c) => c.category === "Bug")?.percentage ?? 0;
  const praisePct = stats.categories.find((c) => c.category === "Praise")?.percentage ?? 0;
  const featurePct = stats.categories.find((c) => c.category === "Feature Request")?.percentage ?? 0;

  return (
    <div className="stats-row">
      <StatCard
        label="Total feedback"
        value={String(stats.total)}
        detail="all sources, last 14 days"
        barValues={catMix}
      />
      <StatCard
        label="Bug reports"
        value={`${bugPct}%`}
        detail="of total volume"
        barValues={[bugPct / 100, 0.4, 0.6, 0.3]}
        color="var(--cat-bug)"
      />
      <StatCard
        label="Praise rate"
        value={`${praisePct}%`}
        detail="of total volume"
        barValues={[0.3, 0.5, praisePct / 100, 0.6]}
        color="var(--cat-praise)"
      />
      <StatCard
        label="Feature requests"
        value={`${featurePct}%`}
        detail="of total volume"
        barValues={[0.4, featurePct / 100, 0.5, 0.7]}
        color="var(--cat-feature)"
      />
    </div>
  );
}
