export type FeedbackCategory = "Bug" | "Feature Request" | "Complaint" | "Praise";

export type FeedbackSource = "email" | "app_store" | "twitter" | "support_ticket" | "survey" | "in_app";

export interface FeedbackItem {
  id: string;
  customer_name: string;
  source: FeedbackSource;
  message: string;
  created_at: string; // ISO 8601
  category: FeedbackCategory;
  confidence?: number; // 0-1, set when category was NLP-suggested
}

export interface CategoryStat {
  category: FeedbackCategory;
  count: number;
  percentage: number;
}

export interface SourceStat {
  source: FeedbackSource;
  count: number;
}

export interface FeedbackStats {
  total: number;
  categories: CategoryStat[];
  sources: SourceStat[];
  auto_categorized_pct: number;
}

/** Raw shape returned by GET /api/feedback/stats — mirrors get_feedback_stats() in crud/feedback.py */
export interface BackendFeedbackStats {
  total_feedback: number;
  category_counts: Record<string, number>;
}

export interface FeedbackFilters {
  search: string;
  category: FeedbackCategory | "All";
  source: FeedbackSource | "All";
}
