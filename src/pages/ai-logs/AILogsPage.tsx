import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Eye, X, Activity, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

type FilterTab = "all" | "failures" | "flagged" | "high-usage";

const TAB_CONFIG: { key: FilterTab; label: string; path: string }[] = [
  { key: "all", label: "All", path: "/admin/ai-logs" },
  { key: "failures", label: "Failures", path: "/admin/ai-logs/failures" },
  { key: "flagged", label: "Flagged", path: "/admin/ai-logs/flagged" },
  { key: "high-usage", label: "High Usage", path: "/admin/ai-logs/high-usage" },
];

export default function AILogsPage() {
  const { aiLogs } = useAdminDataStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const activeTab: FilterTab = (() => {
    const path = location.pathname;
    if (path.endsWith("/failures")) return "failures";
    if (path.endsWith("/flagged")) return "flagged";
    if (path.endsWith("/high-usage")) return "high-usage";
    return "all";
  })();

  useEffect(() => {
    setSelected(null);
  }, [activeTab]);

  const filtered = aiLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.destination.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === "failures") return log.status === "error";
    if (activeTab === "flagged") return log.status === "flagged";
    if (activeTab === "high-usage") return log.tokensUsed > 3000;
    return true;
  });

  const detail = selected ? aiLogs.find((l) => l.id === selected) : null;

  const summaryCards = [
    { label: "Total Requests", value: aiLogs.length, icon: Activity, color: "text-accent", bg: "bg-accent/10" },
    { label: "Successful", value: aiLogs.filter((l) => l.status === "success").length, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    { label: "Failed", value: aiLogs.filter((l) => l.status === "error").length, icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
    { label: "Flagged", value: aiLogs.filter((l) => l.status === "flagged").length, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">AI Request Logs</h1>
        <p className="text-sm text-muted mt-0.5">Monitor all AI processing requests for debugging and compliance</p>
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
            placeholder="Search by user or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                activeTab === tab.key ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">User</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Destination</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Risk</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Tokens</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Time (ms)</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Model</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Timestamp</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150">
                <td className="p-4">
                  <p className="text-heading font-medium">{log.userName}</p>
                  <p className="text-[11px] text-muted">{log.companyName ?? "Individual"}</p>
                </td>
                <td className="p-4 text-body">{log.destination}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                    log.status === "success" && "bg-success/10 text-success",
                    log.status === "error" && "bg-danger/10 text-danger",
                    log.status === "flagged" && "bg-warning/10 text-warning"
                  )}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                    log.riskLevel === "low" && "bg-success/10 text-success",
                    log.riskLevel === "medium" && "bg-warning/10 text-warning",
                    log.riskLevel === "high" && "bg-danger/10 text-danger"
                  )}>
                    {log.riskLevel}
                  </span>
                </td>
                <td className="p-4 text-body">{log.tokensUsed.toLocaleString()}</td>
                <td className="p-4 text-body">{log.processingTimeMs.toLocaleString()}</td>
                <td className="p-4 text-muted text-xs">{log.modelUsed}</td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-4">
                  <button onClick={() => setSelected(log.id)} className="p-1.5 rounded-xl hover:bg-background-secondary text-muted hover:text-heading">
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-heading">Request Detail</h2>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["User", detail.userName],
                ["Company", detail.companyName ?? "—"],
                ["Destination", detail.destination],
                ["Status", detail.status],
                ["Risk Level", detail.riskLevel],
                ["Model", detail.modelUsed],
                ["Tokens Used", detail.tokensUsed.toLocaleString()],
                ["Processing Time", `${detail.processingTimeMs}ms`],
                ["Credit Consumed", detail.creditConsumed ? "Yes" : "No"],
                ["Timestamp", new Date(detail.timestamp).toLocaleString()],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-heading font-medium">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-muted mb-1">Prompt Summary</p>
                <p className="text-body bg-background-primary rounded-xl p-3">{detail.promptSummary}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Output Summary</p>
                <p className="text-body bg-background-primary rounded-xl p-3">{detail.outputSummary || "No output (error)"}</p>
              </div>
              {detail.errorMessage && (
                <div>
                  <p className="text-danger mb-1">Error</p>
                  <p className="text-danger/80 bg-danger/5 rounded-xl p-3 text-xs">{detail.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
