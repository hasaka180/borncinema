"use client";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

const BARE = ["/dashboard", "/login", "/signup"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const bare = BARE.some((p) => path.startsWith(p));
  if (bare) return <>{children}</>;
  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
