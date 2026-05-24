/** Public URL path for a member car image under `/data/clubs/...`. */
export function memberPublicImagePath(clubId: string, memberId: string): string {
  return `/data/clubs/${clubId}/images/${memberId}.webp`;
}

/** Append cache-busting query (strip existing query first). */
export function withImageCacheBust(url: string, bust?: number): string {
  const base = url.split("?")[0] ?? url;
  const v = bust ?? Date.now();
  return `${base}?v=${v}`;
}
