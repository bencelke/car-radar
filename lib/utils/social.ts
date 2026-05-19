export function normalizeSocialUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("@")) {
    return `https://instagram.com/${trimmed.slice(1)}`;
  }
  if (trimmed.includes("instagram.com") || trimmed.includes("tiktok.com")) {
    return trimmed.startsWith("//") ? `https:${trimmed}` : `https://${trimmed}`;
  }
  return trimmed;
}
