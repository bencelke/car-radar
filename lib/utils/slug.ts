type SlugEntity = {
  id: string;
  slug?: string;
  name?: string;
  title?: string;
  displayName?: string;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function entityLabel(entity: SlugEntity): string {
  return entity.name ?? entity.title ?? entity.displayName ?? entity.id;
}

/** Prefer explicit slug, then slugified label, then id. */
export function getEntitySlug(entity: SlugEntity): string {
  if (entity.slug?.trim()) return slugify(entity.slug);
  const fromLabel = slugify(entityLabel(entity));
  return fromLabel || entity.id;
}

export function matchesSlugOrId(entity: SlugEntity, slugOrId: string): boolean {
  const param = slugOrId.toLowerCase().trim();
  if (!param) return false;
  if (entity.id.toLowerCase() === param) return true;
  if (entity.slug && slugify(entity.slug) === param) return true;
  if (getEntitySlug(entity) === param) return true;
  return slugify(entityLabel(entity)) === param;
}

export function citySlug(city: string): string {
  return slugify(city);
}

export function matchesCitySlug(city: string, slug: string): boolean {
  return citySlug(city) === slug.toLowerCase().trim();
}

export function formatCityFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
