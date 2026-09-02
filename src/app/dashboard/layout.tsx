import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getSession();
  if (!me) redirect("/login?next=/dashboard");
  return <DashboardShell user={{ id: me.id, name: me.name, handle: me.handle, role: me.role }}>{children}</DashboardShell>;
}
