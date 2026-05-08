import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Copy,
    Check,
    Loader2,
    PauseCircle,
    PlayCircle,
    Percent,
    TrendingUp,
    MousePointerClick,
    RefreshCw,
    Wallet,
    HandCoins,
    Users,
    BadgeCheck,
    Edit2,
    X,
} from "lucide-react";
import {
    useAffiliateDetail,
    useSuspendAffiliate,
    useActivateAffiliate,
    useUpdateAffiliateCommissionRate,
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

    const { data: affiliate, isLoading } = useAffiliateDetail(affiliateId);
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
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-5 border-t border-border-light">
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
                            label: "Earned",
                            value: affiliate.totalCommissionEarned,
                            icon: HandCoins,
                        },
                        {
                            label: "Pending",
                            value: affiliate.pendingCommission,
                            icon: RefreshCw,
                        },
                        {
                            label: "Paid Out",
                            value: affiliate.totalPaidOut,
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
                    {!affiliate.referrals?.length ? (
                        <div className="p-12 text-center">
                            <Users size={36} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted text-sm">No referrals yet</p>
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
                                    {affiliate.referrals.map((ref) => (
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
                                            Type
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
                                                {com.amount}
                                            </td>
                                            <td className="px-5 py-3 text-right text-muted hidden md:table-cell">
                                                {com.baseAmount}
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
                                            <td className="px-5 py-3 text-muted hidden sm:table-cell">
                                                {com.referenceType}
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
                                        <tr
                                            key={payout.id}
                                            className="border-b border-border-light hover:bg-background-secondary/50 transition-colors"
                                        >
                                            <td className="px-5 py-3 text-right font-semibold text-heading">
                                                {payout.amount}
                                            </td>
                                            <td className="px-5 py-3 text-muted">
                                                {payout.paymentMethod}
                                            </td>
                                            <td className="px-5 py-3">
                                                <CommissionStatusBadge status={payout.status} />
                                            </td>
                                            <td className="px-5 py-3 text-muted hidden sm:table-cell">
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3 text-muted hidden sm:table-cell">
                                                {payout.processedAt
                                                    ? new Date(
                                                          payout.processedAt,
                                                      ).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
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
