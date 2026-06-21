export const SHIFTIT_FOUNDERS = {
  l3LCkOap3LOEgUqDKlIJ7GogG442: {
    title: "Founder",
    adminRole: "founder",
  },
  UZApYWbHw8UjK5DPYxfMczAxoUH2: {
    title: "Co-Founder",
    adminRole: "founder",
  },
} as const;

export type ShiftItFounderUid = keyof typeof SHIFTIT_FOUNDERS;

export const SHIFTIT_FOUNDER_UIDS = Object.keys(
  SHIFTIT_FOUNDERS
) as ShiftItFounderUid[];
