import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Filter, ArrowRightLeft, TrendingUp, TrendingDown, RotateCcw, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

export default function CreditsPage() {
  const { creditLedger } = useAdminDataStore();
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const actions = ["all", "consume", "admin_add", "admin_deduct", "refund", "purchase", "system_grant"];

  useEffect(() => {
    if (transactionId) setSelected(transactionId);
  }, [transactionId]);

  const filtered = creditLedger.filter((e) => {
    const matchSearch =
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.reason.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || e.action === actionFilter;
    return matchSearch && matchAction;
  });

  const detail = selected ? creditLedger.find((e) => e.id === selected) : null;

  const closeDetail = () => {
    setSelected(null);
    if (transactionId) navigate("/admin/ledger");
  };

  const summaryCards = [
    { label: "Total Movements", value: creditLedger.length, icon: ArrowRightLeft, color: "text-accent", bg: "bg-accent/10" },
    { label: "Credits Added", value: creditLedger.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0), icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Credits Consumed", value: Math.abs(creditLedger.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0)), icon: TrendingDown, color: "text-danger", bg: "bg-danger/10" },
    { label: "Refunds", value: creditLedger.filter((e) => e.action === "refund").length, icon: RotateCcw, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">Credit Ledger</h1>
        <p className="text-sm text-muted mt-0.5">Complete audit trail of all credit movements</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
            <div className="flex items-center gap-3.5">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium uppercase tracking-wide truncate">{s.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-heading leading-tight">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by user or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-muted shrink-0" />
          {actions.map((a) => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                actionFilter === a ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
              )}
            >
              {a === "all" ? "All" : a.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger table */}
      <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">User</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Company</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Action</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Amount</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Balance</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Reason</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Triggered By</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => setSelected(entry.id)}
                className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150 cursor-pointer"
              >
                <td className="p-4 text-heading font-medium">{entry.userName}</td>
                <td className="p-4 text-body text-xs">{entry.companyName ?? "—"}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                    entry.action === "consume" && "bg-danger/10 text-danger",
                    entry.action === "refund" && "bg-warning/10 text-warning",
                    (entry.action === "admin_add" || entry.action === "purchase" || entry.action === "system_grant") && "bg-success/10 text-success",
                    entry.action === "admin_deduct" && "bg-danger/10 text-danger"
                  )}>
                    {entry.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td className={cn("p-4 font-bold", entry.amount > 0 ? "text-success" : "text-danger")}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </td>
                <td className="p-4 text-body">
                  <span className="text-muted">{entry.balanceBefore}</span>
                  <span className="mx-1 text-muted">→</span>
                  <span className="font-medium text-heading">{entry.balanceAfter}</span>
                </td>
                <td className="p-4 text-muted text-xs max-w-[200px] truncate">{entry.reason}</td>
                <td className="p-4 text-muted text-xs">{entry.triggeredBy}</td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-heading">Transaction Detail</h2>
              <button onClick={closeDetail} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["Transaction ID", detail.id],
                ["User", detail.userName],
                ["Company", detail.companyName ?? "—"],
                ["Action", detail.action.replace(/_/g, " ")],
                ["Amount", `${detail.amount > 0 ? "+" : ""}${detail.amount}`],
                ["Balance Before", String(detail.balanceBefore)],
                ["Balance After", String(detail.balanceAfter)],
                ["Triggered By", detail.triggeredBy],
                ["Timestamp", new Date(detail.timestamp).toLocaleString()],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-heading font-medium">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-muted mb-1">Reason</p>
                <p className="text-body bg-background-primary rounded-xl p-3">{detail.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
