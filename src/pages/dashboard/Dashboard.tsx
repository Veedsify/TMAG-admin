import {
    Users,
    Building2,
    CreditCard,
    Zap,
    DollarSign,
    AlertTriangle,
    Activity,
    TrendingUp,
    Globe,
    ShieldAlert,
    FileWarning,
    ServerCrash,
    UserCheck,
    LucideLoader2,
} from "lucide-react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
} from "recharts";
import { cn } from "../../lib/utils";
import { useDashboardStats, useAnalytics, useAILogs, useAbuseFlags, useGeneratedPlans, useSystemLogs } from "../../api/hooks";
import type { DashboardStats, AnalyticsData, AIRequestLog, GeneratedPlan, SystemLog, AbuseFlag } from "../../api/types";

function StatCard({
    label,
    value,
    icon: Icon,
    color = "text-accent",
    bgColor = "bg-accent/10",
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    bgColor?: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <div className="flex items-center gap-3.5">
                <div
                    className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                        bgColor,
                    )}
                >
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted font-medium uppercase tracking-wide truncate">
                        {label}
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-heading leading-tight">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SystemHealthBadge({ status }: { status: string }) {
    const config: Record<
        string,
        { color: string; bg: string; dot: string; label: string }
    > = {
        healthy: {
            color: "text-success",
            bg: "bg-success/10",
            dot: "bg-success",
            label: "All Systems Healthy",
        },
        degraded: {
            color: "text-warning",
            bg: "bg-warning/10",
            dot: "bg-warning",
            label: "Degraded Performance",
        },
        down: {
            color: "text-danger",
            bg: "bg-danger/10",
            dot: "bg-danger",
            label: "System Down",
        },
    };
    const c = config[status] ?? config.healthy;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold",
                c.color,
                c.bg,
            )}
        >
            <span className={cn("w-2 h-2 rounded-full animate-pulse", c.dot)} />
            {c.label}
        </span>
    );
}

const chartTooltipStyle: React.CSSProperties = {
    borderRadius: 12,
    border: "1px solid #e8ddd3",
    backgroundColor: "#fcf6ef",
    fontSize: 12,
    fontFamily: "Geist, system-ui, sans-serif",
};

