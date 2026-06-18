import { createNotification } from "@/lib/server/notification-service";
import { buildNotificationDedupeKey } from "@/lib/notifications/notification-types";
import { getGarageById } from "@/lib/repositories/garages";

export async function notifyGarageOwnerOfFollow(input: {
  garageId: string;
  followerUid: string;
  followerDisplayName?: string;
}): Promise<void> {
  const garage = await getGarageById(input.garageId);
  if (!garage?.ownerUid || garage.ownerUid === input.followerUid) return;

  const name = input.followerDisplayName?.trim() || "Someone";
  await createNotification({
    recipientUid: garage.ownerUid,
    type: "garage_followed",
    title: "New build follower",
    body: `${name} is now following your garage.`,
    actionUrl: `/garage/${garage.id}`,
    metadata: {
      garageId: garage.id,
      followerUid: input.followerUid,
    },
    dedupeKey: buildNotificationDedupeKey([
      "garage_followed",
      garage.id,
      input.followerUid,
    ]),
  });
}
