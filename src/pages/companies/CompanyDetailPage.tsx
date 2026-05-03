import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Users,
  FileText,
  Snowflake,
  TrendingUp,
  Plus,
  Minus,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  ShieldCheck,
  CalendarClock,
  LucideLoader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { 
  useCompany, 
  useCompanyEmployees, 
  useUsers, 
  useGeneratedPlans, 
  useCreditLedger,
  useFreezeCompany,
  useUnfreezeCompany,
  useAddCompanyCredits,
  useUpgradeTier,
  useUpdateCompany,
} from "../../api/hooks";
import type { ManagedUser, GeneratedPlan, CreditLedgerEntry } from "../../api/types";

type TabKey =
  | "overview"
  | "edit"
  | "credits"
  | "ledger"
  | "hr-admins"
  | "employees"
  | "plans";

const TABS: { key: TabKey; label: string; path: string }[] = [
  { key: "overview", label: "Overview", path: "" },
  { key: "edit", label: "Edit", path: "/edit" },
  { key: "credits", label: "Credits", path: "/credits" },
  { key: "ledger", label: "Ledger", path: "/ledger" },
  { key: "hr-admins", label: "HR Admins", path: "/hr-admins" },
  { key: "employees", label: "Employees", path: "/employees" },
  { key: "plans", label: "Plans", path: "/plans" },
];

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const { data: companyData, isLoading: companyLoading } = useCompany(id ?? "");
  const { data: employeesData } = useCompanyEmployees(id ?? "");
  const { data: usersData } = useUsers();
  const { data: plansData } = useGeneratedPlans();
  const { data: ledgerData } = useCreditLedger({ companyId: id });

  const freezeMutation = useFreezeCompany();
  const unfreezeMutation = useUnfreezeCompany();
  const addCreditsMutation = useAddCompanyCredits();
  const upgradeMutation = useUpgradeTier();
  const updateMutation = useUpdateCompany();

  const company = companyData;
  const employees = employeesData ?? [];
  const users: ManagedUser[] = usersData ?? [];
  const plans: GeneratedPlan[] = plansData ?? [];
  const ledger: CreditLedgerEntry[] = ledgerData ?? [];

  const basePath = `/admin/companies/${id}`;
  const activeTab: TabKey = (() => {
    const suffix = location.pathname.replace(basePath, "");
    const match = TABS.find((t) => t.path !== "" && suffix.startsWith(t.path));
    return match ? match.key : "overview";
  })();

  const [editForm, setEditForm] = useState({
    name: "",
    industry: "",
    website: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const [creditAmount, setCreditAmount] = useState(50);
  const [creditReason, setCreditReason] = useState("");

  useEffect(() => {
    if (company) {
      setEditForm({
        name: company.name ?? "",
        industry: company.industry ?? "",
        website: company.website ?? "",
        contactEmail: company.contactEmail ?? "",
        contactPhone: company.contactPhone ?? "",
        address: company.address ?? "",
      });
    }
  }, [company]);

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">Company not found</p>
      </div>
    );
  }

  const companyHrAdmins = users.filter(
    (u) => u.companyId === company.id && u.role === "hr_admin"
  );
  const companyPlans = plans.filter((p) => p.companyId === company.id);
  const companyLedger = ledger.filter((e) => e.companyId === company.id);

  const creditPercent =
    company.creditsPurchased > 0
      ? Math.round(
          (company.creditsRemaining / company.creditsPurchased) * 100
        )
      : 0;

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: company.id,
      data: {
        name: editForm.name,
        industry: editForm.industry,
        website: editForm.website || undefined,
        contactEmail: editForm.contactEmail,
        contactPhone: editForm.contactPhone || undefined,
        address: editForm.address || undefined,
      },
    });
  };

  const handleFreeze = () => {
    freezeMutation.mutate(company.id);
  };

  const handleUnfreeze = () => {
    unfreezeMutation.mutate(company.id);
  };

  const handleAddCredits = (amount: number) => {
    addCreditsMutation.mutate({ id: company.id, amount });
  };

  const handleUpgrade = () => {
    upgradeMutation.mutate(company.id);
  };

  return (
    <div className="space-y-8">
      <Link
        to="/admin/companies"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-heading transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </Link>

      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              to={`${basePath}${tab.path}`}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap",
                activeTab === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-heading hover:border-border"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-xl font-serif text-heading">
                    {company.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                        company.tier === "enterprise"
                          ? "bg-gold/10 text-gold"
                          : "bg-button-secondary text-body"
                      )}
                    >
                      {company.tier}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                        company.billingStatus === "active" &&
                          "bg-success/10 text-success",
                        company.billingStatus === "frozen" &&
                          "bg-danger/10 text-danger"
                      )}
                    >
                      {company.billingStatus}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {company.industry || "N/A"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {company.contactEmail || "N/A"}
                  </span>
                  {company.contactPhone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {company.contactPhone}
                    </span>
                  )}
                  {company.website && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {company.website}
                    </span>
                  )}
                  {company.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Created{" "}
                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Credits Purchased",
                value: company.creditsPurchased ?? 0,
                icon: CreditCard,
                color: "text-accent",
              },
              {
                label: "Credits Remaining",
                value: company.creditsRemaining ?? 0,
                icon: CreditCard,
                color: "text-success",
              },
              {
                label: "Plans Generated",
                value: company.plansGenerated ?? 0,
                icon: FileText,
                color: "text-info",
              },
              {
                label: "Active Employees",
                value: company.activeEmployees ?? 0,
                icon: Users,
                color: "text-warning",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-border-light/50 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
                <p className={cn("text-lg font-bold font-serif", s.color)}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-brand-muted" />
              <h3 className="text-sm font-semibold text-heading">
                Contract Renewal
              </h3>
            </div>
            <p className="text-lg font-bold font-serif text-heading">
              {company.contractRenewal ? new Date(company.contractRenewal).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-xs text-muted mt-1">
              Next renewal date for this company&apos;s contract
            </p>
          </div>
        </div>
      )}

      {activeTab === "edit" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 max-w-2xl">
          <h2 className="text-base font-semibold text-heading mb-5">
            Edit Company
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Industry
              </label>
              <input
                type="text"
                value={editForm.industry}
                onChange={(e) =>
                  setEditForm({ ...editForm, industry: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Website
              </label>
              <input
                type="url"
                value={editForm.website}
                onChange={(e) =>
                  setEditForm({ ...editForm, website: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={editForm.contactEmail}
                onChange={(e) =>
                  setEditForm({ ...editForm, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={editForm.contactPhone}
                onChange={(e) =>
                  setEditForm({ ...editForm, contactPhone: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Address
              </label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "credits" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h2 className="text-base font-semibold text-heading mb-4">
              Current Balance
            </h2>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold font-serif text-accent">
                  {company.creditsRemaining}
                </p>
                <p className="text-xs text-muted mt-1">
                  remaining of {company.creditsPurchased} purchased
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      creditPercent > 30
                        ? "bg-accent"
                        : creditPercent > 10
                          ? "bg-warning"
                          : "bg-danger"
                    )}
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h2 className="text-base font-semibold text-heading mb-4">
              Adjust Credits
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-40 px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">
                  Reason
                </label>
                <textarea
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  placeholder="Reason for adjustment..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddCredits(creditAmount)}
                  disabled={addCreditsMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Credits
                </button>
                <button
                  onClick={() => handleAddCredits(-creditAmount)}
                  disabled={addCreditsMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" /> Deduct Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <h2 className="text-base font-semibold text-heading mb-4">
            Credit Ledger ({companyLedger.length})
          </h2>
          {companyLedger.length === 0 ? (
            <p className="text-sm text-muted">No credit activity.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">User</th>
                    <th className="text-left pb-3 text-muted font-medium">Action</th>
                    <th className="text-left pb-3 text-muted font-medium">Amount</th>
                    <th className="text-left pb-3 text-muted font-medium">Balance</th>
                    <th className="text-left pb-3 text-muted font-medium">Reason</th>
                    <th className="text-left pb-3 text-muted font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {companyLedger.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3 text-heading font-medium">
                        {entry.userName}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-button-secondary text-body capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "py-3 pr-3 font-medium",
                          entry.amount > 0 ? "text-success" : "text-danger"
                        )}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount}
                      </td>
                      <td className="py-3 pr-3 text-body">
                        {entry.balanceBefore} → {entry.balanceAfter}
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs max-w-[200px] truncate">
                        {entry.reason}
                      </td>
                      <td className="py-3 text-muted text-xs">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "hr-admins" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <h2 className="text-base font-semibold text-heading mb-4">
            HR Admins ({companyHrAdmins.length})
          </h2>
          {companyHrAdmins.length === 0 ? (
            <p className="text-sm text-muted">
              No HR admins assigned to this company.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">Name</th>
                    <th className="text-left pb-3 text-muted font-medium">Email</th>
                    <th className="text-left pb-3 text-muted font-medium">Status</th>
                    <th className="text-left pb-3 text-muted font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {companyHrAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          to={`/admin/users/${admin.id}`}
                          className="text-heading font-medium hover:text-accent transition-colors duration-150"
                        >
                          {admin.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs">
                        {admin.email}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                            admin.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          )}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted text-xs">
                        {admin.lastActivity ? new Date(admin.lastActivity).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "employees" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <h2 className="text-base font-semibold text-heading mb-4">
            Employees ({employees.length})
          </h2>
          {employees.length === 0 ? (
            <p className="text-sm text-muted">
              No employees found for this company.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">Name</th>
                    <th className="text-left pb-3 text-muted font-medium">Email</th>
                    <th className="text-left pb-3 text-muted font-medium">Role</th>
                    <th className="text-left pb-3 text-muted font-medium">Credits Used</th>
                    <th className="text-left pb-3 text-muted font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="text-heading font-medium hover:text-accent transition-colors duration-150"
                        >
                          {u.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs">
                        {u.email}
                      </td>
                      <td className="py-3 pr-3 text-body text-xs capitalize">
                        {(u as any).role?.replace(/_/g, " ") ?? "employee"}
                      </td>
                      <td className="py-3 pr-3 text-body">{(u as any).creditsUsed ?? 0}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                            (u as any).status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          )}
                        >
                          {(u as any).status ?? "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "plans" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <h2 className="text-base font-semibold text-heading mb-4">
            Generated Plans ({companyPlans.length})
          </h2>
          {companyPlans.length === 0 ? (
            <p className="text-sm text-muted">
              No plans generated for this company.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">User</th>
                    <th className="text-left pb-3 text-muted font-medium">Destination</th>
                    <th className="text-left pb-3 text-muted font-medium">Risk Score</th>
                    <th className="text-left pb-3 text-muted font-medium">Status</th>
                    <th className="text-left pb-3 text-muted font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {companyPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3 text-heading font-medium">
                        {plan.userName}
                      </td>
                      <td className="py-3 pr-3 text-body">
                        {plan.destination}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                            plan.riskScore < 30
                              ? "bg-success/10 text-success"
                              : plan.riskScore < 60
                                ? "bg-warning/10 text-warning"
                                : "bg-danger/10 text-danger"
                          )}
                        >
                          {plan.riskScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                            plan.status === "active"
                              ? "bg-success/10 text-success"
                              : plan.status === "flagged"
                                ? "bg-warning/10 text-warning"
                                : "bg-danger/10 text-danger"
                          )}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted text-xs">
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
        <h3 className="text-sm font-semibold text-heading mb-4">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {company.billingStatus === "frozen" ? (
            <button
              onClick={handleUnfreeze}
              disabled={unfreezeMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> Unfreeze Company
            </button>
          ) : (
            <button
              onClick={handleFreeze}
              disabled={freezeMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
            >
              <Snowflake className="w-4 h-4" /> Freeze Company
            </button>
          )}
          {company.tier !== "enterprise" && (
            <button
              onClick={handleUpgrade}
              disabled={upgradeMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-xl text-sm font-medium hover:bg-gold/20 transition-colors duration-150 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" /> Upgrade to Enterprise
            </button>
          )}
          <button
            onClick={() => handleAddCredits(50)}
            disabled={addCreditsMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors duration-150 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" /> Add 50 Credits
          </button>
        </div>
      </div>
    </div>
  );
}