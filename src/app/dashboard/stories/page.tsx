import { getSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { StoriesClient } from "./StoriesClient";
export const dynamic = "force-dynamic";
export default async function MyStories() {
  const me = (await getSession())!;
  const list = await db.stories(me.role === "superadmin" ? {} : { authorId: me.id });
  return <StoriesClient initial={list} admin={me.role === "superadmin"} />;
}
