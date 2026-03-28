import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  RotateCcw,
  CreditCard,
  Users,
  UserCheck,
  UserX,
  Building2,
  User,
  LucideLoader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useUsers, useSuspendUser, useActivateUser, useResetUserCredits } from "../../api/hooks";
import type { ManagedUser } from "../../api/types";

type StatusFilter = "all" | "active" | "suspended";
type TypeFilter = "all" | "individual" | "corporate";

export default function UsersPage() {
  const { data: usersData, isLoading } = useUsers();
  const suspendMutation = useSuspendUser();
  const activateMutation = useActivateUser();
  const resetCreditsMutation = useResetUserCredits();

  const users: ManagedUser[] = usersData ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchType = typeFilter === "all" || u.planType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;
  const corporateUsers = users.filter((u) => u.planType === "corporate").length;
  const individualUsers = users.filter((u) => u.planType === "individual").length;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-accent" },
    { label: "Active", value: activeUsers, icon: UserCheck, color: "text-success" },
    { label: "Suspended", value: suspendedUsers, icon: UserX, color: "text-danger" },
    { label: "Corporate", value: corporateUsers, icon: Building2, color: "text-info" },
    { label: "Individual", value: individualUsers, icon: User, color: "text-brand-muted" },
  ];

  const handleSuspend = (userId: string) => {
    suspendMutation.mutate(userId);
    setActionMenu(null);
  };

  const handleActivate = (userId: string) => {
    activateMutation.mutate(userId);
    setActionMenu(null);
  };

  const handleResetCredits = (userId: string, amount: number) => {
    resetCreditsMutation.mutate({ id: userId, amount });
    setActionMenu(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-heading">User Management</h1>
        <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent">
          {totalUsers} users
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-border-light/50 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={cn("w-4 h-4", s.color)} />
              <p className="text-xs text-muted">{s.label}</p>
            </div>
            <p className={cn("text-xl font-bold font-serif", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "active", "suspended"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors duration-150",
                statusFilter === f
                  ? "bg-accent text-white"
                  : "bg-button-secondary text-body hover:bg-background-primary"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(["all", "individual", "corporate"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors duration-150",
                typeFilter === f
                  ? "bg-gold text-white"
                  : "bg-button-secondary text-body hover:bg-background-primary"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted font-medium">User</th>
              <th className="text-left p-4 text-muted font-medium">Type</th>
              <th className="text-left p-4 text-muted font-medium">Company</th>
              <th className="text-left p-4 text-muted font-medium">Credits</th>
              <th className="text-left p-4 text-muted font-medium">Plans</th>
              <th className="text-left p-4 text-muted font-medium">Status</th>
              <th className="text-left p-4 text-muted font-medium">Last Active</th>
              <th className="text-left p-4 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const totalCredits = user.creditsUsed + user.creditsRemaining;
              const usagePercent = totalCredits > 0 ? (user.creditsUsed / totalCredits) * 100 : 0;

              return (
                <tr
                  key={user.id}
                  className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-heading">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                        user.planType === "corporate"
                          ? "bg-info/10 text-info"
                          : "bg-accent/10 text-accent"
                      )}
                    >
                      {user.planType}
                    </span>
                  </td>
                  <td className="p-4 text-body text-xs">
                    {user.companyName || <span className="text-muted">—</span>}
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-heading font-medium">{user.creditsUsed}</span>
                        <span className="text-muted">/{totalCredits}</span>
                      </div>
                      <div className="w-20 h-1.5 bg-background-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-body">{user.plansGenerated}</td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                        user.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      )}
                    >
                      {user.status}
                    </span>
                    {user.riskFlags && user.riskFlags.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-xl text-[10px] bg-warning/10 text-warning font-medium">
                        {user.riskFlags.length} flag{user.riskFlags.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted text-xs">
                    {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                        className="p-1.5 rounded-xl hover:bg-background-primary text-muted hover:text-heading transition-colors duration-150"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenu === user.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-border-light/50 rounded-2xl z-10 py-1">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-body hover:bg-background-primary transition-colors duration-150 w-full"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Profile
                          </Link>
                          {user.status === "active" ? (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              disabled={suspendMutation.isPending}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-background-primary transition-colors duration-150 w-full text-left disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              disabled={activateMutation.isPending}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-success hover:bg-background-primary transition-colors duration-150 w-full text-left disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                            </button>
                          )}
                          <button
                            onClick={() => handleResetCredits(user.id, 20)}
                            disabled={resetCreditsMutation.isPending}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-body hover:bg-background-primary transition-colors duration-150 w-full text-left disabled:opacity-50"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Reset Credits
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted text-sm">
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}