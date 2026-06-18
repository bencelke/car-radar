import { NextResponse } from "next/server";

import { verifyIdTokenFromHeader } from "@/lib/firebase/admin-server";
import {
  jsonCheckInError,
  unauthorized,
} from "@/lib/server/check-in-api-response";
import { listEventCheckInsForOrganizer } from "@/lib/server/event-check-in-service";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const uid = await verifyIdTokenFromHeader(request);
  if (!uid) return unauthorized();

  const { eventId } = await params;

  try {
    const attendees = await listEventCheckInsForOrganizer(eventId, uid);
    return NextResponse.json({ attendees });
  } catch (error) {
    return jsonCheckInError(error);
  }
}
