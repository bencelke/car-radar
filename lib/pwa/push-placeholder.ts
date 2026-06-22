/**
 * Push notifications — placeholder architecture only.
 *
 * NOT IMPLEMENTED:
 * - No FCM registration
 * - No service worker push handler
 * - No permission prompts
 *
 * Future plan (see docs/pwa-mobile-readiness.md):
 * 1. Add Firebase Cloud Messaging to the web client
 * 2. Register a minimal service worker for push + notificationclick
 * 3. Store FCM tokens on users/{uid}/devices/{deviceId}
 * 4. Route server events (club, event, garage) through existing notification service
 */

export type PushReadinessStatus = "not_configured";

export const PUSH_READINESS: {
  status: PushReadinessStatus;
  fcmEnabled: boolean;
  serviceWorkerEnabled: boolean;
} = {
  status: "not_configured",
  fcmEnabled: false,
  serviceWorkerEnabled: false,
};
