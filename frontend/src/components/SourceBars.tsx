import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SourceStat } from "../types/feedback";

const SOURCE_LABEL: Record<string, string> = {
  email: "Email",
  app_store: "App Store",
  twitter: "Twitter / X",
  support_ticket: "Support",
  survey: "Survey",
  in_app: "In-app",
};

export default function SourceBars({ sources }: { sources: SourceStat[] }) {
  const data = [...sources]
    .sort((a, b) => b.count - a.count)
    .map((s) => ({ ...s, label: SOURCE_LABEL[s.source] ?? s.source }));

  return (
    <div className="source-card">
      <h3 className="source-card__title">Volume by source</h3>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={80}
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: "var(--font-body)", fontSize: 12, fill: "var(--muted)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-sunken)" }}
            formatter={(value) => [`${value} items`, "Count"]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontSize: 13,
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "var(--brand)" : "var(--brand-bright)"} fillOpacity={i === 0 ? 1 : 0.55 + i * 0.05} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
