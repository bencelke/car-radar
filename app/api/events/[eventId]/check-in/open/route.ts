import { NextResponse } from "next/server";

import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import {
  adminUnavailable,
  jsonCheckInError,
  unauthorized,
} from "@/lib/server/check-in-api-response";
import { openEventCheckInSession } from "@/lib/server/event-check-in-service";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await verifyIdTokenFromHeader(request);
  if (!uid) return unauthorized();

  const { eventId } = await params;
  const origin = new URL(request.url).origin;

  try {
    const result = await openEventCheckInSession(eventId, uid, origin);
    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Admin SDK")
    ) {
      return adminUnavailable();
    }
    return jsonCheckInError(error);
  }
}
