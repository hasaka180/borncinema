import { Suspense } from "react";
import { DiscoverClient } from "./DiscoverClient";
import { getPublicStories } from "@/lib/server/catalog";
export const dynamic = "force-dynamic";

export const metadata = { title: "Discover — Born Cinema" };

export default async function DiscoverPage() {
  const all = await getPublicStories();
  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16">
      <div className="max-w-4xl">
        <div className="label text-accent mb-5">Discover</div>
        <h1 className="display text-[6.4vw] md:text-[3.2vw] leading-[1.06] text-ink">Discover stories before they become films.</h1>
      </div>
      <Suspense fallback={null}><DiscoverClient stories={all} /></Suspense>
    </div>
  );
}
