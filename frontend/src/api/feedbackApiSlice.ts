import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import type {
  BackendFeedbackStats,
  FeedbackCategory,
  FeedbackFilters,
  FeedbackItem,
  FeedbackSource,
  FeedbackStats,
} from "../types/feedback";

export interface SubmitFeedbackPayload {
  customer_name: string;
  source: FeedbackSource;
  message: string;
  category?: FeedbackCategory;
}

// NOTE: adjust if your router isn't mounted at /api (see routers/feedback.py -> prefix="/feedback")
const BASE = "/feedback";

function toFeedbackStats(raw: BackendFeedbackStats): FeedbackStats {
  const total = raw.total_feedback;
  const categories = Object.entries(raw.category_counts).map(([category, count]) => ({
    category: category as FeedbackCategory,
    count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }));

  return {
    total,
    categories,
    sources: [], // backend stats endpoint doesn't aggregate by source — derived client-side, see Dashboard.tsx
    auto_categorized_pct: 0, // not tracked by the backend yet
  };
}

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Feedback", "Stats"],
  endpoints: (builder) => ({
    getFeedback: builder.query<FeedbackItem[], (Partial<FeedbackFilters> & { skip?: number; limit?: number }) | void>({
      query: (filters) => ({
        url: `${BASE}/`,
        method: "GET",
        params: {
          category: filters?.category && filters.category !== "All" ? filters.category : undefined,
          source: filters?.source && filters.source !== "All" ? filters.source : undefined,
          search: filters?.search || undefined,
          skip: filters?.skip ?? 0,
          limit: filters?.limit ?? 200, // pulled high so client-side source aggregation is accurate
        },
      }),
      providesTags: ["Feedback"],
    }),

    getStats: builder.query<FeedbackStats, void>({
      query: () => ({ url: `${BASE}/stats`, method: "GET" }),
      transformResponse: (raw: BackendFeedbackStats) => toFeedbackStats(raw),
      providesTags: ["Stats"],
    }),

    submitFeedback: builder.mutation<FeedbackItem, SubmitFeedbackPayload>({
      query: (payload) => ({ url: `${BASE}/`, method: "POST", data: payload }),
      invalidatesTags: ["Feedback", "Stats"],
    }),

    updateFeedback: builder.mutation<FeedbackItem, { id: string; payload: SubmitFeedbackPayload }>({
      query: ({ id, payload }) => ({ url: `${BASE}/${id}`, method: "PUT", data: payload }),
      invalidatesTags: ["Feedback", "Stats"],
    }),

    deleteFeedback: builder.mutation<void, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Feedback", "Stats"],
    }),
  }),
});

export const {
  useGetFeedbackQuery,
  useGetStatsQuery,
  useSubmitFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
