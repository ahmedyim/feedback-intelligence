import { useState } from "react";
import type { FeedbackSource } from "../types/feedback";
import { useSubmitFeedbackMutation } from "../api/feedbackApiSlice";

const SOURCES: FeedbackSource[] = ["email", "app_store", "twitter", "support_ticket", "survey", "in_app"];

interface QuickAddProps {
  open: boolean;
  onClose: () => void;
}

export default function QuickAddForm({ open, onClose }: QuickAddProps) {
  const [name, setName] = useState("");
  const [source, setSource] = useState<FeedbackSource>("email");
  const [message, setMessage] = useState("");
  const [lastSuggested, setLastSuggested] = useState<string | null>(null);
  const [submitFeedback, { isLoading, error }] = useSubmitFeedbackMutation();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    try {
      const item = await submitFeedback({ customer_name: name, source, message }).unwrap();
      setLastSuggested(item.category);
      setName("");
      setMessage("");
    } catch {
      // error state is surfaced below via the `error` value from the mutation hook
    }
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <div className="quick-add__header">
        <h3>Log feedback</h3>
        <button type="button" className="quick-add__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="quick-add__row">
        <input
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select value={source} onChange={(e) => setSource(e.target.value as FeedbackSource)}>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Paste the feedback message. Category is left blank on purpose — the NLP service will suggest one."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        required
      />

      <div className="quick-add__footer">
        <span className="quick-add__hint">
          {error
            ? "Couldn't reach the backend. Check the API is running."
            : lastSuggested
            ? `Last message was auto-tagged “${lastSuggested}”`
            : "No category needed — it's inferred automatically."}
        </span>
        <button type="submit" className="btn btn--primary" disabled={isLoading}>
          {isLoading ? "Analyzing…" : "Submit & categorize"}
        </button>
      </div>
    </form>
  );
}
