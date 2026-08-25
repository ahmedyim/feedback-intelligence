import { useState } from "react";
import type { FeedbackItem } from "../types/feedback";
import FeedbackDetailModal from "./FeedbackDetailModal";

const CATEGORY_CLASS: Record<string, string> = {
  Bug: "tag tag--bug",
  "Feature Request": "tag tag--feature",
  Complaint: "tag tag--complaint",
  Praise: "tag tag--praise",
};

const SOURCE_LABEL: Record<string, string> = {
  email: "Email",
  app_store: "App Store",
  twitter: "Twitter / X",
  support_ticket: "Support ticket",
  survey: "Survey",
  in_app: "In-app",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

interface FeedbackTableProps {
  items: FeedbackItem[];
  loading: boolean;
}

export default function FeedbackTable({ items, loading }: FeedbackTableProps) {
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  if (loading) {
    return (
      <div className="feedback-list feedback-list--empty">
        <p>Reading the signal…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="feedback-list feedback-list--empty">
        <p>No feedback matches these filters. Try widening your search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="feedback-list" role="table" aria-label="Customer feedback">
        <div className="feedback-list__head" role="row">
          <span role="columnheader">Customer</span>
          <span role="columnheader">Message</span>
          <span role="columnheader">Source</span>
          <span role="columnheader">Category</span>
          <span role="columnheader">Received</span>
          <span role="columnheader" className="feedback-list__actions-head">Details</span>
        </div>
        {items.map((item) => (
          <div className="feedback-list__row" role="row" key={item.id}>
            <span className="feedback-list__customer" role="cell" data-label="Customer">{item.customer_name}</span>
            <span className="feedback-list__message" role="cell" data-label="Message">{item.message}</span>
            <span className="feedback-list__source" role="cell" data-label="Source">{SOURCE_LABEL[item.source] ?? item.source}</span>
            <span role="cell" data-label="Category">
              <span className={CATEGORY_CLASS[item.category]}>{item.category}</span>
              {item.confidence && (
                <span className="feedback-list__confidence" title="Auto-suggested by NLP">
                  {Math.round(item.confidence * 100)}%
                </span>
              )}
            </span>
            <span className="feedback-list__date" role="cell" data-label="Received">{formatDate(item.created_at)}</span>
            <span className="feedback-list__actions" role="cell">
              <button type="button" className="feedback-list__view" onClick={() => setSelected(item)}>
                View
              </button>
            </span>
          </div>
        ))}
      </div>

      {selected && <FeedbackDetailModal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