export default function Dashboard() {
    const { data: statsData, isLoading: statsLoading } = useDashboardStats();
    const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();
    const { data: aiLogsData, isLoading: aiLogsLoading } = useAILogs();
    const { data: abuseFlagsData, isLoading: abuseLoading } = useAbuseFlags();
    const { data: plansData, isLoading: plansLoading } = useGeneratedPlans();
    const { data: systemLogsData, isLoading: logsLoading } = useSystemLogs();

    const stats: DashboardStats = statsData ?? {
        totalUsers: 0,
        totalCompanies: 0,
        totalCreditsIssued: 0,
        totalCreditsConsumed: 0,
        aiRequestsToday: 0,
        revenueOverview: 0,
        failedAICalls: 0,
        systemHealthStatus: "healthy",
        activeUsersToday: 0,
        newUsersThisWeek: 0,
    };

    const analytics: AnalyticsData = analyticsData ?? {
        topDestinations: [],
        avgCreditsPerUser: 0,
        corporateVsIndividual: { corporate: 0, individual: 0 },
        peakUsageTimes: [],
        monthlyRequests: [],
        dailyActiveUsers: [],
        creditUsageByType: [],
    };

    const aiLogs: AIRequestLog[] = aiLogsData ?? [];
    const abuseFlags: AbuseFlag[] = abuseFlagsData ?? [];
    const plans: GeneratedPlan[] = plansData ?? [];
    const systemLogs: SystemLog[] = systemLogsData ?? [];

    const isLoading = statsLoading || analyticsLoading || aiLogsLoading || abuseLoading || plansLoading || logsLoading;

    const recentRequests = aiLogs.slice(0, 5);
    const unresolvedAbuseCount = abuseFlags.filter((f) => !f.resolved).length;
    const flaggedPlansCount = plans.filter((p) => p.status === "flagged").length;
    const recentWarnings = systemLogs
        .filter(
            (l) =>
                l.level === "warning" ||
                l.level === "error" ||
                l.level === "critical",
        )
        .slice(0, 4);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 lg:space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted mt-0.5">
                        System overview and key metrics
                    </p>
                </div>
                <SystemHealthBadge status={stats.systemHealthStatus} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                    label="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                />
                <StatCard
                    label="Companies"
                    value={stats.totalCompanies.toLocaleString()}
                    icon={Building2}
                    color="text-gold"
                    bgColor="bg-gold/10"
                />
                <StatCard
                    label="Credits Issued"
                    value={stats.totalCreditsIssued.toLocaleString()}
                    icon={CreditCard}
                    color="text-warning"
                    bgColor="bg-warning/10"
                />
                <StatCard
                    label="Credits Consumed"
                    value={stats.totalCreditsConsumed.toLocaleString()}
                    icon={Zap}
                    color="text-accent"
                    bgColor="bg-accent/10"
                />
                <StatCard
                    label="AI Requests Today"
                    value={stats.aiRequestsToday.toLocaleString()}
                    icon={Activity}
                    color="text-info"
                    bgColor="bg-info/10"
                />
                <StatCard
                    label="Revenue"
                    value={`₦${stats.revenueOverview.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-success"
                    bgColor="bg-success/10"
                />
                <StatCard
                    label="Failed AI Calls"
                    value={stats.failedAICalls}
                    icon={AlertTriangle}
                    color="text-danger"
                    bgColor="bg-danger/10"
                />
                <StatCard
                    label="Active Users Today"
                    value={stats.activeUsersToday.toLocaleString()}
                    icon={UserCheck}
                    color="text-accent"
                    bgColor="bg-accent/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-sm font-serif font-bold text-heading mb-5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        Monthly Requests &amp; Revenue
                    </h3>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.monthlyRequests}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e8ddd3"
                                />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                    stroke="#d4c4b4"
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                    stroke="#d4c4b4"
                                    tickLine={false}
                                />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: 12,
                                        paddingTop: 8,
                                    }}
                                    iconType="circle"
                                    iconSize={8}
                                />
                                <Line
                                    name="Requests"
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#2a7a6a"
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: "#2a7a6a" }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    name="Revenue (₦)"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#c4953a"
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: "#c4953a" }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-sm font-serif font-bold text-heading mb-5 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-accent" />
                        Top Destinations
                    </h3>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                                data={analytics.topDestinations.slice(0, 6)}
                                layout="vertical"
                                margin={{ left: 4, right: 16 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e8ddd3"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                    stroke="#d4c4b4"
                                    tickLine={false}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                    stroke="#d4c4b4"
                                    tickLine={false}
                                    width={72}
                                />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Bar
                                    dataKey="count"
                                    fill="#2a7a6a"
                                    radius={[0, 6, 6, 0]}
                                    barSize={18}
                                />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                <h3 className="text-sm font-serif font-bold text-heading mb-5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent" />
                    Recent AI Requests
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left pb-3 text-muted font-medium text-xs uppercase tracking-wide">
                                    User
                                </th>
                                <th className="text-left pb-3 text-muted font-medium text-xs uppercase tracking-wide">
                                    Destination
                                </th>
                                <th className="text-left pb-3 text-muted font-medium text-xs uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="text-left pb-3 text-muted font-medium text-xs uppercase tracking-wide">
                                    Risk
                                </th>
                                <th className="text-left pb-3 text-muted font-medium text-xs uppercase tracking-wide">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRequests.map((log) => (
                                <tr
                                    key={log.id}
                                    className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150"
                                >
                                    <td className="py-3 text-heading font-medium">
                                        {log.userName}
                                    </td>
                                    <td className="py-3 text-body">
                                        {log.destination}
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                                                log.status === "success" &&
                                                    "bg-success/10 text-success",
                                                log.status === "error" &&
                                                    "bg-danger/10 text-danger",
                                                log.status === "flagged" &&
                                                    "bg-warning/10 text-warning",
                                            )}
                                        >
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                                                log.riskLevel === "low" &&
                                                    "bg-success/10 text-success",
                                                log.riskLevel === "medium" &&
                                                    "bg-warning/10 text-warning",
                                                log.riskLevel === "high" &&
                                                    "bg-danger/10 text-danger",
                                            )}
                                        >
                                            {log.riskLevel}
                                        </span>
                                    </td>
                                    <td className="py-3 text-muted text-xs">
                                        {new Date(
                                            log.timestamp,
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {recentRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted text-sm">
                                        No recent AI requests
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                <h3 className="text-sm font-serif font-bold text-heading mb-5">
                    Quick Glance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-background-primary rounded-xl p-4 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-4.5 h-4.5 text-danger" />
                        </div>
                        <div>
                            <p className="text-xs text-muted font-medium uppercase tracking-wide">
                                Unresolved Abuse Flags
                            </p>
                            <p className="text-2xl font-bold text-heading leading-tight">
                                {unresolvedAbuseCount}
                            </p>
                        </div>
                    </div>

                    <div className="bg-background-primary rounded-xl p-4 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                            <FileWarning className="w-4.5 h-4.5 text-warning" />
                        </div>
                        <div>
                            <p className="text-xs text-muted font-medium uppercase tracking-wide">
                                Flagged Plans
                            </p>
                            <p className="text-2xl font-bold text-heading leading-tight">
                                {flaggedPlansCount}
                            </p>
                        </div>
                    </div>

                    <div className="bg-background-primary rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <ServerCrash className="w-4 h-4 text-warning" />
                            <p className="text-xs text-muted font-medium uppercase tracking-wide">
                                System Warnings
                            </p>
                        </div>
                        {recentWarnings.length === 0 ?
                            <p className="text-xs text-brand-muted">
                                No recent warnings
                            </p>
                        :   <ul className="space-y-1.5">
                                {recentWarnings.map((log) => (
                                    <li
                                        key={log.id}
                                        className="flex items-start gap-2"
                                    >
                                        <span
                                            className={cn(
                                                "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                                                log.level === "warning" &&
                                                    "bg-warning",
                                                log.level === "error" &&
                                                    "bg-danger",
                                                log.level === "critical" &&
                                                    "bg-danger",
                                            )}
                                        />
                                        <span className="text-xs text-body leading-snug line-clamp-1">
                                            {log.message}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}