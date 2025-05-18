import { User } from "./interface";

export function getUser(): null | User {
  const item = localStorage.getItem("user");
  if (!item) return null;

  return JSON.parse(item) as User;
}

export function getPhoto(photo: string) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  return baseURL + photo;
}

export function formatAmount(amount: number): string {
  if (amount === 0) return "0 XAF";

  const suffixes = ["", "K", "M", "B", "T", "P", "E"]; // Add more if needed
  const tier = (Math.log10(Math.abs(amount)) / 3) | 0;

  // If the tier is beyond our suffixes, use the highest available
  const suffix = suffixes[Math.min(tier, suffixes.length - 1)];
  const scale = Math.pow(10, tier * 3);

  const scaled = amount / scale;

  // Format to remove trailing .0 or .00 if not needed
  let formatted = scaled.toFixed(2);
  formatted = formatted.replace(/\.?0+$/, ""); // Remove trailing zeros after decimal

  return `${formatted}${suffix} XAF`;
}
