import { NextResponse } from "next/server";

import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import {
  jsonCheckInError,
  unauthorized,
} from "@/lib/server/check-in-api-response";
import { closeEventCheckInSession } from "@/lib/server/event-check-in-service";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await verifyIdTokenFromHeader(request);
  if (!uid) return unauthorized();

  const { eventId } = await params;

  try {
    await closeEventCheckInSession(eventId, uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonCheckInError(error);
  }
}
