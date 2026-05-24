import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AxiosError } from "axios";
import dayjsimported from "dayjs";

// ── Shadcn/ui utility ──────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Extract API error message ──────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const axiosError = error as any;
    const data = axiosError?.response?.data;

    // ASP.NET wrapped response: { success, message, errors }
    if (data?.message) return data.message;
    if (data?.errors?.length) return data.errors[0];

    // ASP.NET validation: { errors: { Field: ["msg"] } }
    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey) return data.errors[firstKey][0];
    }

    return axiosError?.message ?? "Something went wrong";
  }
  return "Something went wrong";
}

// ── Format date using Day.js ───────────────────────────────
export function formatDate(date: string, format = "DD MMM YYYY"): string {
  // Dynamic import to avoid top-level dayjs dependency issues
  try {
    const dayjs = dayjsimported;
    return dayjs(date).format(format);
  } catch {
    return new Date(date).toLocaleDateString("en-IN");
  }
}

// ── Format currency (Indian Rupees) ───────────────────────
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Truncate text ──────────────────────────────────────────
export function truncate(str: string, maxLength = 30): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
}

// ── Get initials from name ─────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
