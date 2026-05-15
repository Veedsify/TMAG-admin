import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Shield,
  UserCog,
  HeadphonesIcon,
  LucideLoader2,
  RefreshCw,
  Globe,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { cn } from "../../lib/utils";
import { useSystemSettings, useUpdateSystemSettings, useToggleMaintenanceMode, useFetchLiveRates } from "../../api/hooks";
import { useAdminAuthStore } from "../../stores/adminAuthStore";
import toast from "react-hot-toast";

interface SystemSettingsData {
  maintenanceMode: boolean;
  defaultIndividualCredits: number;
  defaultCorporateCredits: number;
  aiModelVersion: string;
  emailNotifications: boolean;
  maxEmployeesPerCompany: number;
  planGenerationLimit: number;
  globalDisclaimer: string;
  revenueBaseCurrency: string;
  exchangeRateNGN: number;
  exchangeRateEUR: number;
  exchangeRateGBP: number;
  exchangeRateINR: number;
  exchangeRateCAD: number;
  exchangeRateAUD: number;
  exchangeRateKES: number;
  exchangeRateZAR: number;
  exchangeRateGHS: number;
  exchangeRateJPY: number;
  exchangeRateBRL: number;
  exchangeRateAED: number;
  exchangeRateSGD: number;
  exchangeRateCHF: number;
}

const defaultSettings: SystemSettingsData = {
  maintenanceMode: false,
  defaultIndividualCredits: 20,
  defaultCorporateCredits: 100,
  aiModelVersion: "gpt-4o-mini",
  emailNotifications: true,
  maxEmployeesPerCompany: 50,
  planGenerationLimit: 10,
  globalDisclaimer: "",
  revenueBaseCurrency: "USD",
  exchangeRateNGN: 1550,
  exchangeRateEUR: 0.92,
  exchangeRateGBP: 0.79,
  exchangeRateINR: 83.5,
  exchangeRateCAD: 1.36,
  exchangeRateAUD: 1.53,
  exchangeRateKES: 153,
  exchangeRateZAR: 18.2,
  exchangeRateGHS: 14.5,
  exchangeRateJPY: 149.5,
  exchangeRateBRL: 5.05,
  exchangeRateAED: 3.67,
  exchangeRateSGD: 1.34,
  exchangeRateCHF: 0.88,
};

