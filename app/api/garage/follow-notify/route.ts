import { NextResponse } from "next/server";

import { notifyGarageOwnerOfFollow } from "@/lib/notifications/create-garage-notifications";
import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import { isFollowingGarage } from "@/lib/repositories/garage-follows";

export const runtime = "nodejs";

type Body = {
  garageId: string;
  followerDisplayName?: string;
};

export async function POST(request: Request) {
  const actorUid = await verifyIdTokenFromHeader(request);
  if (!actorUid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.garageId?.trim()) {
    return NextResponse.json({ error: "missing_garage" }, { status: 400 });
  }

  const following = await isFollowingGarage(actorUid, body.garageId);
  if (!following) {
    return NextResponse.json({ error: "not_following" }, { status: 400 });
  }

  try {
    await notifyGarageOwnerOfFollow({
      garageId: body.garageId,
      followerUid: actorUid,
      followerDisplayName: body.followerDisplayName,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
