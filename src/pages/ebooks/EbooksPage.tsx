import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminEbooks, useAdminDeleteEbook, useAdminEbookStats } from "../../api/hooks";
import {
    BookOpen, Plus, Pencil, Trash2, BarChart3,
    ChevronRight, Loader2, AlertCircle, DollarSign, ShoppingBag, Star
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";

export default function EbooksPage() {
    const { data: ebooks, isLoading } = useAdminEbooks();
    const { data: stats } = useAdminEbookStats();
    const { mutate: deleteEbook } = useAdminDeleteEbook();

    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        deleteEbook(id, {
            onSuccess: () => { toast.success("Ebook deleted"); setDeleteConfirm(null); },
            onError: () => toast.error("Failed to delete ebook"),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif text-heading">Ebook Store</h1>
                    <p className="text-sm text-muted mt-0.5">Manage ebooks, editions and sales</p>
                </div>
                <Link
                    to="/admin/ebooks/create"
                    className="flex items-center gap-2 px-4 py-2 bg-dark text-white text-sm font-medium rounded-xl hover:bg-darkest transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Ebook
                </Link>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total Ebooks", value: stats.totalEbooks, icon: BookOpen },
                        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
                        { label: "Completed Sales", value: stats.completedOrders, icon: BarChart3 },
                        { label: "Total Revenue", value: `$${Number(stats.totalRevenue).toLocaleString()}`, icon: DollarSign },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-2xl border border-border-light p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-muted" />
                                <span className="text-xs text-muted font-medium uppercase tracking-wider">{label}</span>
                            </div>
                            <p className="text-2xl font-serif text-heading">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Ebooks list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                </div>
            ) : !ebooks || ebooks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                    <BookOpen className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-heading font-medium">No ebooks yet</p>
                    <p className="text-sm text-muted mt-1">Create your first ebook to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {ebooks.map(ebook => (
                        <div key={ebook.id}
                            className="bg-white rounded-2xl border border-border-light overflow-hidden">
                            <div className="flex items-start gap-4 p-5">
                                {/* Cover */}
                                <div className="w-14 h-18 rounded-xl bg-darkest flex items-center justify-center shrink-0">
                                    {ebook.coverUrl ? (
                                        <img src={ebook.coverUrl} alt={ebook.title}
                                            className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <BookOpen className="w-6 h-6 text-white/40" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-heading">{ebook.title}</h3>
                                                {ebook.isFeatured && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                                                        <Star className="w-2.5 h-2.5" /> Featured
                                                    </span>
                                                )}
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                    ebook.isActive
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                )}>
                                                    {ebook.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted">{ebook.author}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                to={`/admin/ebooks/${ebook.id}`}
                                                className="p-2 text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-colors"
                                                title="View orders"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to={`/admin/ebooks/${ebook.id}/edit`}
                                                className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteConfirm(ebook.id)}
                                                className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Versions */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {ebook.versions.map(v => (
                                            <span key={v.id}
                                                className={cn(
                                                    "text-xs px-2.5 py-1 rounded-lg border",
                                                    v.isActive
                                                        ? "bg-background-primary border-border-light text-body"
                                                        : "bg-gray-50 border-gray-200 text-gray-400 line-through"
                                                )}>
                                                {v.label} — {v.currencySymbol}{Number(v.price).toLocaleString()}
                                            </span>
                                        ))}
                                        {ebook.versions.length === 0 && (
                                            <span className="text-xs text-muted italic">No editions yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer link */}
                            <div className="px-5 py-3 bg-background-primary border-t border-border-light">
                                <Link to={`/admin/ebooks/${ebook.id}`}
                                    className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                                    View orders & manage editions
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                            <p className="font-medium text-heading">Delete this ebook?</p>
                        </div>
                        <p className="text-sm text-muted">This will soft-delete the ebook. Existing orders are preserved.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)}
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
