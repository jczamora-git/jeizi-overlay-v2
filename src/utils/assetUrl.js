import { normalizedBaseUrl } from "../config/api";

export function resolveAssetUrl(path) {
  if (!path) return "";

  const cleanPath = String(path).trim();
  if (!cleanPath) return "";

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("/uploads/")) {
    return `${normalizedBaseUrl}${cleanPath}`;
  }

  if (cleanPath.startsWith("/legacy/")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("uploads/")) {
    return `${normalizedBaseUrl}/${cleanPath}`;
  }

  if (cleanPath.startsWith("legacy/")) {
    return `/${cleanPath}`;
  }

  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
}
