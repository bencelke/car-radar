import { ProfilePageBackground } from "@/components/profile/ProfilePageBackground";
import { ProfilePageContent } from "@/components/profile/ProfilePageContent";

export default function ProfilePage() {
  return (
    <ProfilePageBackground>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] lg:px-6 lg:py-8">
        <ProfilePageContent />
      </div>
    </ProfilePageBackground>
  );
}
