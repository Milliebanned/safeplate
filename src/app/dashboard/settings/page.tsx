import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { siteUrl } from "@/lib/site-url";
import { SettingsForms } from "./settings-forms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const owner = await requireOwner("/dashboard/settings");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <SettingsForms name={owner.restaurant.name} slug={owner.restaurant.slug} baseUrl={await siteUrl()} />
    </div>
  );
}
