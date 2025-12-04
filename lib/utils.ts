import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskLevel(spent: number, budget: number) {
  const used = budget > 0 ? (spent / budget) * 100 : 0;
  if (used < 75) return { level: "low" as const, color: "green" as const, used };
  if (used < 90) return { level: "medium" as const, color: "amber" as const, used };
  return { level: "high" as const, color: "red" as const, used };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
