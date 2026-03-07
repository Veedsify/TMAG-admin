import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, DollarSign, Clock, AlertTriangle, RotateCcw, Eye, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

type StatusFilter = "all" | "paid" | "pending" | "overdue" | "refunded";

export default function BillingPage() {
  const { invoices } = useAdminDataStore();
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) setSelected(invoiceId);
  }, [invoiceId]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      (inv.companyName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const detail = selected ? invoices.find((i) => i.id === selected) : null;

  const closeDetail = () => {
    setSelected(null);
    if (invoiceId) navigate("/admin/billing");
  };

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const refundedAmount = invoices.filter((i) => i.status === "refunded").reduce((s, i) => s + i.amount, 0);

  const summaryCards = [
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Pending", value: `₦${pendingAmount.toLocaleString()}`, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Overdue", value: `₦${overdueAmount.toLocaleString()}`, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
    { label: "Refunded", value: `₦${refundedAmount.toLocaleString()}`, icon: RotateCcw, color: "text-info", bg: "bg-info/10" },
  ];

  const statusColors: Record<string, string> = {
    paid: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    overdue: "bg-danger/10 text-danger",
    refunded: "bg-info/10 text-info",
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">Billing & Invoices</h1>
        <p className="text-sm text-muted mt-0.5">Manage invoices and track payments</p>
      </div>

      {/* Summary */}
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
            placeholder="Search by company, user or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {(["all", "paid", "pending", "overdue", "refunded"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors",
                statusFilter === f ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Invoice ID</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Company / User</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Amount</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Description</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Issued</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Due Date</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Payment</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150">
                <td className="p-4 text-heading font-medium text-xs">{inv.id}</td>
                <td className="p-4">
                  <p className="text-heading font-medium">{inv.companyName ?? inv.userName ?? "—"}</p>
                  {inv.companyName && inv.userName && <p className="text-[11px] text-muted">{inv.userName}</p>}
                </td>
                <td className="p-4 text-heading font-bold">₦{inv.amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={cn("px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize", statusColors[inv.status])}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-muted text-xs max-w-[180px] truncate">{inv.description}</td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{inv.issuedAt}</td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{inv.dueDate}</td>
                <td className="p-4 text-muted text-xs">{inv.paymentMethod ?? "—"}</td>
                <td className="p-4">
                  <button onClick={() => setSelected(inv.id)} className="p-1.5 rounded-xl hover:bg-background-secondary text-muted hover:text-heading">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
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
              <h2 className="text-lg font-serif font-bold text-heading">Invoice Detail</h2>
              <button onClick={closeDetail} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["Invoice ID", detail.id],
                ["Company", detail.companyName ?? "—"],
                ["User", detail.userName ?? "—"],
                ["Amount", `₦${detail.amount.toLocaleString()}`],
                ["Currency", detail.currency],
                ["Status", detail.status],
                ["Description", detail.description],
                ["Issued At", detail.issuedAt],
                ["Due Date", detail.dueDate],
                ["Paid At", detail.paidAt ?? "—"],
                ["Payment Method", detail.paymentMethod ?? "—"],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-heading font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
