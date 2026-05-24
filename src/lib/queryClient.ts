import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "./utils";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ── Stale & cache time ───────────────────────────
      staleTime: 1000 * 60 * 5, // 5 minutes — data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes — cache lifetime

      // ── Retry logic ──────────────────────────────────
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        const status = (error as any)?.response?.status;
        if ([401, 403, 404].includes(status)) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

      // ── Behaviour ────────────────────────────────────
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },

    mutations: {
      // ── Global mutation error handler ─────────────────
      onError: (error: unknown) => {
        const message = getErrorMessage(error);
        toast.error(message);
      },
    },
  },
});
