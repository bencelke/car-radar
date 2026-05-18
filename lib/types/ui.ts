export type AccentColor = "red" | "orange" | "purple" | "blue" | "green" | "gold";

export type MapPin = {
  id: string;
  name: string;
  category: string;
  position: { top: string; left: string };
  accent: AccentColor;
};

export type Place = {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string;
  rating: number;
  status: "open" | "closed";
  verified: boolean;
  description: string;
  services: string[];
  gradient: string;
  accent: AccentColor;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  interested: number;
  gradient: string;
  accent: AccentColor;
};

export type ShopItem = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  gradient: string;
  accent: AccentColor;
};

export type CommunityItem = {
  id: string;
  name: string;
  members: string;
  city: string;
  description: string;
  gradient: string;
  accent: AccentColor;
};

export type ClubArea = {
  id: string;
  name: string;
  position: { top: string; left: string };
  width: string;
  height: string;
  accent: AccentColor;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  accent: AccentColor;
};

export type FilterOption = {
  id: string;
  label: string;
};

export type AdminStat = {
  label: string;
  value: string;
  change?: string;
  accent: AccentColor;
};

export type AdminCity = {
  name: string;
  count: number;
  percent: number;
};

export type AdminSubmission = {
  id: string;
  type: "Shop" | "Event" | "Community" | "Club" | "Member" | "Correction";
  name: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type MonetizationTier = {
  title: string;
  price: string;
};
