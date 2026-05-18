export type MapItemType = "club" | "member" | "shop" | "event" | "zone";

export type MapFilterId = "all" | "club" | "member" | "event" | "shop" | "zone";

export type MapItem = {
  id: string;
  title: string;
  type: MapItemType;
  category: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
  instagram?: string;
  website?: string;
  verified?: boolean;
  featured?: boolean;
  radiusMeters?: number;
  metadata?: Record<string, string | number | boolean | undefined>;
};
