import { notFound } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { EditorClient } from "./EditorClient";
export const dynamic = "force-dynamic";
export default async function EditStory({ params }: { params: { id: string } }) {
  const me = (await getSession())!;
  const story = await db.story(params.id);
  if (!story || (story.authorId !== me.id && me.role !== "superadmin")) notFound();
  return <EditorClient initial={story} />;
}
