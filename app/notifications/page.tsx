import { NotificationsPageGate } from "@/components/notifications/NotificationsPageGate";
import { PageShell } from "@/components/layout/PageShell";

export default function NotificationsPage() {
  return (
    <PageShell>
      <NotificationsPageGate />
    </PageShell>
  );
}
