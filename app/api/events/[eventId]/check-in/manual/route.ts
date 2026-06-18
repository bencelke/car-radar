import { NextResponse } from "next/server";

import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import {
  jsonCheckInError,
  unauthorized,
} from "@/lib/server/check-in-api-response";
import {
  buildUserSnapshot,
  manualOrganizerCheckIn,
} from "@/lib/server/event-check-in-service";
import { getEventRecord } from "@/lib/repositories/events";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await verifyIdTokenFromHeader(request);
  if (!uid) return unauthorized();

  const { eventId } = await params;
  let body: { userId?: string; displayName?: string };
  try {
    body = (await request.json()) as { userId?: string; displayName?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const userId = String(body.userId ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  }

  try {
    const event = await getEventRecord(eventId);
    if (!event) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const snapshots = await buildUserSnapshot(userId, event);
    if (body.displayName) {
      snapshots.displayName = body.displayName;
    }
    const record = await manualOrganizerCheckIn(
      eventId,
      userId,
      uid,
      snapshots
    );
    return NextResponse.json({ ok: true, checkIn: record });
  } catch (error) {
    return jsonCheckInError(error);
  }
}
