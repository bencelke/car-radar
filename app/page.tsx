import { redirect } from "next/navigation";

/** Root URL is the ShiftIt sign-in entry; discovery home lives at `/discover`. */
export default function RootPage() {
  redirect("/login");
}
