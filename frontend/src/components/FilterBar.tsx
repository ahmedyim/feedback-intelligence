import type { FeedbackCategory, FeedbackFilters, FeedbackSource } from "../types/feedback";

const CATEGORIES: (FeedbackCategory | "All")[] = ["All", "Bug", "Feature Request", "Complaint", "Praise"];
const SOURCES: (FeedbackSource | "All")[] = ["All", "email", "app_store", "twitter", "support_ticket", "survey", "in_app"];

const SOURCE_LABEL: Record<string, string> = {
  All: "All sources",
  email: "Email",
  app_store: "App Store",
  twitter: "Twitter / X",
  support_ticket: "Support ticket",
  survey: "Survey",
  in_app: "In-app",
};

interface FilterBarProps {
  filters: FeedbackFilters;
  onChange: (filters: FeedbackFilters) => void;
  resultCount: number;
}

export default function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search message or customer…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search feedback"
        />
      </div>

      <div className="filter-bar__group" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${filters.category === c ? "chip--active" : ""}`}
            onClick={() => onChange({ ...filters, category: c })}
          >
            {c}
          </button>
        ))}
      </div>

      <select
        className="filter-bar__select"
        value={filters.source}
        onChange={(e) => onChange({ ...filters, source: e.target.value as FeedbackSource | "All" })}
        aria-label="Filter by source"
      >
        {SOURCES.map((s) => (
          <option key={s} value={s}>
            {SOURCE_LABEL[s]}
          </option>
        ))}
      </select>

      <span className="filter-bar__count">{resultCount} results</span>
    </div>
  );
}
