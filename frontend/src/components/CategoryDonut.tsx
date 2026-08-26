import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLOR: Record<string, string> = {
  Bug: "#D9482B",
  "Feature Request": "#2F6FB2",
  Complaint: "#C4841B",
  Praise: "#1F6B3A",
};

export interface CategoryDonutProps {
  // Support both dictionary record from backend AND standard array format
  categories?: Record<string, number> | Array<{ category: string; count: number; percentage?: number }>;
}

export default function CategoryDonut({ categories }: CategoryDonutProps) {
  // Safe normalization: convert object payload to structured array
  const categoryList = useMemo(() => {
    if (!categories) return [];

    if (Array.isArray(categories)) {
      const grandTotal = categories.reduce((sum, c) => sum + (c.count || 0), 0);
      return categories.map((c) => ({
        category: c.category,
        count: c.count,
        percentage: c.percentage ?? (grandTotal > 0 ? Math.round((c.count / grandTotal) * 100) : 0),
      }));
    }

    const entries = Object.entries(categories);
    const grandTotal = entries.reduce((sum, [_, count]) => sum + count, 0);

    return entries.map(([category, count]) => ({
      category,
      count,
      percentage: grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0,
    }));
  }, [categories]);

  const total = useMemo(() => categoryList.reduce((sum, c) => sum + c.count, 0), [categoryList]);

  return (
    <div className="donut-card">
      <div className="donut-card__chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoryList}
              dataKey="count"
              nameKey="category"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              strokeWidth={0}
            >
              {categoryList.map((c) => (
                <Cell key={c.category} fill={COLOR[c.category] ?? "#8884d8"} />
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
        {categoryList.map((c) => (
          <li key={c.category}>
            <span className="donut-card__swatch" style={{ background: COLOR[c.category] ?? "#8884d8" }} />
            <span className="donut-card__legend-name">{c.category}</span>
            <span className="donut-card__legend-pct">{c.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
