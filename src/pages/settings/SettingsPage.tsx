import { useState } from "react";
import { Save, RotateCcw, Shield, UserCog, HeadphonesIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";
import { useAdminAuthStore } from "../../stores/adminAuthStore";

export default function SettingsPage() {
  const { settings, updateSettings } = useAdminDataStore();
  const admin = useAdminAuthStore((s) => s.admin);
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setForm({ ...settings });
  };

  const roleConfig = [
    { role: "super_admin", label: "Super Admin", icon: Shield, desc: "Full system access. Can manage everything.", color: "text-danger" },
    { role: "client_admin", label: "Client Admin", icon: UserCog, desc: "Can manage companies and users assigned to them.", color: "text-info" },
    { role: "support_admin", label: "Support Admin", icon: HeadphonesIcon, desc: "Read-only access to user data and AI logs. Can reset credits.", color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">System Settings</h1>
        <p className="text-sm text-muted">Configure platform defaults and system behavior</p>
      </div>

      {/* Credit defaults */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Credit Defaults</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">Default Individual Credits</label>
            <input
              type="number"
              value={form.defaultIndividualCredits}
              onChange={(e) => setForm({ ...form, defaultIndividualCredits: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Default Corporate Credits</label>
            <input
              type="number"
              value={form.defaultCorporateCredits}
              onChange={(e) => setForm({ ...form, defaultCorporateCredits: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* AI configuration */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-heading">AI Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">AI Model Version</label>
            <select
              value={form.aiModelVersion}
              onChange={(e) => setForm({ ...form, aiModelVersion: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Plan Generation Limit (per day)</label>
            <input
              type="number"
              value={form.planGenerationLimit}
              onChange={(e) => setForm({ ...form, planGenerationLimit: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* Global disclaimer */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Global Disclaimer</h3>
        <textarea
          value={form.globalDisclaimer}
          onChange={(e) => setForm({ ...form, globalDisclaimer: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
        />
      </div>

      {/* Save/reset */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border text-body rounded-lg text-sm font-medium hover:bg-surface-alt"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {saved && <span className="text-sm text-success font-medium">Settings saved!</span>}
      </div>

      {/* Admin roles reference */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Admin Roles</h3>
        <p className="text-xs text-muted">Current role: <span className="font-semibold text-heading capitalize">{admin?.role.replace(/_/g, " ")}</span></p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roleConfig.map((r) => (
            <div key={r.role} className={cn("rounded-xl border p-4", admin?.role === r.role ? "border-accent bg-accent/5" : "border-border")}>
              <div className="flex items-center gap-2 mb-2">
                <r.icon className={cn("w-5 h-5", r.color)} />
                <h4 className="font-semibold text-heading text-sm">{r.label}</h4>
              </div>
              <p className="text-xs text-muted">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
