import { configureStore } from "@reduxjs/toolkit";
import { feedbackApi } from "./api/feedbackApiSlice";

export const store = configureStore({
  reducer: {
    [feedbackApi.reducerPath]: feedbackApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(feedbackApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
