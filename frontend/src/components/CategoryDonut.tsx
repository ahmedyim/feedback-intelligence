import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { CategoryStat } from "../types/feedback";

const COLOR: Record<string, string> = {
  Bug: "#D9482B",
  "Feature Request": "#2F6FB2",
  Complaint: "#C4841B",
  Praise: "#1F6B3A",
};

export default function CategoryDonut({ categories }: { categories: CategoryStat[] }) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="donut-card">
      <div className="donut-card__chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categories}
              dataKey="count"
              nameKey="category"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              strokeWidth={0}
            >
              {categories.map((c) => (
                <Cell key={c.category} fill={COLOR[c.category]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => [`${value} items`, entry?.payload?.category as string]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                fontFamily: "var(--font-body)",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-card__center">
          <span className="donut-card__total">{total}</span>
          <span className="donut-card__total-label">total</span>
        </div>
      </div>

      <ul className="donut-card__legend">
        {categories.map((c) => (
          <li key={c.category}>
            <span className="donut-card__swatch" style={{ background: COLOR[c.category] }} />
            <span className="donut-card__legend-name">{c.category}</span>
            <span className="donut-card__legend-pct">{c.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
