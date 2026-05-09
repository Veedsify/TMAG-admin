import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    HandCoins,
    Users,
    ClipboardList,
    TrendingUp,
    Search,
    Loader2,
    CheckCircle,
    XCircle,
    MessageCircle,
    ExternalLink,
    PauseCircle,
    PlayCircle,
    MousePointerClick,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Banknote,
} from "lucide-react";
import {
    useAffiliateApplications,
    useAffiliates,
    useAffiliateStats,
    useApproveAffiliateApplication,
    useRejectAffiliateApplication,
    useRequestAffiliateInfo,
    useSuspendAffiliate,
    useActivateAffiliate,
    useAffiliatePayouts,
    useApproveAffiliatePayout,
    useRejectAffiliatePayout,
    useCompleteAffiliatePayout,
} from "../../api/hooks";
import toast from "react-hot-toast";
import type { AffiliateApplication, AdminAffiliatePayout } from "../../api/types";

type Tab = "applications" | "affiliates" | "overview" | "payouts";

const statusBadge = (status: AffiliateApplication["status"]) => {
    const map = {
        pending: "bg-amber-50 text-amber-700",
        approved: "bg-emerald-50 text-emerald-700",
        rejected: "bg-red-50 text-red-700",
        info_requested: "bg-blue-50 text-blue-700",
    };
    const labels = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        info_requested: "Info Requested",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[status]}`}
        >
            {labels[status]}
        </span>
    );
};

const affiliateStatusBadge = (status: "active" | "suspended" | "pending") => {
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
};

// ─── Payout Table Row (expandable) ───────────────────────────

function PayoutTableRow({
    payout,
    onApprove,
    onRejectInit,
    onComplete,
    isRejecting,
    payoutRejectReason,
    onRejectReasonChange,
    onConfirmReject,
    onCancelReject,
}: {
    payout: AdminAffiliatePayout;
    onApprove: () => void;
    onRejectInit: () => void;
    onComplete: () => void;
    isRejecting: boolean;
    payoutRejectReason: string;
    onRejectReasonChange: (v: string) => void;
    onConfirmReject: () => void;
    onCancelReject: () => void;
}) {
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
                <td className="px-2 py-4 text-muted">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </td>
                <td className="px-5 py-4">
                    <p className="font-medium text-heading">{payout.affiliateName}</p>
                    <p className="text-xs text-muted">{payout.affiliateEmail}</p>
                </td>
                <td className="px-5 py-4 text-right font-semibold text-heading">
                    {payout.currency === "NGN" ? "\u20a6" : "$"}{parseFloat(payout.amount).toFixed(2)}
                </td>
                <td className="px-5 py-4 text-muted capitalize hidden md:table-cell">
                    {payout.paymentMethod?.replace("_", " ")}
                </td>
                <td className="px-5 py-4">
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            payout.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : payout.status === "failed"
                                    ? "bg-red-50 text-red-700"
                                    : payout.status === "processing"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-amber-50 text-amber-700"
                        }`}
                    >
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                </td>
                <td className="px-5 py-4 text-muted hidden sm:table-cell">
                    {new Date(payout.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                        {payout.status === "pending" && (
                            <>
                                <button
                                    onClick={onApprove}
                                    className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700"
                                >
                                    <CheckCircle size={12} />
                                    Approve
                                </button>
                                <button
                                    onClick={onRejectInit}
                                    className="flex items-center gap-1 py-1.5 px-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100"
                                >
                                    <XCircle size={12} />
                                    Reject
                                </button>
                            </>
                        )}
                        {payout.status === "processing" && (
                            <button
                                onClick={onComplete}
                                className="flex items-center gap-1 py-1.5 px-3 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                            >
                                <CheckCircle size={12} />
                                Complete
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-background-secondary/30 border-b border-border-light">
                    <td colSpan={7} className="px-5 py-4">
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
                        {/* Inline reject form */}
                        {isRejecting && (
                            <div className="mt-4 bg-red-50/40 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <textarea
                                        value={payoutRejectReason}
                                        onChange={(e) => onRejectReasonChange(e.target.value)}
                                        placeholder="Rejection reason..."
                                        rows={2}
                                        className="flex-1 px-3 py-2 text-xs border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={onConfirmReject}
                                            className="py-1.5 px-4 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={onCancelReject}
                                            className="py-1.5 px-4 border border-border-light/50 text-xs rounded-lg hover:bg-button-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

export default function AffiliatesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("applications");
    const [search, setSearch] = useState("");
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [requestingInfoId, setRequestingInfoId] = useState<number | null>(null);
    const [infoNotes, setInfoNotes] = useState("");

    const { data: stats } = useAffiliateStats();
    const { data: applications, isLoading: appsLoading } = useAffiliateApplications();
    const { data: affiliates, isLoading: affiliatesLoading } = useAffiliates();

    const approveMutation = useApproveAffiliateApplication();
    const rejectMutation = useRejectAffiliateApplication();
    const requestInfoMutation = useRequestAffiliateInfo();
    const suspendMutation = useSuspendAffiliate();
    const activateMutation = useActivateAffiliate();

    const { data: payouts, isLoading: payoutsLoading } = useAffiliatePayouts();
    const approvePayoutMutation = useApproveAffiliatePayout();
    const rejectPayoutMutation = useRejectAffiliatePayout();
    const completePayoutMutation = useCompleteAffiliatePayout();
    const [rejectingPayoutId, setRejectingPayoutId] = useState<number | null>(null);
    const [payoutRejectReason, setPayoutRejectReason] = useState("");

    const filteredApplications = useMemo(() => {
        return (applications ?? []).filter((a) =>
            `${a.fullName} ${a.email} ${a.companyName ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [applications, search]);

    const filteredAffiliates = useMemo(() => {
        return (affiliates ?? []).filter((a) =>
            `${a.userName} ${a.userEmail} ${a.referralCode}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [affiliates, search]);

    const handleApprove = (id: number) => {
        approveMutation.mutate(id, {
            onSuccess: () => toast.success("Application approved"),
            onError: () => toast.error("Failed to approve application"),
        });
    };

    const handleReject = (id: number) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        rejectMutation.mutate(
            { id, reason: rejectionReason },
            {
                onSuccess: () => {
                    toast.success("Application rejected");
                    setRejectingId(null);
                    setRejectionReason("");
                },
                onError: () => toast.error("Failed to reject application"),
            },
        );
    };

    const handleRequestInfo = (id: number) => {
        if (!infoNotes.trim()) {
            toast.error("Please enter a message");
            return;
        }
        requestInfoMutation.mutate(
            { id, notes: infoNotes },
            {
                onSuccess: () => {
                    toast.success("Info request sent");
                    setRequestingInfoId(null);
                    setInfoNotes("");
                },
                onError: () => toast.error("Failed to send request"),
            },
        );
    };

    const handleSuspend = (id: number, name: string) => {
        if (!confirm(`Suspend affiliate ${name}?`)) return;
        suspendMutation.mutate(id, {
            onSuccess: () => toast.success("Affiliate suspended"),
            onError: () => toast.error("Failed to suspend affiliate"),
        });
    };

    const handleActivate = (id: number) => {
        activateMutation.mutate(id, {
            onSuccess: () => toast.success("Affiliate activated"),
            onError: () => toast.error("Failed to activate affiliate"),
        });
    };

    const tabs: { key: Tab; label: string; count?: number }[] = [
        {
            key: "applications",
            label: "Applications",
            count: applications?.length ?? 0,
        },
        {
            key: "affiliates",
            label: "Affiliates",
            count: affiliates?.length ?? 0,
        },
        { key: "overview", label: "Overview" },
        {
            key: "payouts",
            label: "Payouts",
            count: payouts?.length ?? 0,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <HandCoins size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">
                            Affiliate Management
                        </h1>
                        <p className="text-sm text-muted">
                            Review applications and manage affiliate partners
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Active Affiliates",
                        value: stats?.totalActiveAffiliates ?? 0,
                        icon: Users,
                    },
                    {
                        label: "Pending Applications",
                        value: stats?.totalPendingApplications ?? 0,
                        icon: ClipboardList,
                    },
                    {
                        label: "Commission Paid",
                        value: stats?.totalCommissionPaid ?? "$0.00",
                        icon: HandCoins,
                    },
                    {
                        label: "Commission Pending",
                        value: stats?.totalCommissionPending ?? "$0.00",
                        icon: TrendingUp,
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-white rounded-2xl border border-border-light/50 p-4 sm:p-6 flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                                {s.label}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                <s.icon className="w-4 h-4 text-accent" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-serif text-heading">
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border-light">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => {
                            setActiveTab(t.key);
                            setSearch("");
                        }}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === t.key
                                ? "border-accent text-accent"
                                : "border-transparent text-muted hover:text-heading"
                        }`}
                    >
                        {t.label}
                        {t.count !== undefined && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-button-secondary text-heading">
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search (not shown on overview tab) */}
            {activeTab !== "overview" && (
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-border-light/50 rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
                    />
                </div>
            )}

            {/* ── Applications Tab ── */}
            {activeTab === "applications" && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    {appsLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="animate-spin text-accent" size={24} />
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardList
                                size={40}
                                className="mx-auto mb-3 text-muted/40"
                            />
                            <p className="text-muted">No applications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Name
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden md:table-cell">
                                            Email
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden lg:table-cell">
                                            Company
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden lg:table-cell">
                                            Monthly Reach
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Submitted
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Status
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app) => (
                                        <Fragment key={app.id}>
                                            <tr
                                                key={app.id}
                                                className="border-b border-border-light hover:bg-background-secondary/50 transition-colors"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-heading">
                                                        {app.fullName}
                                                    </p>
                                                    {app.websiteUrl && (
                                                        <a
                                                            href={app.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-accent hover:underline flex items-center gap-1 mt-0.5"
                                                        >
                                                            <ExternalLink size={10} />
                                                            Website
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-muted hidden md:table-cell">
                                                    {app.email}
                                                </td>
                                                <td className="px-5 py-4 text-muted hidden lg:table-cell">
                                                    {app.companyName ?? "—"}
                                                </td>
                                                <td className="px-5 py-4 text-muted hidden lg:table-cell">
                                                    {app.estimatedMonthlyReach ?? "—"}
                                                </td>
                                                <td className="px-5 py-4 text-muted hidden sm:table-cell">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {statusBadge(app.status)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {app.status === "pending" && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleApprove(app.id)}
                                                                disabled={approveMutation.isPending}
                                                                className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                <CheckCircle size={12} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setRejectingId(app.id);
                                                                    setRequestingInfoId(null);
                                                                    setInfoNotes("");
                                                                }}
                                                                className="flex items-center gap-1 py-1.5 px-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100"
                                                            >
                                                                <XCircle size={12} />
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setRequestingInfoId(app.id);
                                                                    setRejectingId(null);
                                                                    setRejectionReason("");
                                                                }}
                                                                className="flex items-center gap-1 py-1.5 px-3 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100"
                                                            >
                                                                <MessageCircle size={12} />
                                                                Info
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {/* Inline reject form */}
                                            {rejectingId === app.id && (
                                                <tr
                                                    key={`reject-${app.id}`}
                                                    className="bg-red-50/40 border-b border-border-light"
                                                >
                                                    <td colSpan={7} className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <textarea
                                                                value={rejectionReason}
                                                                onChange={(e) =>
                                                                    setRejectionReason(e.target.value)
                                                                }
                                                                placeholder="Rejection reason..."
                                                                rows={2}
                                                                className="flex-1 px-3 py-2 text-xs border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                                                            />
                                                            <div className="flex flex-col gap-1.5">
                                                                <button
                                                                    onClick={() =>
                                                                        handleReject(app.id)
                                                                    }
                                                                    disabled={
                                                                        rejectMutation.isPending
                                                                    }
                                                                    className="py-1.5 px-4 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setRejectingId(null);
                                                                        setRejectionReason("");
                                                                    }}
                                                                    className="py-1.5 px-4 border border-border-light/50 text-xs rounded-lg hover:bg-button-secondary"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {/* Inline info request form */}
                                            {requestingInfoId === app.id && (
                                                <tr
                                                    key={`info-${app.id}`}
                                                    className="bg-blue-50/40 border-b border-border-light"
                                                >
                                                    <td colSpan={7} className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <textarea
                                                                value={infoNotes}
                                                                onChange={(e) =>
                                                                    setInfoNotes(e.target.value)
                                                                }
                                                                placeholder="What additional information do you need?"
                                                                rows={2}
                                                                className="flex-1 px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                                                            />
                                                            <div className="flex flex-col gap-1.5">
                                                                <button
                                                                    onClick={() =>
                                                                        handleRequestInfo(app.id)
                                                                    }
                                                                    disabled={
                                                                        requestInfoMutation.isPending
                                                                    }
                                                                    className="py-1.5 px-4 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                                >
                                                                    Send
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setRequestingInfoId(null);
                                                                        setInfoNotes("");
                                                                    }}
                                                                    className="py-1.5 px-4 border border-border-light/50 text-xs rounded-lg hover:bg-button-secondary"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Affiliates Tab ── */}
            {activeTab === "affiliates" && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    {affiliatesLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="animate-spin text-accent" size={24} />
                        </div>
                    ) : filteredAffiliates.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users size={40} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted">No affiliates found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Name
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden md:table-cell">
                                            Referral Code
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Clicks
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Conversions
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden lg:table-cell">
                                            Earned
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Status
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAffiliates.map((aff) => (
                                        <tr
                                            key={aff.id}
                                            className="border-b border-border-light hover:bg-background-secondary/50 transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-heading">
                                                    {aff.userName}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {aff.userEmail}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <code className="px-1.5 py-0.5 bg-button-secondary rounded text-xs font-mono text-heading">
                                                    {aff.referralCode}
                                                </code>
                                            </td>
                                            <td className="px-5 py-4 text-right text-muted hidden sm:table-cell">
                                                {aff.totalClicks?.toLocaleString() ?? "0"}
                                            </td>
                                            <td className="px-5 py-4 text-right text-muted hidden sm:table-cell">
                                                {aff.totalConversions?.toLocaleString() ?? "0"}
                                            </td>
                                            <td className="px-5 py-4 text-right font-medium text-heading hidden lg:table-cell">
                                                {aff.totalCommissionEarned}
                                            </td>
                                            <td className="px-5 py-4">
                                                {affiliateStatusBadge(aff.status)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/affiliates/${aff.id}`,
                                                            )
                                                        }
                                                        className="flex items-center gap-1 py-1.5 px-3 bg-button-secondary text-heading text-xs font-medium rounded-lg hover:bg-border-light transition-colors"
                                                    >
                                                        <ExternalLink size={12} />
                                                        View
                                                    </button>
                                                    {aff.status === "active" ? (
                                                        <button
                                                            onClick={() =>
                                                                handleSuspend(
                                                                    aff.id,
                                                                    aff.userName,
                                                                )
                                                            }
                                                            disabled={suspendMutation.isPending}
                                                            className="flex items-center gap-1 py-1.5 px-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50"
                                                        >
                                                            <PauseCircle size={12} />
                                                            Suspend
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleActivate(aff.id)
                                                            }
                                                            disabled={activateMutation.isPending}
                                                            className="flex items-center gap-1 py-1.5 px-3 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                                                        >
                                                            <PlayCircle size={12} />
                                                            Activate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Stats grid — 6 cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {[
                            {
                                label: "Active Affiliates",
                                value: stats?.totalActiveAffiliates ?? 0,
                                icon: Users,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                            },
                            {
                                label: "Pending Applications",
                                value: stats?.totalPendingApplications ?? 0,
                                icon: ClipboardList,
                                color: "text-amber-600",
                                bg: "bg-amber-50",
                            },
                            {
                                label: "Total Clicks",
                                value: stats?.totalClicks?.toLocaleString() ?? "0",
                                icon: MousePointerClick,
                                color: "text-purple-600",
                                bg: "bg-purple-50",
                            },
                            {
                                label: "Conversion Rate",
                                value: stats?.conversionRate != null ? stats.conversionRate.toFixed(1) + "%" : "—",
                                icon: BarChart3,
                                color: "text-cyan-600",
                                bg: "bg-cyan-50",
                            },
                            {
                                label: "Commission Paid",
                                value: stats?.totalCommissionPaid ?? "$0.00",
                                icon: HandCoins,
                                color: "text-accent",
                                bg: "bg-accent/10",
                            },
                            {
                                label: "Commission Pending",
                                value: stats?.totalCommissionPending ?? "$0.00",
                                icon: TrendingUp,
                                color: "text-blue-600",
                                bg: "bg-blue-50",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="bg-white rounded-2xl border border-border-light/50 p-5 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                                        {s.label}
                                    </span>
                                    <div
                                        className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}
                                    >
                                        <s.icon className={`w-4 h-4 ${s.color}`} />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-serif text-heading">
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* 30-day clicks chart */}
                    {stats?.clicksChart && stats.clicksChart.length > 0 && (
                        <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="font-semibold text-heading">30-Day Clicks</h2>
                                    <p className="text-xs text-muted mt-0.5">
                                        Daily affiliate link clicks over the last 30 days
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-end gap-[3px] h-32">
                                {stats.clicksChart.map((point) => {
                                    const maxClick = Math.max(...stats.clicksChart!.map((p) => p.clicks), 1);
                                    const height = Math.max((point.clicks / maxClick) * 100, 2);
                                    return (
                                        <div
                                            key={point.date}
                                            className="flex-1 relative group"
                                            title={`${point.date}: ${point.clicks} clicks`}
                                        >
                                            <div
                                                className="w-full rounded-t bg-accent/40 hover:bg-accent/60 transition-colors cursor-pointer"
                                                style={{ height: `${height}%` }}
                                            />
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-darkest text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-10">
                                                {point.clicks} clicks
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Top affiliates */}
                    <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light">
                            <h2 className="font-semibold text-heading">Top Affiliates</h2>
                            <p className="text-xs text-muted mt-0.5">
                                Ranked by commission earned
                            </p>
                        </div>
                        {!stats?.topAffiliates?.length ? (
                            <div className="p-10 text-center">
                                <TrendingUp
                                    size={36}
                                    className="mx-auto mb-3 text-muted/40"
                                />
                                <p className="text-muted text-sm">No data yet</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Rank
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Name
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Earned (USD)
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">
                                            Earned (NGN)
                                        </th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">
                                            Conversions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topAffiliates.map((aff, i) => (
                                        <tr
                                            key={aff.id}
                                            className="border-b border-border-light hover:bg-background-secondary/50 transition-colors"
                                        >
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                        i === 0
                                                            ? "bg-amber-100 text-amber-700"
                                                            : i === 1
                                                              ? "bg-slate-100 text-slate-600"
                                                              : i === 2
                                                                ? "bg-orange-50 text-orange-600"
                                                                : "bg-button-secondary text-muted"
                                                    }`}
                                                >
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/affiliates/${aff.id}`)
                                                    }
                                                    className="font-medium text-heading hover:text-accent transition-colors"
                                                >
                                                    {aff.userName}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-heading">
                                                {aff.commissionEarned != null ? `$${Number(aff.commissionEarned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-heading hidden sm:table-cell">
                                                {aff.commissionEarnedNgn != null && Number(aff.commissionEarnedNgn) > 0
                                                    ? `\u20a6${Number(aff.commissionEarnedNgn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-right text-muted">
                                                {aff.conversions?.toLocaleString() ?? "0"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── Payouts Tab ── */}
            {activeTab === "payouts" && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    {payoutsLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="animate-spin text-accent" size={24} />
                        </div>
                    ) : !payouts?.length ? (
                        <div className="p-12 text-center">
                            <HandCoins size={40} className="mx-auto mb-3 text-muted/40" />
                            <p className="text-muted">No payout requests</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light">
                                        <th className="w-8 px-2 py-3"></th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">Affiliate</th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">Amount</th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden md:table-cell">Method</th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">Status</th>
                                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold hidden sm:table-cell">Requested</th>
                                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-muted font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((p: any) => (
                                        <PayoutTableRow
                                            key={p.id}
                                            payout={p}
                                            onApprove={() => approvePayoutMutation.mutate(p.id)}
                                            onRejectInit={() => { setRejectingPayoutId(p.id); setPayoutRejectReason(""); }}
                                            onComplete={() => completePayoutMutation.mutate(p.id)}
                                            isRejecting={rejectingPayoutId === p.id}
                                            payoutRejectReason={payoutRejectReason}
                                            onRejectReasonChange={setPayoutRejectReason}
                                            onConfirmReject={() => {
                                                if (!payoutRejectReason.trim()) { toast.error("Provide a reason"); return; }
                                                rejectPayoutMutation.mutate(
                                                    { payoutId: p.id, reason: payoutRejectReason },
                                                    { onSuccess: () => { setRejectingPayoutId(null); setPayoutRejectReason(""); toast.success("Payout rejected"); } }
                                                );
                                            }}
                                            onCancelReject={() => { setRejectingPayoutId(null); setPayoutRejectReason(""); }}
                                        />
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
