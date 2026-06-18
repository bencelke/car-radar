import { PageShell } from "@/components/layout/PageShell";
import { FollowingPageGate } from "@/components/following/FollowingPageGate";

export default function FollowingPage() {
  return (
    <PageShell>
      <FollowingPageGate />
    </PageShell>
  );
}
