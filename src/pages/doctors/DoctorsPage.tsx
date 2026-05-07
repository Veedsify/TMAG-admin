import { useMemo, useState } from "react";
import {
    Stethoscope,
    CheckCircle,
    XCircle,
    UserX,
    ClipboardList,
    Users,
    Activity,
    Search,
    Loader2,
} from "lucide-react";
import {
    useDoctorApplications,
    useDoctors,
    useDoctorStats,
    useApproveDoctorApplication,
    useRejectDoctorApplication,
    useRevokeDoctor,
} from "../../api/hooks";
import toast from "react-hot-toast";

type Tab = "applications" | "doctors";

export default function DoctorsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("applications");
    const [search, setSearch] = useState("");
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const { data: stats } = useDoctorStats();
    const { data: applications, isLoading: appsLoading } =
        useDoctorApplications();
    const { data: doctors, isLoading: docsLoading } = useDoctors();

    const approveMutation = useApproveDoctorApplication();
    const rejectMutation = useRejectDoctorApplication();
    const revokeMutation = useRevokeDoctor();

    const filteredApplications = (applications ?? []).filter((a) =>
        `${a.firstName} ${a.lastName} ${a.email} ${a.licenseNumber ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    console.log(" Doctors:", doctors);

    const filteredDoctors = useMemo(() => {
        return (doctors ?? []).filter((d) =>
            `${d.firstName} ${d.lastName} ${d.email} ${d.licenseNumber ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [doctors, search]);

    const handleApprove = (userId: number) => {
        approveMutation.mutate(
            { userId },
            {
                onSuccess: () => toast.success("Doctor application approved"),
                onError: () => toast.error("Failed to approve application"),
            },
        );
    };

    const handleReject = (userId: number) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        rejectMutation.mutate(
            { userId, reason: rejectionReason },
            {
                onSuccess: () => {
                    toast.success("Doctor application rejected");
                    setRejectingId(null);
                    setRejectionReason("");
                },
                onError: () => toast.error("Failed to reject application"),
            },
        );
    };

    const handleRevoke = (userId: number, name: string) => {
        if (
            !confirm(
                `Are you sure you want to revoke doctor privileges for ${name}?`,
            )
        )
            return;
        revokeMutation.mutate(
            { userId },
            {
                onSuccess: () => toast.success("Doctor privileges revoked"),
                onError: () => toast.error("Failed to revoke doctor"),
            },
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Stethoscope size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">
                            Doctor Management
                        </h1>
                        <p className="text-sm text-muted">
                            Review applications and manage verified doctors
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Doctors",
                        value: stats?.totalDoctors ?? 0,
                        icon: Users,
                    },
                    {
                        label: "Pending Apps",
                        value: stats?.pendingApplications ?? 0,
                        icon: ClipboardList,
                    },
                    {
                        label: "Approved Today",
                        value: stats?.approvedToday ?? 0,
                        icon: CheckCircle,
                    },
                    {
                        label: "Validated Plans",
                        value: stats?.totalValidatedPlans ?? 0,
                        icon: Activity,
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
                {[
                    {
                        key: "applications" as Tab,
                        label: "Applications",
                        count: applications?.length ?? 0,
                    },
                    {
                        key: "doctors" as Tab,
                        label: "Verified Doctors",
                        count: doctors?.length ?? 0,
                    },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === t.key ?
                                "border-accent text-accent"
                            :   "border-transparent text-muted hover:text-heading"
                        }`}
                    >
                        {t.label}
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-button-secondary text-heading">
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
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

            {/* Applications Tab */}
            {activeTab === "applications" && (
                <div className="space-y-3">
                    {appsLoading ?
                        <div className="flex items-center justify-center h-48">
                            <Loader2
                                className="animate-spin text-accent"
                                size={24}
                            />
                        </div>
                    : filteredApplications.length > 0 ?
                        filteredApplications.map((app) => (
                            <div
                                key={app.userId}
                                className="bg-white rounded-2xl border border-border-light/50 p-5"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {app.profilePictureUrl && (
                                                <img src={app.profilePictureUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                                            )}
                                            <h3 className="font-semibold text-heading">
                                                Dr. {app.firstName}{" "}
                                                {app.lastName}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                                                {app.applicationStatus}
                                            </span>
                                        </div>
                                        {app.bio && <p className="mb-3 text-sm text-muted">{app.bio}</p>}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                            <p className="text-muted">
                                                <span className="text-heading">
                                                    Email:
                                                </span>{" "}
                                                {app.email}
                                            </p>
                                            {app.phone && (
                                                <p className="text-muted">
                                                    <span className="text-heading">
                                                        Phone:
                                                    </span>{" "}
                                                    {app.phone}
                                                </p>
                                            )}
                                            {app.licenseNumber && (
                                                <p className="text-muted">
                                                    <span className="text-heading">
                                                        License:
                                                    </span>{" "}
                                                    {app.licenseNumber}
                                                </p>
                                            )}
                                            {app.applicationSubmittedAt && (
                                                <p className="text-muted">
                                                    <span className="text-heading">
                                                        Applied:
                                                    </span>{" "}
                                                    {new Date(
                                                        app.applicationSubmittedAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {app.licenseDocumentUrl && (
                                                <a
                                                    href={
                                                        app.licenseDocumentUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                                                >
                                                    Signature
                                                </a>
                                            )}
                                            {app.practicingLicenseUrl && (
                                                <a
                                                    href={app.practicingLicenseUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                                                >
                                                    Practicing License
                                                </a>
                                            )}
                                            {app.travelMedicineCertificateUrl && (
                                                <a
                                                    href={app.travelMedicineCertificateUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                                                >
                                                    Travel Medicine Cert
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {app.applicationStatus === "PENDING" && (
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            {rejectingId === app.userId ?
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) =>
                                                            setRejectionReason(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Rejection reason..."
                                                        rows={2}
                                                        className="w-full px-3 py-2 text-xs border border-border-light/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleReject(
                                                                    app.userId,
                                                                )
                                                            }
                                                            disabled={
                                                                rejectMutation.isPending
                                                            }
                                                            className="flex-1 py-1.5 px-3 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectingId(
                                                                    null,
                                                                );
                                                                setRejectionReason(
                                                                    "",
                                                                );
                                                            }}
                                                            className="py-1.5 px-3 border border-border-light/50 text-xs rounded-lg hover:bg-button-secondary"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            :   <>
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(
                                                                app.userId,
                                                            )
                                                        }
                                                        disabled={
                                                            approveMutation.isPending
                                                        }
                                                        className="flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircle
                                                            size={14}
                                                        />{" "}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setRejectingId(
                                                                app.userId,
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-1.5 py-2 px-4 bg-red-50 text-red-700 text-xs font-medium rounded-xl hover:bg-red-100"
                                                    >
                                                        <XCircle size={14} />{" "}
                                                        Reject
                                                    </button>
                                                </>
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    :   <div className="bg-white rounded-2xl border border-border-light/50 p-12 text-center">
                            <ClipboardList
                                size={40}
                                className="mx-auto mb-3 text-muted/40"
                            />
                            <p className="text-muted">
                                No pending applications
                            </p>
                        </div>
                    }
                </div>
            )}

            {/* Doctors Tab */}
            {activeTab === "doctors" && (
                <div className="space-y-3">
                    {docsLoading ?
                        <div className="flex items-center justify-center h-48">
                            <Loader2
                                className="animate-spin text-accent"
                                size={24}
                            />
                        </div>
                    : filteredDoctors.length > 0 ?
                        filteredDoctors.map((doc) => (
                            <div
                                key={doc.userId}
                                className="bg-white rounded-2xl border border-border-light/50 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        {doc.profilePictureUrl && (
                                            <img src={doc.profilePictureUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                                        )}
                                        <h3 className="font-semibold text-heading">
                                            Dr. {doc.firstName} {doc.lastName}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                                        <span>{doc.email}</span>
                                        {doc.phone && <span>{doc.phone}</span>}
                                        {doc.licenseNumber && (
                                            <span>
                                                License: {doc.licenseNumber}
                                            </span>
                                        )}
                                    </div>
                                    {doc.bio && <p className="mt-2 text-sm text-muted">{doc.bio}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-serif text-heading">
                                            {doc.validatedPlansCount}
                                        </p>
                                        <p className="text-xs text-muted">
                                            Validated Plans
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleRevoke(
                                                doc.userId,
                                                `Dr. ${doc.firstName} ${doc.lastName}`,
                                            )
                                        }
                                        disabled={revokeMutation.isPending}
                                        className="flex items-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl hover:bg-red-100 disabled:opacity-50"
                                    >
                                        <UserX size={14} /> Revoke
                                    </button>
                                </div>
                            </div>
                        ))
                    :   <div className="bg-white rounded-2xl border border-border-light/50 p-12 text-center">
                            <Users
                                size={40}
                                className="mx-auto mb-3 text-muted/40"
                            />
                            <p className="text-muted">No verified doctors</p>
                        </div>
                    }
                </div>
            )}
        </div>
    );
}
