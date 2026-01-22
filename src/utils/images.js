import { API_ORIGIN } from "../api/dataService";

export function normalizeCategoryValue(category) {
  // Gracefully handle category objects {fr,en,ar}
  if (category && typeof category === "object") {
    category =
      category.fr ||
      category.en ||
      category.ar ||
      Object.values(category)[0] ||
      "";
  }
  const raw = String(category ?? "").trim();
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  if (
    lower === "œufs" ||
    lower === "oeufs" ||
    lower === "oeuf" ||
    lower === "œuf"
  ) {
    return "Oeufs";
  }
  return raw;
}

export function normalizeImageUrl(img) {
  const raw = String(img || "").trim();
  if (!raw) return "";
  // If it's already a full URL, data URL, or asset import path, use as-is
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("data:")) return raw;
  // If it's an asset import (contains /assets/ or starts with /src/), use as-is
  if (raw.includes("/assets/") || raw.startsWith("/src/")) return raw;
  // If it's a blob URL (from FileReader or URL.createObjectURL), use as-is
  if (raw.startsWith("blob:")) return raw;
  // Backend uploads
  if (raw.startsWith("/uploads/")) return `${API_ORIGIN}${raw}`;
  return `${API_ORIGIN}/uploads/${raw.replace(/^\/+/, "")}`;
}
