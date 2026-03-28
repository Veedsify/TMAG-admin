import { AlertTriangle, CheckCircle, Clock, Shield, LucideLoader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAbuseFlags, useResolveAbuseFlag, useUsers, useSuspendUser } from "../../api/hooks";
import type { AbuseFlag } from "../../api/types";

export default function AbusePage() {
  const { data: abuseFlagsData, isLoading: flagsLoading } = useAbuseFlags();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const resolveMutation = useResolveAbuseFlag();
  const suspendMutation = useSuspendUser();

  const abuseFlags: AbuseFlag[] = abuseFlagsData ?? [];
  const users = usersData ?? [];
  const isLoading = flagsLoading || usersLoading;

  const unresolved = abuseFlags.filter((f) => !f.resolved);
  const resolved = abuseFlags.filter((f) => f.resolved);

  const handleResolve = (flagId: string) => {
    resolveMutation.mutate(flagId);
  };

  const handleSuspendUser = (userId: string) => {
    suspendMutation.mutate(userId);
  };

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
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">Abuse Detection</h1>
        <p className="text-sm text-muted">Monitor and respond to platform abuse flags</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Flags", value: abuseFlags.length, icon: AlertTriangle, color: "text-warning bg-warning/10" },
          { label: "Unresolved", value: unresolved.length, icon: Clock, color: "text-danger bg-danger/10" },
          { label: "Resolved", value: resolved.length, icon: CheckCircle, color: "text-success bg-success/10" },
          { label: "High Severity", value: abuseFlags.filter((f) => f.severity === "high").length, icon: Shield, color: "text-danger bg-danger/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border-light/50 p-5 flex items-center gap-4">
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

      {unresolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-heading">Unresolved Flags</h3>
          {unresolved.map((flag) => {
            const user = users.find((u) => u.id === flag.userId);
            return (
              <div key={flag.id} className="bg-white rounded-2xl border border-border-light/50 p-4 lg:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-heading">{flag.userName}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        flag.severity === "high" && "bg-danger/10 text-danger",
                        flag.severity === "medium" && "bg-warning/10 text-warning",
                        flag.severity === "low" && "bg-background-secondary text-body"
                      )}>
                        {flag.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-body capitalize">
                        {flag.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-body">{flag.description}</p>
                    <p className="text-xs text-muted mt-1">{flag.timestamp ? new Date(flag.timestamp).toLocaleString() : "—"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleResolve(flag.id)}
                      disabled={resolveMutation.isPending}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                    {user?.status === "active" && (
                      <button
                        onClick={() => handleSuspendUser(flag.userId)}
                        disabled={suspendMutation.isPending}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50"
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

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-heading">Resolved Flags</h3>
          {resolved.map((flag) => (
            <div key={flag.id} className="bg-white rounded-2xl border border-border-light/50 p-4 opacity-60">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="font-medium text-heading">{flag.userName}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-body capitalize">
                  {flag.type.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-body">{flag.description}</p>
              <p className="text-xs text-muted mt-1">{flag.timestamp ? new Date(flag.timestamp).toLocaleString() : "—"}</p>
            </div>
          ))}
        </div>
      )}

      {abuseFlags.length === 0 && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-8 text-center">
          <Shield className="w-12 h-12 text-success mx-auto mb-4" />
          <p className="text-heading font-medium">No Abuse Flags</p>
          <p className="text-muted text-sm mt-1">All clear! No abuse flags to review.</p>
        </div>
      )}
    </div>
  );
}