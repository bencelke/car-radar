import { NextResponse } from "next/server";

import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import {
  jsonCheckInError,
  unauthorized,
} from "@/lib/server/check-in-api-response";
import {
  buildUserSnapshot,
  verifyTokenAndCheckIn,
} from "@/lib/server/event-check-in-service";
import { getEventRecord } from "@/lib/repositories/events";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await verifyIdTokenFromHeader(request);
  if (!uid) return unauthorized();

  const { eventId } = await params;
  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json(
      { error: "invalid_body", message: "Invalid JSON." },
      { status: 400 }
    );
  }

  const token = String(body.token ?? "").trim();
  if (!token) {
    return NextResponse.json(
      { error: "invalid_token", message: "Missing check-in token." },
      { status: 400 }
    );
  }

  try {
    const event = await getEventRecord(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "not_found", message: "Event not found." },
        { status: 404 }
      );
    }
    const snapshots = await buildUserSnapshot(uid, event);
    const record = await verifyTokenAndCheckIn(
      eventId,
      token,
      uid,
      snapshots
    );
    return NextResponse.json({ ok: true, checkIn: record });
  } catch (error) {
    return jsonCheckInError(error);
  }
}
