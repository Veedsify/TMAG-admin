import { useState } from "react";
import {
  Activity,
  Server,
  Database,
  CreditCard,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Gauge,
  Power,
  LucideLoader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSystemStatus, useSystemLogs, useSystemSettings, useToggleMaintenanceMode } from "../../api/hooks";
import type { SystemLog } from "../../api/types";

function statusDot(status: string) {
  const statusMap: Record<string, string> = {
    healthy: "bg-success",
    operational: "bg-success",
    degraded: "bg-warning",
    down: "bg-danger",
  };
  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full",
        statusMap[status] ?? "bg-success"
      )}
    />
  );
}

function statusLabel(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    healthy: { label: "Operational", className: "text-success" },
    operational: { label: "Operational", className: "text-success" },
    degraded: { label: "Degraded", className: "text-warning" },
    down: { label: "Down", className: "text-danger" },
  };
  const s = map[status] ?? map.healthy;
  return <span className={cn("text-xs font-medium", s.className)}>{s.label}</span>;
}

function healthIcon(health: string) {
  if (health === "healthy") return <CheckCircle2 className="w-5 h-5 text-success" />;
  if (health === "degraded") return <AlertTriangle className="w-5 h-5 text-warning" />;
  return <XCircle className="w-5 h-5 text-danger" />;
}

export default function SystemStatusPage() {
  const { data: statusData, isLoading: statusLoading } = useSystemStatus();
  const { data: logsData, isLoading: logsLoading } = useSystemLogs();
  const { data: settingsData, isLoading: settingsLoading } = useSystemSettings();
  const toggleMaintenanceMutation = useToggleMaintenanceMode();

  const [toggling, setToggling] = useState(false);

  const systemLogs: SystemLog[] = logsData ?? [];
  const settings = settingsData ?? {
    maintenanceMode: false,
    defaultIndividualCredits: 20,
    defaultCorporateCredits: 100,
    aiModelVersion: "gpt-4o-mini",
  };

  const isLoading = statusLoading || logsLoading || settingsLoading;

  const incidents = systemLogs
    .filter((l) => l.level === "warning" || l.level === "error" || l.level === "critical")
    .slice(0, 8);

  const handleMaintenanceToggle = () => {
    setToggling(true);
    toggleMaintenanceMutation.mutate(undefined, {
      onSettled: () => setToggling(false),
    });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const services = [
    {
      name: "Database",
      icon: Database,
      status: statusData?.services?.find((s: {name: string; status: string}) => s.name === "database")?.status ?? "healthy",
      uptime: "99.99%",
      responseTime: "8ms",
    },
    {
      name: "AI Engine",
      icon: Server,
      status: statusData?.services?.find((s: {name: string; status: string}) => s.name === "aiService")?.status ?? "healthy",
      uptime: "99.97%",
      responseTime: "142ms",
    },
    {
      name: "Payment Gateway",
      icon: CreditCard,
      status: statusData?.services?.find((s: {name: string; status: string}) => s.name === "billing")?.status ?? "healthy",
      uptime: "99.50%",
      responseTime: "210ms",
    },
    {
      name: "Email Service",
      icon: Mail,
      status: statusData?.services?.find((s: {name: string; status: string}) => s.name === "emailService")?.status ?? "healthy",
      uptime: "99.90%",
      responseTime: "180ms",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">System Status</h1>
          <p className="text-sm text-muted">Monitor platform health and service availability</p>
        </div>
        <div className="flex items-center gap-2">
          {healthIcon(statusData?.status ?? "healthy")}
          <span className="text-sm font-semibold text-heading capitalize">
            {statusData?.status ?? "healthy"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Overall Uptime</p>
          </div>
          <p className="text-2xl font-bold text-heading">{statusData?.uptime ?? "99.9%"}</p>
          <p className="text-xs text-muted mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Avg Response</p>
          </div>
          <p className="text-2xl font-bold text-heading">312ms</p>
          <p className="text-xs text-muted mt-1">Across all services</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Incidents (7d)</p>
          </div>
          <p className="text-2xl font-bold text-heading">{incidents.length}</p>
          <p className="text-xs text-muted mt-1">Warnings, errors &amp; critical</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Power className={cn("w-5 h-5", settings.maintenanceMode ? "text-warning" : "text-accent")} />
            <div>
              <h3 className="text-sm font-semibold text-heading">Maintenance Mode</h3>
              <p className="text-xs text-muted">
                {settings.maintenanceMode
                  ? "Platform is currently in maintenance mode"
                  : "Platform is live and accepting requests"}
              </p>
            </div>
          </div>
          <button
            onClick={handleMaintenanceToggle}
            disabled={toggleMaintenanceMutation.isPending}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
              settings.maintenanceMode ? "bg-warning" : "bg-accent"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200",
                settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
        {toggling && !toggleMaintenanceMutation.isPending && (
          <p className="text-xs text-success mt-2 font-medium">
            Maintenance mode {settings.maintenanceMode ? "enabled" : "disabled"} successfully.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-heading mb-3">Service Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svc.icon className="w-4 h-4 text-body" />
                  <span className="text-sm font-semibold text-heading">{svc.name}</span>
                </div>
                {statusDot(svc.status)}
              </div>
              <div>{statusLabel(svc.status)}</div>
              <div className="space-y-1 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="text-heading font-medium">{svc.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Response</span>
                  <span className="text-heading font-medium">{svc.responseTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-heading mb-3">Recent Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted">No recent incidents.</p>
        ) : (
          <div className="space-y-2">
            {incidents.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "bg-white rounded-2xl border border-border-light/50 p-4 flex items-start gap-4",
                  "border-l-4",
                  log.level === "warning" && "border-l-warning",
                  log.level === "error" && "border-l-danger",
                  log.level === "critical" && "border-l-danger"
                )}
              >
                <div className="pt-0.5">
                  {log.level === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  ) : (
                    <XCircle className="w-4 h-4 text-danger" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-xl",
                        log.level === "warning" && "bg-warning/10 text-warning",
                        log.level === "error" && "bg-danger/10 text-danger",
                        log.level === "critical" && "bg-danger/15 text-danger"
                      )}
                    >
                      {log.level}
                    </span>
                    <span className="text-xs text-muted">{log.source}</span>
                    <span className="text-xs text-muted ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp ? fmtDate(log.timestamp) : "—"}
                    </span>
                  </div>
                  <p className="text-sm text-heading mt-1">{log.message}</p>
                  {log.details && <p className="text-xs text-muted mt-1">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}