import type {
  CarEvent,
  CarShop,
  Club,
  ClubMember,
  GarageCar,
  GarageProfile,
  ShareEntityType,
} from "@/lib/types";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
  entityType: ShareEntityType;
  entityId: string;
};

export type ShareCardModel = {
  entityType: ShareEntityType;
  entityId: string;
  headline: string;
  subheadline?: string;
  imageUrl?: string;
  lines: string[];
  qrUrl: string;
  filenameSlug: string;
};

export type TrackShareActionInput = {
  action:
    | "share_opened"
    | "link_copied"
    | "native_share"
    | "card_downloaded"
    | "invite_opened"
    | "invite_used";
  entityType: ShareEntityType | "invite";
  entityId: string;
  shareLinkId?: string;
  userId?: string;
  source?: string;
  campaign?: string;
};

export type ShareEntityInput =
  | { type: "garage"; garage: GarageProfile; car?: GarageCar | null }
  | { type: "member"; member: ClubMember; clubName?: string; imageUrl?: string }
  | { type: "club"; club: Club; followerCount?: number }
  | { type: "event"; event: CarEvent }
  | { type: "shop"; shop: CarShop };
