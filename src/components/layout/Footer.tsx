import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const cols = [
  { title: "Read", links: [["Discover", "/discover"], ["Short Stories", "/stories/short-stories"], ["Novels", "/stories/novels"], ["Poetry", "/stories/poetry"], ["Non-Fiction", "/stories/non-fiction"]] },
  { title: "Create", links: [["Become a creator", "/signup"], ["Start an idea", "/create"], ["My ideas", "/ideas"], ["Dashboard", "/dashboard"]] },
  { title: "Cinema", links: [["Stories in development", "/cinema"], ["Film projects", "/cinema"], ["Fan casting", "/community"], ["Screenability", "/discover?tab=screenable"]] },
  { title: "Community", links: [["Discussions", "/community"], ["Creators", "/profile/maravoss"], ["Notifications", "/notifications"], ["Moderation", "/admin"]] },
];

export function Footer() {
  return (
    <footer className="rule mt-32">
      <div className="px-6 md:px-14 py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2">
          <Logo />
          <p className="serif italic text-ink-2 mt-5 max-w-xs text-lg leading-snug">The next great film might not come from a studio. It might come from someone who has an idea.</p>
          <p className="label-sm text-ink-3 mt-8">Where cinema is born.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="label text-ink-3 mb-5">{c.title}</div>
            <ul className="space-y-3">
              {c.links.map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-ink-2 hover:text-ink transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="rule px-6 md:px-14 py-6 flex flex-wrap items-center justify-between gap-4 label-sm text-ink-3">
        <span>© {new Date().getFullYear()} Born Cinema. Prototype.</span>
        <span>Community signal, not prediction. AI assists, people decide.</span>
      </div>
    </footer>
  );
}
