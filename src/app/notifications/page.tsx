import Link from "next/link";
import { notifications, storyById, authorById } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Notifications — Born Cinema" };
const ICON: Record<string, string> = { like: "♥", comment: "✎", follow: "＋", remix: "⟲", cast: "☆", screenability: "%", milestone: "◎", featured: "★" };

export default function NotificationsPage() {
  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16 max-w-4xl">
      <div className="label text-accent mb-5">Notifications</div>
      <h1 className="display text-[6vw] md:text-[2.8vw] leading-[1.06] text-ink">Quietly, things happened.</h1>
      <div className="mt-14">
        {notifications.map((n) => {
          const st = n.storyId ? storyById(n.storyId) : null;
          const href = st ? `/story/${st.slug}` : n.authorId ? `/profile/${authorById(n.authorId).handle}` : "/home";
          return (
            <Link key={n.id} href={href} className="flex items-start gap-6 py-6 rule group">
              <span className={`numeral text-2xl w-8 text-center ${n.read ? "text-ink-3" : "text-accent"}`}>{ICON[n.type]}</span>
              <span className="flex-1">
                <span className={`block serif text-xl leading-snug group-hover:text-accent transition-colors ${n.read ? "text-ink-2" : "text-ink"}`}>{n.text}</span>
                <span className="block label-sm text-ink-3 mt-2">{n.type} · {timeAgo(n.createdAt)}</span>
              </span>
              {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent mt-3" />}
            </Link>
          );
        })}
      </div>
      <p className="label-sm text-ink-3 mt-10">Notifications are batched. Nothing here is designed to pull you back.</p>
    </div>
  );
}
