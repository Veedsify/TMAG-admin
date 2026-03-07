import { AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

export default function AbusePage() {
  const { abuseFlags, resolveAbuseFlag, users, suspendUser } = useAdminDataStore();

  const unresolved = abuseFlags.filter((f) => !f.resolved);
  const resolved = abuseFlags.filter((f) => f.resolved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">Abuse Detection</h1>
        <p className="text-sm text-muted">Monitor and respond to platform abuse flags</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Flags", value: abuseFlags.length, icon: AlertTriangle, color: "text-warning bg-warning/10" },
          { label: "Unresolved", value: unresolved.length, icon: Clock, color: "text-danger bg-danger/10" },
          { label: "Resolved", value: resolved.length, icon: CheckCircle, color: "text-success bg-success/10" },
          { label: "High Severity", value: abuseFlags.filter((f) => f.severity === "high").length, icon: Shield, color: "text-danger bg-danger/10" },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.color.split(" ")[1])}>
              <s.icon className={cn("w-5 h-5", s.color.split(" ")[0])} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold text-heading">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Unresolved flags */}
      {unresolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-heading">Unresolved Flags</h3>
          {unresolved.map((flag) => {
            const user = users.find((u) => u.id === flag.userId);
            return (
              <div key={flag.id} className="bg-surface rounded-xl border border-border p-4 lg:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-heading">{flag.userName}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        flag.severity === "high" && "bg-danger/10 text-danger",
                        flag.severity === "medium" && "bg-warning/10 text-warning",
                        flag.severity === "low" && "bg-surface-alt text-body"
                      )}>
                        {flag.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-alt text-body capitalize">
                        {flag.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-body">{flag.description}</p>
                    <p className="text-xs text-muted mt-1">{new Date(flag.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => resolveAbuseFlag(flag.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20"
                    >
                      Resolve
                    </button>
                    {user?.status === "active" && (
                      <button
                        onClick={() => suspendUser(flag.userId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20"
                      >
                        Suspend User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved flags */}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-heading">Resolved Flags</h3>
          {resolved.map((flag) => (
            <div key={flag.id} className="bg-surface rounded-xl border border-border p-4 opacity-60">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="font-medium text-heading">{flag.userName}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-alt text-body capitalize">
                  {flag.type.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-body">{flag.description}</p>
              <p className="text-xs text-muted mt-1">{new Date(flag.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
