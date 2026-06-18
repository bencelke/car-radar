import { NextResponse } from "next/server";

import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import {
  jsonCheckInError,
  unauthorized,
} from "@/lib/server/check-in-api-response";
import { removeEventCheckInRecord } from "@/lib/server/event-check-in-service";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await verifyIdTokenFromHeader(request);
  if (!uid) return unauthorized();

  const { eventId } = await params;
  let body: { userId?: string };
  try {
    body = (await request.json()) as { userId?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const userId = String(body.userId ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  }

  try {
    await removeEventCheckInRecord(eventId, userId, uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonCheckInError(error);
  }
}
