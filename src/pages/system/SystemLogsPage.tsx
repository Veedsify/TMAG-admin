import { useState } from "react";
import {
  Search,
  Info,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  LucideLoader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSystemLogs } from "../../api/hooks";
import type { SystemLog } from "../../api/types";

type LogLevel = "all" | "info" | "warning" | "error" | "critical";

const LEVEL_TABS: { value: LogLevel; label: string }[] = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "critical", label: "Critical" },
];

function levelBadge(level: string) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-xl",
        level === "info" && "bg-accent/10 text-accent",
        level === "warning" && "bg-warning/10 text-warning",
        level === "error" && "bg-danger/10 text-danger",
        level === "critical" && "bg-danger/15 text-danger"
      )}
    >
      {level}
    </span>
  );
}

function levelIcon(level: string) {
  if (level === "info") return <Info className="w-4 h-4 text-accent" />;
  if (level === "warning") return <AlertTriangle className="w-4 h-4 text-warning" />;
  return <XCircle className="w-4 h-4 text-danger" />;
}

function levelBorderColor(level: string) {
  if (level === "info") return "border-l-accent";
  if (level === "warning") return "border-l-warning";
  return "border-l-danger";
}

export default function SystemLogsPage() {
  const { data: logsData, isLoading } = useSystemLogs();
  const systemLogs: SystemLog[] = logsData ?? [];

  const [activeLevel, setActiveLevel] = useState<LogLevel>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = systemLogs
    .filter((log) => activeLevel === "all" || log.level === activeLevel)
    .filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">System Logs</h1>
        <p className="text-sm text-muted">View and filter platform event logs</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-background-secondary rounded-xl p-1">
          {LEVEL_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveLevel(tab.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150",
                activeLevel === tab.value
                  ? "bg-white text-heading"
                  : "text-muted hover:bg-background-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search message or source…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-border-light rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <span className="text-xs text-muted ml-auto">
          {filtered.length} log{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light/50 p-8 text-center">
          <p className="text-sm text-muted">No logs match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className={cn(
                  "bg-white rounded-2xl border border-border-light/50 border-l-4 transition-colors duration-150",
                  levelBorderColor(log.level)
                )}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="pt-0.5">{levelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {levelBadge(log.level)}
                      <span className="text-xs text-brand-muted font-medium">{log.source}</span>
                      <span className="text-xs text-muted ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp ? fmtDate(log.timestamp) : "—"}
                      </span>
                    </div>
                    <p className="text-sm text-heading mt-1">{log.message}</p>
                  </div>
                  {log.details && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="p-1 rounded-lg hover:bg-background-primary transition-colors duration-150"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      )}
                    </button>
                  )}
                </div>
                {log.details && isExpanded && (
                  <div className="px-4 pb-4 pt-0 ml-10">
                    <div className="bg-background-secondary rounded-xl p-3 text-xs text-body font-mono">
                      {log.details}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}