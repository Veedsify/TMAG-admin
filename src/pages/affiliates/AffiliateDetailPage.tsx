import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Copy,
    Check,
    Loader2,
    PauseCircle,
    PlayCircle,
    Percent,
    Search,
    TrendingUp,
    MousePointerClick,
    RefreshCw,
    Wallet,
    HandCoins,
    Users,
    Edit2,
    X,
    ChevronDown,
    ChevronRight,
    Banknote,
    Calendar,
} from "lucide-react";
import type { AdminAffiliatePayout } from "../../api/types";
import {
    useAffiliateDetail,
    useSuspendAffiliate,
    useActivateAffiliate,
    useUpdateAffiliateCommissionRate,
    useAffiliatePeriodStats,
} from "../../api/hooks";
import toast from "react-hot-toast";

type DetailTab = "referrals" | "commissions" | "payouts";

function StatusBadge({ status }: { status: "active" | "suspended" | "pending" }) {
    const map = {
        active: "bg-emerald-50 text-emerald-700",
        suspended: "bg-red-50 text-red-700",
        pending: "bg-amber-50 text-amber-700",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[status]}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

// ─── Payout Detail Row ──────────────────────────────────────

function PayoutDetailRow({ payout }: { payout: AdminAffiliatePayout }) {
    const [expanded, setExpanded] = useState(false);

    let paymentDetailsObj: Record<string, string> | null = null;
    if (payout.paymentDetails) {
        try {
            paymentDetailsObj = JSON.parse(payout.paymentDetails);
        } catch {
            paymentDetailsObj = null;
        }
    }

    return (
        <>
            <tr
                className="border-b border-border-light hover:bg-background-secondary/50 transition-colors cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <td className="px-2 py-3 text-muted">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-heading">
                    {payout.currency === "NGN" ? "\u20a6" : "$"}{payout.amount}
                </td>
                <td className="px-5 py-3 text-muted capitalize">
                    {payout.paymentMethod?.replace("_", " ")}
                </td>
                <td className="px-5 py-3">
                    <CommissionStatusBadge status={payout.status} />
                </td>
                <td className="px-5 py-3 text-muted hidden sm:table-cell">
                    {new Date(payout.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-muted hidden sm:table-cell">
                    {payout.processedAt
                        ? new Date(payout.processedAt).toLocaleDateString()
                        : "—"}
                </td>
            </tr>
            {expanded && (
                <tr className="bg-background-secondary/30 border-b border-border-light">
                    <td colSpan={6} className="px-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Payment Details */}
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                                    <Banknote size={13} />
                                    Payment Details
                                </div>
                                {paymentDetailsObj ? (
                                    <div className="bg-white rounded-lg border border-border-light/50 p-3 space-y-1.5">
                                        {Object.entries(paymentDetailsObj).map(([key, val]) => (
                                            <div key={key} className="flex items-center gap-2 text-sm">
                                                <span className="text-muted capitalize min-w-[100px]">
                                                    {key.replace(/_/g, " ")}:
                                                </span>
                                                <span className="text-heading font-medium">
                                                    {String(val)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : payout.paymentDetails ? (
                                    <div className="bg-white rounded-lg border border-border-light/50 p-3">
                                        <p className="text-sm text-heading font-mono whitespace-pre-wrap">
                                            {payout.paymentDetails}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted italic">No payment details recorded</p>
                                )}
                            </div>
                            {/* Notes */}
                            {payout.notes && (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                                        Admin Notes
                                    </div>
                                    <p className="text-sm text-heading bg-white rounded-lg border border-border-light/50 p-3">
                                        {payout.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function formatReferenceType(type: string): string {
    const map: Record<string, string> = {
        "credit_purchase": "Credit Purchase",
        "ebook": "Ebook",
        "plan_generation": "Plan Generation",
        "subscription": "Subscription",
    };
    return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function CommissionStatusBadge({ status }: { status: string }) {
    const lower = status.toLowerCase();
    const map: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700",
        approved: "bg-emerald-50 text-emerald-700",
        paid: "bg-blue-50 text-blue-700",
        rejected: "bg-red-50 text-red-700",
    };
    const cls = map[lower] ?? "bg-button-secondary text-muted";
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
            {status}
        </span>
    );
}

export default function AffiliateDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const affiliateId = Number(id);

    const [activeTab, setActiveTab] = useState<DetailTab>("referrals");
    const [copied, setCopied] = useState(false);
    const [editingRate, setEditingRate] = useState(false);
    const [rateInput, setRateInput] = useState("");
    const [referralSearch, setReferralSearch] = useState("");
    const [referralStatusFilter, setReferralStatusFilter] = useState("all");
    const [referralSort, setReferralSort] = useState<"date" | "status">("date");

    const [period, setPeriod] = useState<string>("all");

    const periodDates = useMemo(() => {
        if (period === "all") return { startDate: undefined, endDate: undefined };
        const now = new Date();
        const start = new Date(now);
        const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
        start.setDate(start.getDate() - days);
        return {
            startDate: start.toISOString().split("T")[0],
            endDate: now.toISOString().split("T")[0],
        };
    }, [period]);

    const { data: affiliate, isLoading } = useAffiliateDetail(affiliateId);
    const { data: periodStats } = useAffiliatePeriodStats(affiliateId, periodDates.startDate, periodDates.endDate);
    const suspendMutation = useSuspendAffiliate();
    const activateMutation = useActivateAffiliate();
    const updateRateMutation = useUpdateAffiliateCommissionRate();

    const handleCopyCode = () => {
        if (!affiliate) return;
        navigator.clipboard.writeText(affiliate.referralCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const handleSuspend = () => {
        if (!affiliate) return;
        if (!confirm(`Suspend ${affiliate.userName}?`)) return;
        suspendMutation.mutate(affiliate.id, {
            onSuccess: () => toast.success("Affiliate suspended"),
            onError: () => toast.error("Failed to suspend affiliate"),
        });
    };

    const handleActivate = () => {
        if (!affiliate) return;
        activateMutation.mutate(affiliate.id, {
            onSuccess: () => toast.success("Affiliate activated"),
            onError: () => toast.error("Failed to activate affiliate"),
        });
    };

    const handleUpdateRate = () => {
        const rate = parseFloat(rateInput);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toast.error("Enter a valid rate between 0 and 100");
            return;
        }
        updateRateMutation.mutate(
            { id: affiliateId, rate },
            {
                onSuccess: () => {
                    toast.success("Commission rate updated");
                    setEditingRate(false);
                    setRateInput("");
                },
                onError: () => toast.error("Failed to update commission rate"),
            },
        );
    };

    const filteredReferrals = useMemo(() => {
        if (!affiliate?.referrals) return [];
        let list = [...affiliate.referrals];

        // Filter by search
        if (referralSearch.trim()) {
            const q = referralSearch.toLowerCase();
            list = list.filter(
                (r) =>
                    r.referredUserName.toLowerCase().includes(q) ||
                    r.referredUserEmail.toLowerCase().includes(q) ||
                    r.referralCode.toLowerCase().includes(q),
            );
        }

        // Filter by status
        if (referralStatusFilter !== "all") {
            list = list.filter((r) => r.status === referralStatusFilter);
        }

        // Sort
        list.sort((a, b) => {
            if (referralSort === "status") {
                return a.status.localeCompare(b.status);
            }
            // Default: sort by date descending
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return list;
    }, [affiliate?.referrals, referralSearch, referralStatusFilter, referralSort]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-accent" size={28} />
            </div>
        );
    }

    if (!affiliate) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-muted">Affiliate not found</p>
                <button
                    onClick={() => navigate("/admin/affiliates")}
                    className="flex items-center gap-2 text-sm text-accent hover:underline"
                >
                    <ArrowLeft size={14} /> Back to Affiliates
                </button>
            </div>
        );
    }

    const tabs: { key: DetailTab; label: string; count: number }[] = [
        { key: "referrals", label: "Referrals", count: affiliate.referrals?.length ?? 0 },
        { key: "commissions", label: "Commissions", count: affiliate.commissions?.length ?? 0 },
        { key: "payouts", label: "Payouts", count: affiliate.payouts?.length ?? 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Back */}
            <button
                onClick={() => navigate("/admin/affiliates")}
                className="flex items-center gap-2 text-sm text-muted hover:text-heading transition-colors"
            >
                <ArrowLeft size={14} />
                Back to Affiliates
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-serif font-bold text-lg shrink-0">
                            {affiliate.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-serif text-heading">
                                    {affiliate.userName}
                                </h1>
                                <StatusBadge status={affiliate.status} />
                            </div>
                            <p className="text-sm text-muted mt-0.5">{affiliate.userEmail}</p>

                            {/* Referral code */}
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs text-muted">Referral code:</span>
                                <code className="px-2 py-0.5 bg-button-secondary rounded text-xs font-mono text-heading">
                                    {affiliate.referralCode}
                                </code>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-1 rounded hover:bg-button-secondary transition-colors text-muted hover:text-heading"
                                    title="Copy code"
                                >
                                    {copied ? (
                                        <Check size={13} className="text-emerald-600" />
                                    ) : (
                                        <Copy size={13} />
                                    )}
                                </button>
                            </div>

                            {/* Commission rate */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted">Commission rate:</span>
                                {editingRate ? (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="number"
                                            value={rateInput}
                                            onChange={(e) => setRateInput(e.target.value)}
                                            placeholder={affiliate.commissionRate}
                                            min={0}
                                            max={100}
                                            step={0.1}
                                            className="w-20 px-2 py-0.5 border border-border-light/50 rounded text-xs focus:outline-none focus:ring-2 focus:ring-accent/20"
                                        />
                                        <span className="text-xs text-muted">%</span>
                                        <button
                                            onClick={handleUpdateRate}
                                            disabled={updateRateMutation.isPending}
                                            className="py-0.5 px-2 bg-accent text-white text-xs rounded hover:bg-accent/90 disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingRate(false);
                                                setRateInput("");
                                            }}
                                            className="p-0.5 text-muted hover:text-heading"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-heading">
                                            {affiliate.commissionRate}%
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditingRate(true);
                                                setRateInput(affiliate.commissionRate);
                                            }}
                                            className="p-0.5 text-muted hover:text-heading transition-colors"
                                            title="Edit rate"
                                        >
                                            <Edit2 size={11} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {affiliate.status === "active" ? (
                            <button
                                onClick={handleSuspend}
                                disabled={suspendMutation.isPending}
                                className="flex items-center gap-1.5 py-2 px-4 bg-red-50 text-red-700 text-xs font-medium rounded-xl hover:bg-red-100 disabled:opacity-50"
                            >
                                <PauseCircle size={14} />
                                Suspend
                            </button>
                        ) : (
                            <button
                                onClick={handleActivate}
                                disabled={activateMutation.isPending}
                                className="flex items-center gap-1.5 py-2 px-4 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl hover:bg-emerald-100 disabled:opacity-50"
                            >
                                <PlayCircle size={14} />
                                Activate
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 border-t border-border-light">
                    {[
                        {
                            label: "Clicks",
                            value: affiliate.totalClicks.toLocaleString(),
                            icon: MousePointerClick,
                        },
                        {
                            label: "Conversions",
                            value: affiliate.totalConversions.toLocaleString(),
                            icon: TrendingUp,
                        },
                        {
                            label: "Earned (USD)",
                            value: `$${affiliate.totalCommissionEarned}`,
                            icon: HandCoins,
                        },
                        {
                            label: "Earned (NGN)",
                            value: `\u20a6${affiliate.totalCommissionEarnedNgn ?? "0"}`,
                            icon: HandCoins,
                        },
                        {
                            label: "Pending (USD)",
                            value: `$${affiliate.pendingCommission}`,
                            icon: RefreshCw,
                        },
                        {
                            label: "Paid Out (USD)",
                            value: `$${affiliate.totalPaidOut}`,
                            icon: Wallet,
                        },
                    ].map((s) => (
                        <div key={s.label} className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-muted">
                                <s.icon size={13} />
                                <span className="text-xs uppercase tracking-wider font-semibold">
                                    {s.label}
                                </span>
                            </div>
                            <p className="text-xl font-serif text-heading">{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Period Tracking ── */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-heading">Period Tracking</h2>
                        <p className="text-xs text-muted mt-0.5">
                            View performance for a specific time period
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-button-secondary rounded-lg p-1">
                        <Calendar size={14} className="text-muted ml-1" />
                        {["all", "7d", "30d", "90d", "1y"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                                    period === p
                                        ? "bg-white text-heading shadow-sm border border-border-light/50"
                                        : "text-muted hover:text-heading"
                                }`}
                            >
                                {p === "all" ? "All" : p === "7d" ? "7 days" : p === "30d" ? "30 days" : p === "90d" ? "90 days" : "1 year"}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider text-muted font-semibold">Clicks</span>
                        <p className="text-xl font-serif text-heading">
                            {periodStats?.clicks?.toLocaleString() ?? affiliate?.totalClicks?.toLocaleString() ?? "0"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider text-muted font-semibold">Conversions</span>
                        <p className="text-xl font-serif text-heading">
                            {periodStats?.conversions?.toLocaleString() ?? affiliate?.totalConversions?.toLocaleString() ?? "0"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider text-muted font-semibold">Earned (USD)</span>
                        <p className="text-xl font-serif text-heading">
                            ${periodStats?.commissionEarnedUsd ?? affiliate?.totalCommissionEarned ?? "0"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider text-muted font-semibold">Earned (NGN)</span>
                        <p className="text-xl font-serif text-heading">
                            {"\u20a6"}{periodStats?.commissionEarnedNgn ?? affiliate?.totalCommissionEarnedNgn ?? "0"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex items-center gap-2 border-b border-border-light">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === t.key
                                ? "border-accent text-accent"
                                : "border-transparent text-muted hover:text-heading"
                        }`}
                    >
                        {t.label}
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-button-secondary text-heading">
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Referrals ── */}
            {activeTab === "referrals" && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    {affiliate.referrals && affiliate.referrals.length > 0 && (
                        <div className="p-4 border-b border-border-light flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    value={referralSearch}
                                    onChange={(e) => setReferralSearch(e.target.value)}
                                    placeholder="Search referrals…"
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-border-light/50 rounded-lg text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
                                />
                            </div>
                            {/* Status filter */}
                            <select
                                value={referralStatusFilter}
                                onChange={(e) => setReferralStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-border-light/50 rounded-lg text-xs text-heading focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="converted">Converted</option>
                            </select>
                            {/* Sort */}
                            <select
                                value={referralSort}
                                onChange={(e) => setReferralSort(e.target.value as "date" | "status")}
                                className="px-3 py-2 bg-white border border-border-light/50 rounded-lg text-xs text-heading focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                <option value="date">Sort by date</option>
                                <option value="status">Sort by status</option>
                            </select>
                        </div>
                    )}
                    {!affiliate.referrals?.length ? (
                        <div className="p-12 text-center">
                            <Users size={36} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted text-sm">No referrals yet</p>
                        </div>
                    ) : filteredReferrals.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users size={36} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted text-sm">No referrals match your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Referred User
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden md:table-cell">
                                            Code Used
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Status
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Converted
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Referred At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReferrals.map((ref) => (
                                        <tr
                                            key={ref.id}
                                            className="border-b border-border-light hover:bg-background-secondary/50 transition-colors"
                                        >
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-heading">
                                                    {ref.referredUserName}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {ref.referredUserEmail}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 hidden md:table-cell">
                                                <code className="px-1.5 py-0.5 bg-button-secondary rounded text-xs font-mono">
                                                    {ref.referralCode}
                                                </code>
                                            </td>
                                            <td className="px-5 py-3">
                                                <CommissionStatusBadge status={ref.status} />
                                            </td>
                                            <td className="px-5 py-3 text-muted hidden sm:table-cell">
                                                {ref.convertedAt
                                                    ? new Date(ref.convertedAt).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-muted hidden sm:table-cell">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Commissions ── */}
            {activeTab === "commissions" && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    {!affiliate.commissions?.length ? (
                        <div className="p-12 text-center">
                            <Percent size={36} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted text-sm">No commissions yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Amount
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden md:table-cell">
                                            Base Amount
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden md:table-cell">
                                            Rate
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Status
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden lg:table-cell">
                                            Customer
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Source
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {affiliate.commissions.map((com) => (
                                        <tr
                                            key={com.id}
                                            className="border-b border-border-light hover:bg-background-secondary/50 transition-colors"
                                        >
                                            <td className="px-5 py-3 text-right font-semibold text-heading">
                                                {com.currency === "NGN" ? "\u20a6" : "$"}{com.amount}
                                            </td>
                                            <td className="px-5 py-3 text-right text-muted hidden md:table-cell">
                                                {com.currency === "NGN" ? "\u20a6" : "$"}{com.baseAmount}
                                            </td>
                                            <td className="px-5 py-3 text-right text-muted hidden md:table-cell">
                                                {com.rate}%
                                            </td>
                                            <td className="px-5 py-3">
                                                <CommissionStatusBadge status={com.status} />
                                            </td>
                                            <td className="px-5 py-3 text-muted hidden lg:table-cell">
                                                {com.customerEmail ?? "—"}
                                            </td>
                                            <td className="px-5 py-3 hidden sm:table-cell">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-medium">
                                                        {formatReferenceType(com.referenceType)}
                                                    </span>
                                                    {com.referenceId && (
                                                        <span className="text-xs text-muted">
                                                            #{com.referenceId}
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-muted hidden sm:table-cell">
                                                {new Date(com.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Payouts ── */}
            {activeTab === "payouts" && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    {!affiliate.payouts?.length ? (
                        <div className="p-12 text-center">
                            <Wallet size={36} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted text-sm">No payouts yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="w-8 px-2 py-3"></th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Amount
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Method
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Status
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Requested
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Processed
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {affiliate.payouts.map((payout) => (
                                        <PayoutDetailRow key={payout.id} payout={payout} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
