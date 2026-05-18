export type MapItemType = "club" | "member" | "shop" | "event" | "zone";

export type MapFilterId = "all" | "club" | "member" | "event" | "shop" | "zone";

export type MapCategoryFilterId =
  | "all"
  | "tuning"
  | "wheels"
  | "detailing"
  | "wrap";

export type MapSortId =
  | "featured"
  | "nearest"
  | "newest"
  | "alphabetical"
  | "type";

export type MapItem = {
  id: string;
  title: string;
  type: MapItemType;
  category: string;
  city: string;
  country: string;
  area?: string;
  lat: number;
  lng: number;
  description: string;
  instagram?: string;
  website?: string;
  verified?: boolean;
  featured?: boolean;
  imageUrl?: string;
  tags?: string[];
  radiusMeters?: number;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};
