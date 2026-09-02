"use client";
import { useSearchParams } from "next/navigation";
import { FilmWorkspace } from "@/components/cinema/FilmWorkspace";
export function DevelopClient() {
  const sp = useSearchParams();
  return <FilmWorkspace adaptSlug={sp.get("adapt") || undefined} />;
}
