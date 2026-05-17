export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  href: string;
  icon: "events" | "shops" | "communities" | "services";
};
