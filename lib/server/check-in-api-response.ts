import { NextResponse } from "next/server";

import { CheckInError } from "@/lib/server/event-check-in-service";

export function jsonCheckInError(error: unknown): NextResponse {
  if (error instanceof CheckInError) {
    const status =
      error.code === "forbidden"
        ? 403
        : error.code === "not_found"
          ? 404
          : 400;
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status }
    );
  }
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ error: "server_error", message }, { status: 500 });
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "unauthorized", message: "Sign in required." },
    { status: 401 }
  );
}

export function adminUnavailable(): NextResponse {
  return NextResponse.json(
    {
      error: "admin_unavailable",
      message:
        "Server check-in requires Firebase Admin SDK (service account). See docs/event-check-in.md.",
    },
    { status: 503 }
  );
}