const SUPPORTED_CURRENCIES = [
  { key: "exchangeRateNGN", code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { key: "exchangeRateEUR", code: "EUR", name: "Euro", symbol: "€" },
  { key: "exchangeRateGBP", code: "GBP", name: "British Pound", symbol: "£" },
  { key: "exchangeRateINR", code: "INR", name: "Indian Rupee", symbol: "₹" },
  { key: "exchangeRateCAD", code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { key: "exchangeRateAUD", code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { key: "exchangeRateKES", code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { key: "exchangeRateZAR", code: "ZAR", name: "South African Rand", symbol: "R" },
  { key: "exchangeRateGHS", code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
  { key: "exchangeRateJPY", code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { key: "exchangeRateBRL", code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { key: "exchangeRateAED", code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { key: "exchangeRateSGD", code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { key: "exchangeRateCHF", code: "CHF", name: "Swiss Franc", symbol: "CHF" },
] as const;

export default function SystemSettingsPage() {
  const { data: settingsData, isLoading } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();
  const toggleMaintenanceMutation = useToggleMaintenanceMode();
  const fetchLiveRates = useFetchLiveRates();

  const admin = useAdminAuthStore((s) => s.admin);
  const [form, setForm] = useState<SystemSettingsData>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);

  useEffect(() => {
    if (settingsData) {
      const d = settingsData as unknown as Record<string, unknown>;
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setForm({
        maintenanceMode: (d.maintenanceMode as boolean) ?? false,
        defaultIndividualCredits: (d.defaultIndividualCredits as number) ?? 20,
        defaultCorporateCredits: (d.defaultCorporateCredits as number) ?? 100,
        aiModelVersion: (d.aiModelVersion as string) ?? "gpt-4o-mini",
        emailNotifications: (d.emailNotifications as boolean) ?? true,
        maxEmployeesPerCompany: (d.maxEmployeesPerCompany as number) ?? 50,
        planGenerationLimit: (d.planGenerationLimit as number) ?? 10,
        globalDisclaimer: (d.globalDisclaimer as string) ?? "",
        revenueBaseCurrency: (d.revenueBaseCurrency as string) ?? "USD",
        exchangeRateNGN: (d.exchangeRateNGN as number) ?? 1550,
        exchangeRateEUR: (d.exchangeRateEUR as number) ?? 0.92,
        exchangeRateGBP: (d.exchangeRateGBP as number) ?? 0.79,
        exchangeRateINR: (d.exchangeRateINR as number) ?? 83.5,
        exchangeRateCAD: (d.exchangeRateCAD as number) ?? 1.36,
        exchangeRateAUD: (d.exchangeRateAUD as number) ?? 1.53,
        exchangeRateKES: (d.exchangeRateKES as number) ?? 153,
        exchangeRateZAR: (d.exchangeRateZAR as number) ?? 18.2,
        exchangeRateGHS: (d.exchangeRateGHS as number) ?? 14.5,
        exchangeRateJPY: (d.exchangeRateJPY as number) ?? 149.5,
        exchangeRateBRL: (d.exchangeRateBRL as number) ?? 5.05,
        exchangeRateAED: (d.exchangeRateAED as number) ?? 3.67,
        exchangeRateSGD: (d.exchangeRateSGD as number) ?? 1.34,
        exchangeRateCHF: (d.exchangeRateCHF as number) ?? 0.88,
      });
    }
  }, [settingsData]);

  const handleSave = () => {
    updateSettingsMutation.mutate(form, {
      onSuccess: () => {
        setSaved(true);
        toast.success("Settings saved");
        setTimeout(() => setSaved(false), 2000);
      },
      onError: () => {
        toast.error("Failed to save settings");
      },
    });
  };

  const handleReset = () => {
    if (settingsData) {
      const d = settingsData as unknown as Record<string, unknown>;
      setForm({
        maintenanceMode: (d.maintenanceMode as boolean) ?? false,
        defaultIndividualCredits: (d.defaultIndividualCredits as number) ?? 20,
        defaultCorporateCredits: (d.defaultCorporateCredits as number) ?? 100,
        aiModelVersion: (d.aiModelVersion as string) ?? "gpt-4o-mini",
        emailNotifications: (d.emailNotifications as boolean) ?? true,
        maxEmployeesPerCompany: (d.maxEmployeesPerCompany as number) ?? 50,
        planGenerationLimit: (d.planGenerationLimit as number) ?? 10,
        globalDisclaimer: (d.globalDisclaimer as string) ?? "",
        revenueBaseCurrency: (d.revenueBaseCurrency as string) ?? "USD",
        exchangeRateNGN: (d.exchangeRateNGN as number) ?? 1550,
        exchangeRateEUR: (d.exchangeRateEUR as number) ?? 0.92,
        exchangeRateGBP: (d.exchangeRateGBP as number) ?? 0.79,
        exchangeRateINR: (d.exchangeRateINR as number) ?? 83.5,
        exchangeRateCAD: (d.exchangeRateCAD as number) ?? 1.36,
        exchangeRateAUD: (d.exchangeRateAUD as number) ?? 1.53,
        exchangeRateKES: (d.exchangeRateKES as number) ?? 153,
        exchangeRateZAR: (d.exchangeRateZAR as number) ?? 18.2,
        exchangeRateGHS: (d.exchangeRateGHS as number) ?? 14.5,
        exchangeRateJPY: (d.exchangeRateJPY as number) ?? 149.5,
        exchangeRateBRL: (d.exchangeRateBRL as number) ?? 5.05,
        exchangeRateAED: (d.exchangeRateAED as number) ?? 3.67,
        exchangeRateSGD: (d.exchangeRateSGD as number) ?? 1.34,
        exchangeRateCHF: (d.exchangeRateCHF as number) ?? 0.88,
      });
    }
  };

  const handleToggleMaintenance = () => {
    toggleMaintenanceMutation.mutate(undefined, {
      onSuccess: () => {
        setForm((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
      },
    });
  };

  const handleFetchLiveRates = () => {
    setFetchingRates(true);
    fetchLiveRates.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.rates) {
          const rates = data.rates as Record<string, number>;
          setForm(prev => {
            const updated = { ...prev } as SystemSettingsData;
            for (const cur of SUPPORTED_CURRENCIES) {
              const rate = rates[cur.code];
              if (rate !== undefined) {
                (updated as unknown as Record<string, unknown>)[cur.key] = rate;
              }
            }
            return updated;
          });
          toast.success("Live rates populated — click Save to persist");
        }
        setFetchingRates(false);
      },
      onError: () => {
        toast.error("Failed to fetch live rates");
        setFetchingRates(false);
      },
    });
  };

  const roleConfig = [
    {
      role: "super_admin",
      label: "Super Admin",
      icon: Shield,
      desc: "Full system access. Can manage everything.",
      color: "text-danger",
    },
    {
      role: "client_admin",
      label: "Client Admin",
      icon: UserCog,
      desc: "Can manage companies and users assigned to them.",
      color: "text-info",
    },
    {
      role: "support_admin",
      label: "Support Admin",
      icon: HeadphonesIcon,
      desc: "Read-only access to user data and AI logs. Can reset credits.",
      color: "text-accent",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="System settings"
        description="Configure platform defaults and system behavior."
      />

      {/* Credit Defaults */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Credit Defaults</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">Default Individual Credits</label>
            <input
              type="number"
              value={form.defaultIndividualCredits}
              onChange={(e) =>
                setForm({ ...form, defaultIndividualCredits: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Default Corporate Credits</label>
            <input
              type="number"
              value={form.defaultCorporateCredits}
              onChange={(e) =>
                setForm({ ...form, defaultCorporateCredits: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-heading">AI Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">AI Model Version</label>
            <select
              value={form.aiModelVersion}
              onChange={(e) => setForm({ ...form, aiModelVersion: e.target.value })}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
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
              onChange={(e) =>
                setForm({ ...form, planGenerationLimit: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Platform Settings</h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-heading font-medium">Maintenance Mode</p>
            <p className="text-xs text-muted">Take the platform offline for maintenance</p>
          </div>
          <button
            onClick={handleToggleMaintenance}
            disabled={toggleMaintenanceMutation.isPending}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
              form.maintenanceMode ? "bg-warning" : "bg-accent"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200",
                form.maintenanceMode ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border-light">
          <div>
            <p className="text-sm text-heading font-medium">Email Notifications</p>
            <p className="text-xs text-muted">Send email alerts for critical events</p>
          </div>
          <button
            onClick={() =>
              setForm({ ...form, emailNotifications: !form.emailNotifications })
            }
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
              form.emailNotifications ? "bg-accent" : "bg-body/30"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200",
                form.emailNotifications ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        <div className="pt-2 border-t border-border-light">
          <label className="text-xs text-muted block mb-1">Max Employees Per Company</label>
          <input
            type="number"
            value={form.maxEmployeesPerCompany}
            onChange={(e) =>
              setForm({ ...form, maxEmployeesPerCompany: Number(e.target.value) })
            }
            className="w-full max-w-xs px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Currency Configuration */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              Currency & Exchange Rates
            </h3>
            <p className="text-xs text-muted mt-1">
              Set exchange rates for the ebook store. Rates are expressed as 1 USD = X of that currency.
              Admin-configured rates override live API rates in the store.
            </p>
          </div>
          <button
            onClick={handleFetchLiveRates}
            disabled={fetchingRates}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-button-secondary border border-border text-body rounded-xl text-xs font-medium hover:bg-background-primary transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", fetchingRates && "animate-spin")} />
            {fetchingRates ? "Fetching..." : "Fetch Live Rates"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SUPPORTED_CURRENCIES.map((cur) => (
            <div key={cur.code}>
              <label className="text-xs text-muted block mb-1">
                {cur.symbol} {cur.code}
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={(form as unknown as Record<string, unknown>)[cur.key] as number ?? 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm(prev => ({ ...prev, [cur.key]: val }));
                }}
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder={cur.name}
              />
              <p className="text-[10px] text-brand-muted mt-0.5 truncate">{cur.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Global Disclaimer */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Global Disclaimer</h3>
        <textarea
          value={form.globalDisclaimer}
          onChange={(e) => setForm({ ...form, globalDisclaimer: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
        />
      </div>

      {/* Save / Reset */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50"
        >
          {updateSettingsMutation.isPending ? (
            <LucideLoader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-button-secondary border border-border text-body rounded-xl text-sm font-medium hover:bg-background-primary transition-colors duration-150"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {saved && <span className="text-sm text-success font-medium">Settings saved!</span>}
      </div>

      {/* Admin Roles */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-heading">Admin Roles</h3>
        <p className="text-xs text-muted">
          Current role:{" "}
          <span className="font-semibold text-heading capitalize">
            {admin?.role?.replace(/_/g, " ") ?? "unknown"}
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleConfig.map((r) => (
            <div
              key={r.role}
              className={cn(
                "rounded-xl border p-4",
                admin?.role === r.role ? "border-accent bg-accent/5" : "border-border-light"
              )}
            >
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
