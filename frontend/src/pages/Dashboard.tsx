import { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import StatsRow from "../components/StatsRow";
import FilterBar from "../components/FilterBar";
import FeedbackTable from "../components/FeedbackTable";
import CategoryDonut from "../components/CategoryDonut";
import SourceBars from "../components/SourceBars";
import QuickAddForm from "../components/QuickAddForm";
import { useGetFeedbackQuery, useGetStatsQuery } from "../api/feedbackApiSlice";
import type { FeedbackFilters, FeedbackSource, SourceStat } from "../types/feedback";

const EMPTY_FILTERS: FeedbackFilters = { search: "", category: "All", source: "All" };

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export default function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [filters, setFilters] = useState<FeedbackFilters>(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);

  const { data: items = [], isFetching: itemsLoading } = useGetFeedbackQuery(filters);
  // Separate, unfiltered pull just to compute the "volume by source" chart —
  // the backend's /stats endpoint only aggregates by category (see
  // crud/feedback.py get_feedback_stats), so source counts are derived here.
  const { data: allItems = [] } = useGetFeedbackQuery({ limit: 200 });
  const { data: stats } = useGetStatsQuery();

  const sourceStats: SourceStat[] = useMemo(() => {
    const counts = new Map<FeedbackSource, number>();
    for (const item of allItems) {
      counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([source, count]) => ({ source, count }));
  }, [allItems]);

  return (
    <div className="dashboard">
      <TopBar userEmail={userEmail} onLogout={onLogout} />

      <main className="dashboard__main">
        <section className="hero">
          <div>
            <span className="hero__eyebrow">Customer signal · unified inbox</span>
            <h1 className="hero__title">Every message, sorted into signal.</h1>
            <p className="hero__subtitle">
              Feedback from email, app stores, social, and support tickets — read once, categorized automatically, ready to act on.
            </p>
          </div>
          <button className="btn btn--primary hero__cta" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? "Close form" : "+ Log feedback"}
          </button>
        </section>

        <QuickAddForm open={formOpen} onClose={() => setFormOpen(false)} />

        {stats && <StatsRow stats={stats} />}

        <section className="dashboard__grid">
          <div className="dashboard__primary">
            <FilterBar filters={filters} onChange={setFilters} resultCount={items.length} />
            <FeedbackTable items={items} loading={itemsLoading} />
          </div>

          <aside className="dashboard__secondary">
            {stats && <CategoryDonut categories={stats.categories} />}
            {sourceStats.length > 0 && <SourceBars sources={sourceStats} />}
          </aside>

    
        </section>
      </main>
    </div>
  );
}
