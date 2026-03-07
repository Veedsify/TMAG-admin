import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Plus,
  Building2,
  Users,
  FileText,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

type BillingFilter = "all" | "active" | "overdue" | "frozen";

export default function CompaniesPage() {
  const { companies } = useAdminDataStore();
  const [search, setSearch] = useState("");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");

  const filtered = companies.filter((c) => {
    const matchesSearch = c.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesBilling =
      billingFilter === "all" || c.billingStatus === billingFilter;
    return matchesSearch && matchesBilling;
  });

  const activeCount = companies.filter(
    (c) => c.billingStatus === "active"
  ).length;
  const overdueCount = companies.filter(
    (c) => c.billingStatus === "overdue"
  ).length;
  const frozenCount = companies.filter(
    (c) => c.billingStatus === "frozen"
  ).length;

  const summaryStats = [
    { label: "Total Companies", value: companies.length, icon: Building2, color: "text-accent" },
    { label: "Active", value: activeCount, icon: ShieldCheck, color: "text-success" },
    { label: "Overdue", value: overdueCount, icon: CalendarClock, color: "text-warning" },
    { label: "Frozen", value: frozenCount, icon: Building2, color: "text-danger" },
  ];

  const billingOptions: { key: BillingFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "overdue", label: "Overdue" },
    { key: "frozen", label: "Frozen" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">
            Company Management
          </h1>
          <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent">
            {companies.length}
          </span>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors duration-150">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryStats.map((s) => (
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

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex gap-1 bg-background-secondary rounded-xl p-1">
          {billingOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setBillingFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150",
                billingFilter === opt.key
                  ? "bg-white text-heading"
                  : "text-muted hover:text-heading"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((company) => {
          const creditPercent =
            company.creditsPurchased > 0
              ? Math.round(
                  (company.creditsRemaining / company.creditsPurchased) * 100
                )
              : 0;
          return (
            <div
              key={company.id}
              className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6 space-y-4"
            >
              {/* Company Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-heading">
                      {company.name}
                    </h3>
                    <p className="text-xs text-muted">{company.industry}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
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
                      company.billingStatus === "overdue" &&
                        "bg-warning/10 text-warning",
                      company.billingStatus === "frozen" &&
                        "bg-danger/10 text-danger"
                    )}
                  >
                    {company.billingStatus}
                  </span>
                </div>
              </div>

              {/* Credit Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted">Credits</span>
                  <span className="text-heading font-medium">
                    {company.creditsRemaining} / {company.creditsPurchased}
                  </span>
                </div>
                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
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

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background-secondary rounded-xl p-2">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Users className="w-3 h-3 text-muted" />
                  </div>
                  <p className="text-sm font-bold font-serif text-heading">
                    {company.activeEmployees}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Employees</p>
                </div>
                <div className="bg-background-secondary rounded-xl p-2">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <FileText className="w-3 h-3 text-muted" />
                  </div>
                  <p className="text-sm font-bold font-serif text-heading">
                    {company.plansGenerated}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Plans</p>
                </div>
                <div className="bg-background-secondary rounded-xl p-2">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <ShieldCheck className="w-3 h-3 text-muted" />
                  </div>
                  <p className="text-sm font-bold font-serif text-heading">
                    {company.hrAdmins.length}
                  </p>
                  <p className="text-[10px] text-muted uppercase">HR Admins</p>
                </div>
              </div>

              {/* Contract Renewal */}
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <CalendarClock className="w-3.5 h-3.5" />
                Renewal: {company.contractRenewal}
              </div>

              {/* View Details */}
              <Link
                to={`/admin/companies/${company.id}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-button-secondary hover:bg-background-primary rounded-xl text-sm font-medium text-heading transition-colors duration-150"
              >
                <Eye className="w-4 h-4" /> View Details
              </Link>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-muted">No companies match your search.</p>
        </div>
      )}
    </div>
  );
}
