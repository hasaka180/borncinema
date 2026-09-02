import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { ModerationClient } from "./ModerationClient";
export const dynamic = "force-dynamic";
export default async function Moderation() {
  const me = (await getSession())!;
  if (me.role !== "superadmin") redirect("/dashboard");
  return <ModerationClient />;
}
