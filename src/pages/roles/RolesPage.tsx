import { useState } from "react";
import { useParams } from "react-router-dom";
import { Shield, Users, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

export default function RolesPage() {
  const { roles, adminUsers } = useAdminDataStore();
  const { roleId } = useParams();
  const [selected, setSelected] = useState<string | null>(roleId ?? null);

  const detail = selected ? roles.find((r) => r.id === selected) : null;
  const roleUsers = detail ? adminUsers.filter((u) => u.role === detail.name.toLowerCase().replace(/ /g, "_")) : [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">Admin Roles</h1>
        <p className="text-sm text-muted mt-0.5">Manage roles and permissions for admin users</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              "bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6 text-left transition-colors hover:bg-background-primary",
              selected === role.id && "ring-2 ring-accent/30"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-heading">{role.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Users className="w-3 h-3" />
                  <span>{role.userCount} user{role.userCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-body mb-3 line-clamp-2">{role.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.map((perm) => (
                <span key={perm} className="px-2 py-0.5 rounded-xl text-[10px] font-medium bg-background-secondary text-muted">
                  {perm}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Expanded detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-heading">{detail.name}</h2>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-body">{detail.description}</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border-light/50 pb-2">
                <span className="text-muted">Role ID</span>
                <span className="text-heading font-medium">{detail.id}</span>
              </div>
              <div className="flex justify-between border-b border-border-light/50 pb-2">
                <span className="text-muted">User Count</span>
                <span className="text-heading font-medium">{detail.userCount}</span>
              </div>
            </div>
            <div>
              <p className="text-muted text-sm mb-2">Permissions</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.permissions.map((perm) => (
                  <span key={perm} className="px-2.5 py-1 rounded-xl text-xs font-medium bg-accent/10 text-accent">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
            {roleUsers.length > 0 && (
              <div>
                <p className="text-muted text-sm mb-2">Users with this role</p>
                <div className="space-y-2">
                  {roleUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between bg-background-primary rounded-xl p-3">
                      <div>
                        <p className="text-sm text-heading font-medium">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                        u.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      )}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
