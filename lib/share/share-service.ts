import { brand } from "@/lib/config/brand";
import { trackShareAction } from "@/lib/repositories/share-analytics";
import type { ShareEntityInput, SharePayload, ShareCardModel } from "@/lib/share/share-types";
import { slugifyShareFilename } from "@/lib/share/invite-code";
import {
  appendShareTracking,
  getCanonicalSharePath,
  getCanonicalShareUrl,
  type ShareEntityRef,
} from "@/lib/share/share-url";
import { getEntitySlug } from "@/lib/utils/slug";

function shareRefFromInput(input: ShareEntityInput): ShareEntityRef {
  switch (input.type) {
    case "garage":
      return { entityType: "garage", garage: input.garage };
    case "member":
      return { entityType: "member", member: input.member };
    case "club":
      return { entityType: "club", club: input.club };
    case "event":
      return { entityType: "event", event: input.event };
    case "shop":
      return { entityType: "shop", shop: input.shop };
  }
}

export function buildSharePayload(
  input: ShareEntityInput,
  tracking?: { ref?: string; source?: string; campaign?: string }
): SharePayload {
  const ref = shareRefFromInput(input);
  const url = appendShareTracking(getCanonicalShareUrl(ref), tracking ?? { source: "share" });

  switch (input.type) {
    case "garage": {
      const carLine = input.car
        ? [input.car.year, input.car.make, input.car.model].filter(Boolean).join(" ")
        : "";
      return {
        entityType: "garage",
        entityId: input.garage.id,
        title: `${input.garage.displayName} on ${brand.appName}`,
        text: carLine
          ? `Check out this build: ${carLine}`
          : `Check out this garage on ${brand.domainName}`,
        url,
      };
    }
    case "member": {
      const car = [input.member.carMake, input.member.carModel].filter(Boolean).join(" ");
      return {
        entityType: "member",
        entityId: input.member.id,
        title: `${input.member.displayName} on ${brand.appName}`,
        text: car
          ? `${input.member.displayName}'s ${car}`
          : `Member profile on ${brand.domainName}`,
        url,
      };
    }
    case "club":
      return {
        entityType: "club",
        entityId: input.club.id,
        title: `${input.club.name} | ${brand.appName}`,
        text: input.club.shortDescription ?? `${input.club.name} in ${input.club.city}`,
        url,
      };
    case "event":
      return {
        entityType: "event",
        entityId: input.event.id,
        title: `${input.event.title} | ${brand.appName}`,
        text: `${input.event.title} in ${input.event.city}`,
        url,
      };
    case "shop":
      return {
        entityType: "shop",
        entityId: input.shop.id,
        title: `${input.shop.name} | ${brand.appName}`,
        text: `${input.shop.name} in ${input.shop.city}`,
        url,
      };
  }
}

export function buildShareCardModel(
  input: ShareEntityInput,
  tracking?: { ref?: string; source?: string; campaign?: string }
): ShareCardModel {
  const payload = buildSharePayload(input, {
    ...tracking,
    source: tracking?.source ?? "share_card",
  });

  switch (input.type) {
    case "garage": {
      const car = input.car;
      const carLine = car
        ? [car.year, car.make, car.model].filter(Boolean).join(" ")
        : input.garage.displayName;
      const lines = [
        carLine,
        car?.horsepower != null ? `${car.horsepower} hp` : "",
        car?.buildStage ? car.buildStage.replace(/_/g, " ") : "",
        input.garage.clubName ?? "",
        [input.garage.city, input.garage.area].filter(Boolean).join(" · "),
      ].filter(Boolean);
      return {
        entityType: "garage",
        entityId: input.garage.id,
        headline: input.garage.displayName,
        subheadline: input.garage.instagramHandle
          ? `@${input.garage.instagramHandle.replace(/^@/, "")}`
          : undefined,
        imageUrl: car?.primaryImageUrl,
        lines,
        qrUrl: payload.url,
        filenameSlug: slugifyShareFilename(
          `${input.garage.displayName}-${car?.make ?? "garage"}`
        ),
      };
    }
    case "member": {
      const carLine = [input.member.carYear, input.member.carMake, input.member.carModel]
        .filter(Boolean)
        .join(" ");
      return {
        entityType: "member",
        entityId: input.member.id,
        headline: input.member.displayName,
        subheadline: input.member.instagramHandle
          ? `@${input.member.instagramHandle.replace(/^@/, "")}`
          : undefined,
        imageUrl: input.imageUrl ?? input.member.avatarUrl ?? input.member.imageUrl,
        lines: [
          carLine,
          input.member.buildSummary?.slice(0, 60) ?? "",
          input.clubName ?? input.member.clubName ?? "",
          input.member.city ?? "",
        ].filter(Boolean),
        qrUrl: payload.url,
        filenameSlug: slugifyShareFilename(input.member.displayName),
      };
    }
    case "club":
      return {
        entityType: "club",
        entityId: input.club.id,
        headline: input.club.name,
        subheadline: input.club.type,
        imageUrl: input.club.coverImageUrl ?? input.club.imageUrl ?? input.club.logoUrl,
        lines: [
          [input.club.city, input.club.area, input.club.country].filter(Boolean).join(" · "),
          input.club.memberCount != null ? `${input.club.memberCount} members` : "",
          input.club.vehicleTypes?.slice(0, 2).join(" · ") ?? "",
        ].filter(Boolean),
        qrUrl: payload.url,
        filenameSlug: slugifyShareFilename(input.club.slug ?? input.club.name),
      };
    case "event": {
      const when = new Date(input.event.startTime).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        entityType: "event",
        entityId: input.event.id,
        headline: input.event.title,
        subheadline: input.event.clubName ?? input.event.type,
        imageUrl: input.event.imageUrl,
        lines: [
          when,
          [input.event.city, input.event.country].filter(Boolean).join(" · "),
          input.event.goingCount != null ? `${input.event.goingCount} going` : "",
        ].filter(Boolean),
        qrUrl: payload.url,
        filenameSlug: slugifyShareFilename(getEntitySlug(input.event)),
      };
    }
    case "shop":
      return {
        entityType: "shop",
        entityId: input.shop.id,
        headline: input.shop.name,
        subheadline: input.shop.category,
        imageUrl: input.shop.imageUrl,
        lines: [
          input.shop.city,
          input.shop.country,
          input.shop.instagram ? "Instagram linked" : "",
        ].filter(Boolean),
        qrUrl: payload.url,
        filenameSlug: slugifyShareFilename(getEntitySlug(input.shop)),
      };
  }
}

export async function trackShare(input: Parameters<typeof trackShareAction>[0]): Promise<void> {
  try {
    await trackShareAction(input);
  } catch {
    /* analytics must not block sharing */
  }
}

export function shareCardFilename(model: ShareCardModel, ext: "png" | "webp" = "png"): string {
  return `shiftit-${model.filenameSlug || model.entityType}.${ext}`;
}

export function canonicalPathForInput(input: ShareEntityInput): string {
  return getCanonicalSharePath(shareRefFromInput(input));
}
