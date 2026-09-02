import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { ReviewClient } from "./ReviewClient";
export const dynamic = "force-dynamic";
export default async function Review({ searchParams }: { searchParams: { open?: string } }) {
  const me = (await getSession())!;
  if (me.role !== "superadmin") redirect("/dashboard");
  const all = await db.stories();
  return <ReviewClient initial={all} open={searchParams.open} />;
}
