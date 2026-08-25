import { useEffect } from "react";
import type { FeedbackItem } from "../types/feedback";

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

function formatFullDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

interface FeedbackDetailModalProps {
  item: FeedbackItem;
  onClose: () => void;
}

export default function FeedbackDetailModal({ item, onClose }: FeedbackDetailModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Feedback detail"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card__header">
          <div>
            <span className={CATEGORY_CLASS[item.category]}>{item.category}</span>
            {item.confidence && (
              <span className="feedback-list__confidence" title="Auto-suggested by NLP">
                {Math.round(item.confidence * 100)}% confidence
              </span>
            )}
          </div>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <h3 className="modal-card__customer">{item.customer_name}</h3>

        <div className="modal-card__meta">
          <span>{SOURCE_LABEL[item.source] ?? item.source}</span>
          <span className="modal-card__dot" />
          <span>{formatFullDate(item.created_at)}</span>
        </div>

        <p className="modal-card__message">{item.message}</p>

        <div className="modal-card__footer">
          <span className="modal-card__id">ID: {item.id}</span>
        </div>
      </div>
    </div>
  );
}
