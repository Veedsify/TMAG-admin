import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line, Legend,
} from "recharts";
import { BarChart3, Users, Globe, CreditCard, DollarSign, LucideLoader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAnalytics, useDashboardStats, useInvoices } from "../../api/hooks";
import type { AnalyticsData, DashboardStats, Invoice } from "../../api/types";

type TabKey = "overview" | "usage" | "destinations" | "credits" | "revenue";

const TABS: { key: TabKey; label: string; path: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", path: "/admin/analytics", icon: BarChart3 },
  { key: "usage", label: "Usage", path: "/admin/analytics/usage", icon: Users },
  { key: "destinations", label: "Destinations", path: "/admin/analytics/destinations", icon: Globe },
  { key: "credits", label: "Credits", path: "/admin/analytics/credits", icon: CreditCard },
  { key: "revenue", label: "Revenue", path: "/admin/analytics/revenue", icon: DollarSign },
];

const CHART_COLORS = ["#2a7a6a", "#c4953a", "#d97706", "#3b82f6", "#ef4444", "#8b5cf6"];

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e8ddd3",
  backgroundColor: "#fcf6ef",
  fontSize: 12,
};

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRevTab, setSelectedRevTab] = useState<"monthly" | "plan" | "method">("monthly");

  const analytics: AnalyticsData = analyticsData ?? {
    topDestinations: [],
    avgCreditsPerUser: 0,
    corporateVsIndividual: { corporate: 0, individual: 0 },
    peakUsageTimes: [],
    monthlyRequests: [],
    dailyActiveUsers: [],
    creditUsageByType: [],
  };

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

  const invoices: Invoice[] = invoicesData ?? [];

  const isLoading = analyticsLoading || statsLoading || invoicesLoading;

  const activeTab: TabKey = (() => {
    const p = location.pathname;
    if (p.endsWith("/usage")) return "usage";
    if (p.endsWith("/destinations")) return "destinations";
    if (p.endsWith("/credits")) return "credits";
    if (p.endsWith("/revenue")) return "revenue";
    return "overview";
  })();

  const pieData = [
    { name: "Corporate", value: analytics.corporateVsIndividual?.corporate ?? 0 },
    { name: "Individual", value: analytics.corporateVsIndividual?.individual ?? 0 },
  ];

  const modelData = [
    { model: "gpt-4o-mini", requests: 9 },
    { model: "gpt-4o", requests: 3 },
  ];

  const riskDistribution = [
    { risk: "Low", count: 6 },
    { risk: "Medium", count: 3 },
    { risk: "High", count: 3 },
  ];

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0);
  const paymentMethods = paidInvoices.reduce<Record<string, number>>((acc, i) => {
    const m = i.paymentMethod ?? "Unknown";
    acc[m] = (acc[m] || 0) + i.amount;
    return acc;
  }, {});
  const paymentMethodData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

  const planTypeRevenue = paidInvoices.reduce<Record<string, number>>((acc, i) => {
    const type = i.companyId ? "Corporate" : "Individual";
    acc[type] = (acc[type] || 0) + i.amount;
    return acc;
  }, {});
  const planTypeData = Object.entries(planTypeRevenue).map(([name, value]) => ({ name, value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">Analytics & Metrics</h1>
        <p className="text-sm text-muted mt-0.5">Usage patterns, trends, and platform insights</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.key ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: "Avg Credits/User", value: analytics.avgCreditsPerUser?.toFixed(1) ?? "0.0", icon: CreditCard, color: "text-accent", bg: "bg-accent/10" },
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-gold", bg: "bg-gold/10" },
              { label: "Corporate Credits", value: analytics.corporateVsIndividual?.corporate ?? 0, icon: BarChart3, color: "text-info", bg: "bg-info/10" },
              { label: "Individual Credits", value: analytics.corporateVsIndividual?.individual ?? 0, icon: DollarSign, color: "text-warning", bg: "bg-warning/10" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
              <h3 className="text-sm font-serif font-bold text-heading mb-5">Monthly Request Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.monthlyRequests}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="requests" fill="#2a7a6a" fillOpacity={0.15} stroke="#2a7a6a" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
              <h3 className="text-sm font-serif font-bold text-heading mb-5">Corporate vs Individual</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-body">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "usage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Peak Usage Hours</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.peakUsageTimes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} tickFormatter={(h: number) => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(h) => `${h}:00`} />
                  <Bar dataKey="requests" fill="#d97706" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Daily Active Users</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="users" stroke="#2a7a6a" strokeWidth={2.5} dot={{ r: 3, fill: "#2a7a6a" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 lg:col-span-2">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Requests per Model</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                  <XAxis dataKey="model" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="requests" fill="#2a7a6a" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "destinations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Top Destinations</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topDestinations?.slice(0, 8) ?? []} layout="vertical" margin={{ left: 4, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} width={72} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#2a7a6a" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Destination Risk Distribution</h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="risk">
                    <Cell fill="#22c55e" />
                    <Cell fill="#eab308" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {[
                { label: "Low", color: "#22c55e" },
                { label: "Medium", color: "#eab308" },
                { label: "High", color: "#ef4444" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-body">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "credits" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Credit Usage by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.creditUsageByType ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
                  <Bar name="Used" dataKey="used" stackId="a" fill="#2a7a6a" radius={[0, 0, 0, 0]} />
                  <Bar name="Remaining" dataKey="remaining" stackId="a" fill="#c4953a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h3 className="text-sm font-serif font-bold text-heading mb-5">Credit Consumption Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyRequests ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="requests" name="Credits Consumed" stroke="#2a7a6a" strokeWidth={2.5} dot={{ r: 3, fill: "#2a7a6a" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Total Revenue</p>
              <p className="text-xl lg:text-2xl font-bold text-heading mt-1">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Invoices Paid</p>
              <p className="text-xl lg:text-2xl font-bold text-success mt-1">{paidInvoices.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Pending</p>
              <p className="text-xl lg:text-2xl font-bold text-warning mt-1">{invoices.filter((i) => i.status === "pending").length}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            {(["monthly", "plan", "method"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedRevTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors",
                  selectedRevTab === t ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
                )}
              >
                {t === "monthly" ? "Monthly Revenue" : t === "plan" ? "By Plan Type" : "Payment Methods"}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            {selectedRevTab === "monthly" && (
              <>
                <h3 className="text-sm font-serif font-bold text-heading mb-5">Monthly Revenue</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyRequests ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="revenue" fill="#c4953a" fillOpacity={0.15} stroke="#c4953a" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            {selectedRevTab === "plan" && (
              <>
                <h3 className="text-sm font-serif font-bold text-heading mb-5">Revenue by Plan Type</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={planTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {planTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {planTypeData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                      <span className="text-body">{d.name}: ₦{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedRevTab === "method" && (
              <>
                <h3 className="text-sm font-serif font-bold text-heading mb-5">Payment Method Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#7a6a5a" }} stroke="#d4c4b4" tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => `₦${Number(value ?? 0).toLocaleString()}`} />
                      <Bar dataKey="value" fill="#2a7a6a" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}