import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminCreateEbook, useAdminAddVersion, useUploadEbookPdf } from "../../api/hooks";
import type { CreateEbookRequest, CreateVersionRequest } from "../../api/types";
import {
    ArrowLeft, Plus, Trash2, Upload, LinkIcon, Globe,
    Loader2, FileText, BookOpen
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";

type VersionDraft = CreateVersionRequest & {
    _key: string;
    _fileMode: "upload" | "link";
    _uploading?: boolean;
    _fileName?: string;
};

let versionKeyCounter = 0;

function newVersionDraft(): VersionDraft {
    return {
        _key: `v-${++versionKeyCounter}`,
        _fileMode: "upload",
        label: "",
        countryCode: "",
        countryName: "",
        region: "",
        price: 0,
        currency: "USD",
        currencySymbol: "$",
        fileUrl: "",
        fileKey: "",
        fileSizeMb: undefined,
        isActive: true,
        sortOrder: 0,
    };
}

export default function EbookCreatePage() {
    const navigate = useNavigate();
    const { mutateAsync: createEbook, isPending: isCreating } = useAdminCreateEbook();
    const { mutateAsync: addVersion } = useAdminAddVersion();
    const { mutateAsync: uploadPdf } = useUploadEbookPdf();

    const [form, setForm] = useState<Partial<CreateEbookRequest>>({
        isActive: true,
        isFeatured: false,
    });
    const [versions, setVersions] = useState<VersionDraft[]>([newVersionDraft()]);
    const [saving, setSaving] = useState(false);

    const updateField = (field: keyof CreateEbookRequest, value: unknown) =>
        setForm(f => ({ ...f, [field]: value }));

    const updateVersion = (key: string, field: string, value: unknown) =>
        setVersions(prev => prev.map(v => v._key === key ? { ...v, [field]: value } : v));

    const removeVersion = (key: string) =>
        setVersions(prev => prev.filter(v => v._key !== key));

    const handleFileUpload = async (key: string, file: File) => {
        updateVersion(key, "_uploading", true);
        try {
            const result = await uploadPdf(file);
            setVersions(prev => prev.map(v =>
                v._key === key ? {
                    ...v,
                    fileUrl: result.fileUrl,
                    fileKey: result.fileKey,
                    fileSizeMb: result.fileSizeMb,
                    _fileName: result.fileName,
                    _uploading: false,
                } : v
            ));
            toast.success("PDF uploaded");
        } catch {
            updateVersion(key, "_uploading", false);
            toast.error("Failed to upload PDF");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.slug || !form.author) {
            toast.error("Title, slug, and author are required");
            return;
        }

        setSaving(true);
        try {
            const ebook = await createEbook(form as CreateEbookRequest);
            const ebookId = ebook.id;

            // Add each version
            for (const v of versions) {
                if (!v.label || !v.price || !v.currency) continue;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _key, _fileMode, _uploading, _fileName, ...versionData } = v;
                await addVersion({ ebookId, data: versionData });
            }

            toast.success("Ebook created successfully");
            navigate(`/admin/ebooks/${ebookId}`);
        } catch {
            toast.error("Failed to create ebook");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/ebooks"
                    className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif text-heading">Create Ebook</h1>
                    <p className="text-sm text-muted mt-0.5">Add a new ebook with regional editions</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ─── Ebook Details ─────────────────────────────────────────── */}
                <section className="bg-white border border-border-light rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-light">
                        <h2 className="font-semibold text-heading flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent" />
                            Ebook Details
                        </h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <FormField label="Title *">
                                <input type="text" value={form.title ?? ""} required
                                    onChange={e => updateField("title", e.target.value)}
                                    className={INPUT} placeholder="The TMAG Travel Health Guide" />
                            </FormField>
                            <FormField label="Slug *">
                                <input type="text" value={form.slug ?? ""} required
                                    onChange={e => updateField("slug", e.target.value)}
                                    className={INPUT} placeholder="tmag-travel-health-guide" />
                            </FormField>
                        </div>

                        <FormField label="Author *">
                            <input type="text" value={form.author ?? ""} required
                                onChange={e => updateField("author", e.target.value)}
                                className={INPUT} placeholder="Dr. Sarah Chen, MD" />
                        </FormField>

                        <FormField label="Short Description">
                            <textarea value={form.shortDescription ?? ""} rows={2}
                                onChange={e => updateField("shortDescription", e.target.value)}
                                className={INPUT} placeholder="One-sentence summary..." />
                        </FormField>

                        <FormField label="Full Description">
                            <textarea value={form.description ?? ""} rows={5}
                                onChange={e => updateField("description", e.target.value)}
                                className={INPUT} placeholder="Detailed description..." />
                        </FormField>

                        <FormField label="Author Bio">
                            <textarea value={form.authorBio ?? ""} rows={3}
                                onChange={e => updateField("authorBio", e.target.value)}
                                className={INPUT} />
                        </FormField>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <FormField label="Cover URL">
                                <input type="url" value={form.coverUrl ?? ""}
                                    onChange={e => updateField("coverUrl", e.target.value)}
                                    className={INPUT} placeholder="https://..." />
                            </FormField>
                            <FormField label="Preview URL">
                                <input type="url" value={form.previewUrl ?? ""}
                                    onChange={e => updateField("previewUrl", e.target.value)}
                                    className={INPUT} placeholder="https://..." />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                            <FormField label="Page Count">
                                <input type="number" value={form.pageCount ?? ""}
                                    onChange={e => updateField("pageCount", Number(e.target.value) || undefined)}
                                    className={INPUT} />
                            </FormField>
                            <FormField label="Published Year">
                                <input type="number" value={form.publishedYear ?? ""}
                                    onChange={e => updateField("publishedYear", Number(e.target.value) || undefined)}
                                    className={INPUT} />
                            </FormField>
                            <FormField label="ISBN">
                                <input type="text" value={form.isbn ?? ""}
                                    onChange={e => updateField("isbn", e.target.value)}
                                    className={INPUT} />
                            </FormField>
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                                <input type="checkbox" checked={form.isActive ?? true}
                                    onChange={e => updateField("isActive", e.target.checked)}
                                    className="w-4 h-4 accent-accent" />
                                Active
                            </label>
                            <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                                <input type="checkbox" checked={form.isFeatured ?? false}
                                    onChange={e => updateField("isFeatured", e.target.checked)}
                                    className="w-4 h-4 accent-accent" />
                                Featured
                            </label>
                        </div>
                    </div>
                </section>

                {/* ─── Versions / Editions ───────────────────────────────────── */}
                <section className="bg-white border border-border-light rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                        <h2 className="font-semibold text-heading flex items-center gap-2">
                            <Globe className="w-4 h-4 text-accent" />
                            Regional Editions
                        </h2>
                        <button type="button" onClick={() => setVersions(prev => [...prev, newVersionDraft()])}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark text-white text-xs font-medium rounded-lg hover:bg-darkest transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add Edition
                        </button>
                    </div>

                    <div className="divide-y divide-border-light">
                        {versions.map((version, idx) => (
                            <VersionEditor
                                key={version._key}
                                version={version}
                                index={idx}
                                onUpdate={(field, value) => updateVersion(version._key, field, value)}
                                onRemove={() => removeVersion(version._key)}
                                onFileUpload={(file) => handleFileUpload(version._key, file)}
                                canRemove={versions.length > 1}
                            />
                        ))}
                    </div>
                </section>

                {/* ─── Actions ────────────────────────────────────────────────── */}
                <div className="flex justify-end gap-3">
                    <Link to="/admin/ebooks"
                        className="px-5 py-2.5 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" disabled={saving || isCreating}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-dark text-white rounded-xl hover:bg-darkest transition-colors disabled:opacity-50">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Ebook
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Version Editor ──────────────────────────────────────────────

function VersionEditor({
    version, index, onUpdate, onRemove, onFileUpload, canRemove
}: {
    version: VersionDraft;
    index: number;
    onUpdate: (field: string, value: unknown) => void;
    onRemove: () => void;
    onFileUpload: (file: File) => void;
    canRemove: boolean;
}) {
    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-heading">
                    Edition {index + 1}
                    {version.label && <span className="text-muted font-normal"> — {version.label}</span>}
                </h3>
                {canRemove && (
                    <button type="button" onClick={onRemove}
                        className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Label *">
                    <input type="text" value={version.label ?? ""} required
                        onChange={e => onUpdate("label", e.target.value)}
                        className={INPUT} placeholder="Global Edition" />
                </FormField>
                <FormField label="Region">
                    <input type="text" value={version.region ?? ""}
                        onChange={e => onUpdate("region", e.target.value)}
                        className={INPUT} placeholder="North America" />
                </FormField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Country Code">
                    <input type="text" value={version.countryCode ?? ""} maxLength={2}
                        onChange={e => onUpdate("countryCode", e.target.value)}
                        className={INPUT} placeholder="US" />
                </FormField>
                <FormField label="Country / Region Name">
                    <input type="text" value={version.countryName ?? ""}
                        onChange={e => onUpdate("countryName", e.target.value)}
                        className={INPUT} placeholder="United States" />
                </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField label="Price *">
                    <input type="number" value={version.price || ""} required step="0.01"
                        onChange={e => onUpdate("price", parseFloat(e.target.value) || 0)}
                        className={INPUT} placeholder="29.99" />
                </FormField>
                <FormField label="Currency *">
                    <input type="text" value={version.currency ?? ""} required maxLength={3}
                        onChange={e => onUpdate("currency", e.target.value.toUpperCase())}
                        className={INPUT} placeholder="USD" />
                </FormField>
                <FormField label="Symbol *">
                    <input type="text" value={version.currencySymbol ?? ""} required
                        onChange={e => onUpdate("currencySymbol", e.target.value)}
                        className={INPUT} placeholder="$" />
                </FormField>
            </div>

            {/* ─── PDF: Upload / Link toggle ─────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">PDF File</span>
                    <div className="flex bg-background-primary border border-border-light rounded-lg p-0.5">
                        <button type="button"
                            onClick={() => onUpdate("_fileMode", "upload")}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors",
                                version._fileMode === "upload"
                                    ? "bg-white text-heading font-medium shadow-sm"
                                    : "text-muted hover:text-body"
                            )}>
                            <Upload className="w-3 h-3" /> Upload
                        </button>
                        <button type="button"
                            onClick={() => onUpdate("_fileMode", "link")}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors",
                                version._fileMode === "link"
                                    ? "bg-white text-heading font-medium shadow-sm"
                                    : "text-muted hover:text-body"
                            )}>
                            <LinkIcon className="w-3 h-3" /> Link
                        </button>
                    </div>
                </div>

                {version._fileMode === "upload" ? (
                    <div>
                        {version._uploading ? (
                            <div className="flex items-center gap-2 px-4 py-3 bg-background-primary border border-border-light rounded-xl">
                                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                <span className="text-sm text-muted">Uploading...</span>
                            </div>
                        ) : version.fileUrl && version._fileName ? (
                            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                                <FileText className="w-4 h-4 text-green-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-green-800 font-medium truncate">{version._fileName}</p>
                                    {version.fileSizeMb && (
                                        <p className="text-xs text-green-600">{version.fileSizeMb} MB</p>
                                    )}
                                </div>
                                <label className="text-xs text-accent cursor-pointer hover:underline">
                                    Replace
                                    <input type="file" accept="application/pdf" className="hidden"
                                        onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])} />
                                </label>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center gap-2 px-4 py-6 bg-background-primary border-2 border-dashed border-border-light rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
                                <Upload className="w-5 h-5 text-muted" />
                                <span className="text-sm text-muted">Click to upload a PDF file</span>
                                <span className="text-xs text-muted">PDF files only</span>
                                <input type="file" accept="application/pdf" className="hidden"
                                    onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])} />
                            </label>
                        )}
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField label="File URL">
                            <input type="url" value={version.fileUrl ?? ""}
                                onChange={e => onUpdate("fileUrl", e.target.value)}
                                className={INPUT} placeholder="https://cdn.example.com/ebook.pdf" />
                        </FormField>
                        <FormField label="File Key">
                            <input type="text" value={version.fileKey ?? ""}
                                onChange={e => onUpdate("fileKey", e.target.value)}
                                className={INPUT} placeholder="ebooks/ebook.pdf" />
                        </FormField>
                    </div>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Sort Order">
                    <input type="number" value={version.sortOrder ?? 0}
                        onChange={e => onUpdate("sortOrder", Number(e.target.value))}
                        className={INPUT} />
                </FormField>
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                        <input type="checkbox" checked={version.isActive ?? true}
                            onChange={e => onUpdate("isActive", e.target.checked)}
                            className="w-4 h-4 accent-accent" />
                        Active (visible to buyers)
                    </label>
                </div>
            </div>
        </div>
    );
}

// ─── Shared ──────────────────────────────────────────────────────

const INPUT = "w-full px-3 py-2 rounded-lg border border-border-light text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">{label}</label>
            {children}
        </div>
    );
}
