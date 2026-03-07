import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Eye, X, UserCog, UserCheck, UserX } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

export default function AdminUsersPage() {
  const { adminUsers } = useAdminDataStore();
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (adminId) setSelected(adminId);
  }, [adminId]);

  const filtered = adminUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const detail = selected ? adminUsers.find((u) => u.id === selected) : null;

  const closeDetail = () => {
    setSelected(null);
    if (adminId) navigate("/admin-users");
  };

  const roleColors: Record<string, string> = {
    super_admin: "bg-accent/10 text-accent",
    client_admin: "bg-gold/10 text-gold",
    support_admin: "bg-info/10 text-info",
  };

  const summaryCards = [
    { label: "Total Admins", value: adminUsers.length, icon: UserCog, color: "text-accent", bg: "bg-accent/10" },
    { label: "Active", value: adminUsers.filter((u) => u.status === "active").length, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
    { label: "Inactive", value: adminUsers.filter((u) => u.status === "inactive").length, icon: UserX, color: "text-danger", bg: "bg-danger/10" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">Admin Users</h1>
        <p className="text-sm text-muted mt-0.5">Manage administrator accounts and access</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Name</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Email</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Role</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Last Login</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Created</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150">
                <td className="p-4 text-heading font-medium">{user.name}</td>
                <td className="p-4 text-body text-xs">{user.email}</td>
                <td className="p-4">
                  <span className={cn("px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize", roleColors[user.role] ?? "bg-background-secondary text-muted")}>
                    {user.role.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                    user.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  )}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(user.lastLogin).toLocaleString()}</td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{user.createdAt}</td>
                <td className="p-4">
                  <button onClick={() => setSelected(user.id)} className="p-1.5 rounded-xl hover:bg-background-secondary text-muted hover:text-heading" title="View detail">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-heading">Admin Detail</h2>
              <button onClick={closeDetail} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["Admin ID", detail.id],
                ["Name", detail.name],
                ["Email", detail.email],
                ["Role", detail.role.replace(/_/g, " ")],
                ["Status", detail.status],
                ["Last Login", new Date(detail.lastLogin).toLocaleString()],
                ["Created", detail.createdAt],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-heading font-medium capitalize">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-muted mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.permissions.map((perm) => (
                    <span key={perm} className="px-2.5 py-1 rounded-xl text-xs font-medium bg-accent/10 text-accent">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
