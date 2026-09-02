import { getSession } from "@/lib/server/session";
import { publicUser } from "@/lib/server/db";
import { THEMES } from "@/components/theme/themes";
import { AIBadge } from "@/components/create/AIBadge";
import { SettingsClient } from "./SettingsClient";
export const dynamic = "force-dynamic";
export default async function Settings() {
  const me = (await getSession())!;
  return (
    <div className="max-w-3xl">
      <div className="label text-accent mb-3">Settings</div>
      <h1 className="display text-xl md:text-3xl text-ink">{me.name}</h1>
      <p className="label-sm text-ink-3 mt-2">@{me.handle} · {me.role}{me.email ? ` · ${me.email}` : ""}</p>
      <div className="mt-10 space-y-6">
        <SettingsClient user={publicUser(me)} themes={THEMES.map((t) => ({ key: t.key, label: t.label, feel: t.feel }))} hasPassword={!!me.passwordHash} />
        <div className="card-edit p-6"><div className="label-sm text-ink-3 mb-2">Creative partner</div><AIBadge /><p className="serif italic text-ink-2 text-sm mt-3">Set OPENAI_API_KEY on the server to have every suggestion, structure and story come from the model. Without it the local partner answers, and the interface says so.</p></div>
      </div>
    </div>
  );
}
