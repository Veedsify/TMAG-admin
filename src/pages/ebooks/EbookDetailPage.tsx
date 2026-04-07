import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    useAdminEbooks, useAdminEbookOrders, useAdminAddVersion,
    useAdminUpdateVersion, useAdminDeleteVersion
} from "../../api/hooks";
import type { AdminEbookVersion, CreateVersionRequest, UpdateVersionRequest } from "../../api/types";
import {
    ArrowLeft, Plus, Pencil, Trash2, Users, ShoppingBag,
    Globe, DollarSign, Loader2, AlertCircle, Check, X, Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";

export default function EbookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const ebookId = Number(id);

    const { data: ebooks, isLoading: ebooksLoading } = useAdminEbooks();
    const { data: orders, isLoading: ordersLoading } = useAdminEbookOrders(ebookId);
    const { mutate: addVersion, isPending: isAddingVersion } = useAdminAddVersion();
    const { mutate: updateVersion, isPending: isUpdatingVersion } = useAdminUpdateVersion();
    const { mutate: deleteVersion } = useAdminDeleteVersion();

    const ebook = ebooks?.find(e => e.id === ebookId);

    const [showVersionModal, setShowVersionModal] = useState(false);
    const [editingVersion, setEditingVersion] = useState<AdminEbookVersion | null>(null);
    const [versionForm, setVersionForm] = useState<Partial<CreateVersionRequest>>({});
    const [deleteVersionConfirm, setDeleteVersionConfirm] = useState<number | null>(null);
    const [orderSearch, setOrderSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const openAddVersion = () => {
        setEditingVersion(null);
        setVersionForm({ isActive: true, sortOrder: 0 });
        setShowVersionModal(true);
    };

    const openEditVersion = (version: AdminEbookVersion) => {
        setEditingVersion(version);
        setVersionForm({
            label: version.label,
            countryCode: version.countryCode ?? "",
            countryName: version.countryName ?? "",
            region: version.region ?? "",
            price: version.price,
            currency: version.currency,
            currencySymbol: version.currencySymbol,
            fileUrl: version.fileUrl ?? "",
            fileKey: version.fileKey ?? "",
            fileSizeMb: version.fileSizeMb ?? undefined,
            isActive: version.isActive,
            sortOrder: version.sortOrder,
        });
        setShowVersionModal(true);
    };

    const handleVersionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!versionForm.label || !versionForm.price || !versionForm.currency) {
            toast.error("Label, price, and currency are required");
            return;
        }
        if (editingVersion) {
            updateVersion(
                { ebookId, versionId: editingVersion.id, data: versionForm as UpdateVersionRequest },
                {
                    onSuccess: () => { toast.success("Edition updated"); setShowVersionModal(false); },
                    onError: () => toast.error("Failed to update edition"),
                }
            );
        } else {
            addVersion(
                { ebookId, data: versionForm as CreateVersionRequest },
                {
                    onSuccess: () => { toast.success("Edition added"); setShowVersionModal(false); },
                    onError: () => toast.error("Failed to add edition"),
                }
            );
        }
    };

    const filteredOrders = orders?.filter(o => {
        const matchSearch = !orderSearch ||
            o.buyerEmail?.toLowerCase().includes(orderSearch.toLowerCase()) ||
            o.buyerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
            o.txRef?.toLowerCase().includes(orderSearch.toLowerCase());
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const completedOrders = orders?.filter(o => o.status === "completed") ?? [];
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amountPaid ?? o.amount ?? 0), 0);

    if (ebooksLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>;
    }

    if (!ebook) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-heading font-medium">Ebook not found</p>
                <Link to="/admin/ebooks" className="text-accent text-sm underline mt-2 inline-block">← Back to ebooks</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/ebooks"
                    className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-serif text-heading truncate">{ebook.title}</h1>
                    <p className="text-sm text-muted">{ebook.author}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full",
                        ebook.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                        {ebook.isActive ? "Active" : "Inactive"}
                    </span>
                    <Link to={`/admin/ebooks/${ebookId}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted border border-border-light rounded-lg hover:bg-gray-50 hover:text-heading transition-colors">
                        <Settings className="w-3.5 h-3.5" /> Edit
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Orders", value: orders?.length ?? 0, icon: ShoppingBag },
                    { label: "Completed Sales", value: completedOrders.length, icon: Users },
                    { label: "Revenue", value: `~$${totalRevenue.toLocaleString()}`, icon: DollarSign },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-2xl border border-border-light p-4 text-center">
                        <Icon className="w-4 h-4 text-muted mx-auto mb-2" />
                        <p className="text-xl font-serif text-heading">{value}</p>
                        <p className="text-xs text-muted mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Editions/Versions */}
            <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                    <div>
                        <h2 className="font-semibold text-heading">Regional Editions</h2>
                        <p className="text-xs text-muted mt-0.5">Different pricing and files per region</p>
                    </div>
                    <button onClick={openAddVersion}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-dark text-white text-xs font-medium rounded-lg hover:bg-darkest transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Edition
                    </button>
                </div>
                {ebook.versions.length === 0 ? (
                    <div className="p-8 text-center">
                        <Globe className="w-8 h-8 text-muted mx-auto mb-2" />
                        <p className="text-sm text-muted">No editions yet. Add one to enable purchases.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border-light">
                        {ebook.versions.map(version => (
                            <div key={version.id} className="flex items-center gap-3 px-5 py-3.5">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-heading">{version.label}</p>
                                        {version.countryName && version.countryName !== version.label && (
                                            <span className="text-xs text-muted">({version.countryName})</span>
                                        )}
                                        {!version.isActive && (
                                            <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Disabled</span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 mt-0.5 text-xs text-muted">
                                        <span>{version.currencySymbol}{Number(version.price).toLocaleString()} {version.currency}</span>
                                        {version.fileSizeMb && <span>{version.fileSizeMb} MB</span>}
                                        {version.fileUrl && (
                                            <a href={version.fileUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-accent hover:underline">File ↗</a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={() => openEditVersion(version)}
                                        className="p-1.5 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteVersionConfirm(version.id)}
                                        className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Orders */}
            <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                    <div>
                        <h2 className="font-semibold text-heading">Orders & Buyers</h2>
                        <p className="text-xs text-muted mt-0.5">{completedOrders.length} completed purchases</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-xs border border-border-light rounded-lg px-2 py-1.5 text-body focus:outline-none"
                        >
                            <option value="all">All statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <input
                            type="text"
                            value={orderSearch}
                            onChange={e => setOrderSearch(e.target.value)}
                            placeholder="Search buyer or ref..."
                            className="text-xs border border-border-light rounded-lg px-3 py-1.5 text-body focus:outline-none w-44"
                        />
                    </div>
                </div>

                {ordersLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-muted" />
                    </div>
                ) : !filteredOrders || filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-8 h-8 text-muted mx-auto mb-2" />
                        <p className="text-sm text-muted">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-light bg-background-primary text-xs text-muted">
                                    {["Buyer", "Edition", "Amount", "Status", "Date", "Email Sent"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-background-primary/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-heading">{order.buyerName}</p>
                                            <p className="text-xs text-muted">{order.buyerEmail}</p>
                                            {order.isGuest && (
                                                <span className="text-[10px] text-muted bg-gray-100 px-1.5 py-0.5 rounded">Guest</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-background-primary px-2 py-1 rounded-lg text-body">
                                                {order.versionLabel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-heading">
                                            {order.currencySymbol}{(order.amountPaid ?? order.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-xs font-semibold px-2.5 py-1 rounded-full",
                                                order.status === "completed" ? "bg-green-50 text-green-700" :
                                                    order.status === "pending" ? "bg-amber-50 text-amber-700" :
                                                        "bg-red-50 text-red-600"
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted text-xs">
                                            {order.paidAt
                                                ? new Date(order.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                : new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.emailSent
                                                ? <Check className="w-4 h-4 text-green-500" />
                                                : <X className="w-4 h-4 text-gray-300" />
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Version Modal */}
            {showVersionModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg my-auto">
                        <div className="flex items-center justify-between p-5 border-b border-border-light">
                            <h2 className="font-serif text-lg text-heading">
                                {editingVersion ? "Edit Edition" : "Add Edition"}
                            </h2>
                            <button onClick={() => setShowVersionModal(false)} className="text-muted p-1">✕</button>
                        </div>
                        <form onSubmit={handleVersionSubmit} className="p-5 space-y-4">
                            <FormField label="Label *">
                                <input type="text" value={versionForm.label ?? ""} required
                                    onChange={e => setVersionForm(f => ({ ...f, label: e.target.value }))}
                                    className={INPUT} placeholder="Global Edition" />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Country Code">
                                    <input type="text" value={versionForm.countryCode ?? ""}
                                        onChange={e => setVersionForm(f => ({ ...f, countryCode: e.target.value }))}
                                        className={INPUT} placeholder="US" maxLength={2} />
                                </FormField>
                                <FormField label="Country / Region Name">
                                    <input type="text" value={versionForm.countryName ?? ""}
                                        onChange={e => setVersionForm(f => ({ ...f, countryName: e.target.value }))}
                                        className={INPUT} placeholder="United States" />
                                </FormField>
                            </div>
                            <FormField label="Region">
                                <input type="text" value={versionForm.region ?? ""}
                                    onChange={e => setVersionForm(f => ({ ...f, region: e.target.value }))}
                                    className={INPUT} placeholder="North America" />
                            </FormField>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="Price *">
                                    <input type="number" value={versionForm.price ?? ""} required step="0.01"
                                        onChange={e => setVersionForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                                        className={INPUT} placeholder="29.99" />
                                </FormField>
                                <FormField label="Currency *">
                                    <input type="text" value={versionForm.currency ?? ""} required maxLength={3}
                                        onChange={e => setVersionForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                                        className={INPUT} placeholder="USD" />
                                </FormField>
                                <FormField label="Symbol *">
                                    <input type="text" value={versionForm.currencySymbol ?? ""} required
                                        onChange={e => setVersionForm(f => ({ ...f, currencySymbol: e.target.value }))}
                                        className={INPUT} placeholder="$" />
                                </FormField>
                            </div>
                            <FormField label="File URL (download link)">
                                <input type="url" value={versionForm.fileUrl ?? ""}
                                    onChange={e => setVersionForm(f => ({ ...f, fileUrl: e.target.value }))}
                                    className={INPUT} placeholder="https://cdn.example.com/ebook.pdf" />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="File Size (MB)">
                                    <input type="number" step="0.1" value={versionForm.fileSizeMb ?? ""}
                                        onChange={e => setVersionForm(f => ({ ...f, fileSizeMb: parseFloat(e.target.value) || undefined }))}
                                        className={INPUT} />
                                </FormField>
                                <FormField label="Sort Order">
                                    <input type="number" value={versionForm.sortOrder ?? 0}
                                        onChange={e => setVersionForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                                        className={INPUT} />
                                </FormField>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                                <input type="checkbox" checked={versionForm.isActive ?? true}
                                    onChange={e => setVersionForm(f => ({ ...f, isActive: e.target.checked }))}
                                    className="w-4 h-4 accent-accent" />
                                Active (visible to buyers)
                            </label>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowVersionModal(false)}
                                    className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isAddingVersion || isUpdatingVersion}
                                    className="px-5 py-2 text-sm font-medium bg-dark text-white rounded-xl hover:bg-darkest transition-colors disabled:opacity-50">
                                    {editingVersion ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete version confirm */}
            {deleteVersionConfirm !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <p className="font-medium text-heading">Delete this edition?</p>
                        <p className="text-sm text-muted">This cannot be undone. Existing orders will still reference this edition.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteVersionConfirm(null)}
                                className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => {
                                deleteVersion(
                                    { ebookId, versionId: deleteVersionConfirm },
                                    {
                                        onSuccess: () => { toast.success("Edition deleted"); setDeleteVersionConfirm(null); },
                                        onError: () => toast.error("Failed to delete edition"),
                                    }
                                );
                            }}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const INPUT = "w-full px-3 py-2 rounded-lg border border-border-light text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">{label}</label>
            {children}
        </div>
    );
}
