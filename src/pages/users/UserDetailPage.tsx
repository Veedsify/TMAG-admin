import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  RotateCcw,
  CreditCard,
  Mail,
  Calendar,
  Shield,
  Phone,
  MapPin,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Save,
  Plus,
  Minus,
  KeyRound,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminDataStore } from "../../stores/adminDataStore";

type TabKey = "overview" | "edit" | "credits" | "ledger" | "plans";

const TABS: { key: TabKey; label: string; path: string }[] = [
  { key: "overview", label: "Overview", path: "" },
  { key: "edit", label: "Edit", path: "/edit" },
  { key: "credits", label: "Credits", path: "/credits" },
  { key: "ledger", label: "Ledger", path: "/ledger" },
  { key: "plans", label: "Plans", path: "/plans" },
];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    users,
    plans,
    creditLedger,
    suspendUser,
    reactivateUser,
    resetUserCredits,
    updateUser,
  } = useAdminDataStore();

  const user = users.find((u) => u.id === id);

  // Determine active tab from pathname
  const basePath = `/admin/users/${id}`;
  const activeTab: TabKey = (() => {
    const suffix = location.pathname.replace(basePath, "");
    const match = TABS.find((t) => t.path !== "" && suffix.startsWith(t.path));
    return match ? match.key : "overview";
  })();

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
  });

  // Credits form state
  const [creditAmount, setCreditAmount] = useState(10);
  const [creditReason, setCreditReason] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">User not found</p>
      </div>
    );
  }

  const userPlans = plans.filter((p) => p.userId === user.id);
  const userLedger = creditLedger.filter((e) => e.userId === user.id);
  const recentLedger = userLedger.slice(0, 5);
  const totalCredits = user.creditsUsed + user.creditsRemaining;

  const handleSaveEdit = () => {
    updateUser(user.id, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      location: editForm.location || undefined,
      bio: editForm.bio || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-heading transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              to={`${basePath}${tab.path}`}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150",
                activeTab === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-heading hover:border-border"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-bold font-serif shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-xl font-serif font-bold text-heading">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
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
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent capitalize">
                      {user.role.replace(/_/g, " ")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-gold/10 text-gold capitalize">
                      {user.planType}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {user.phone}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    {user.role.replace(/_/g, " ")}
                  </span>
                </div>
                {user.bio && <p className="text-sm text-body">{user.bio}</p>}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Credits Remaining",
                value: user.creditsRemaining,
                icon: CreditCard,
                color: "text-accent",
              },
              {
                label: "Credits Used",
                value: user.creditsUsed,
                icon: TrendingDown,
                color: "text-brand-muted",
              },
              {
                label: "Plans Generated",
                value: user.plansGenerated,
                icon: FileText,
                color: "text-info",
              },
              {
                label: "Last Active",
                value: new Date(user.lastActivity).toLocaleDateString(),
                icon: Clock,
                color: "text-muted",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-border-light/50 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
                <p className={cn("text-lg font-bold font-serif", s.color)}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Risk Flags */}
          {user.riskFlags.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-warning">
                  Risk Flags ({user.riskFlags.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.riskFlags.map((flag) => (
                  <span
                    key={flag}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-warning/10 text-warning capitalize"
                  >
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6 max-w-2xl">
          <h2 className="text-lg font-serif font-bold text-heading mb-5">Edit User</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Phone</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                placeholder="Optional"
              />
            </div>
            <button
              onClick={handleSaveEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors duration-150"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "credits" && (
        <div className="space-y-6 max-w-2xl">
          {/* Current Credits */}
          <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
            <h2 className="text-lg font-serif font-bold text-heading mb-4">Current Credits</h2>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold font-serif text-accent">
                  {user.creditsRemaining}
                </p>
                <p className="text-xs text-muted mt-1">remaining of {totalCredits} total</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: `${totalCredits > 0 ? (user.creditsRemaining / totalCredits) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add/Deduct Credits */}
          <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
            <h2 className="text-lg font-serif font-bold text-heading mb-4">
              Adjust Credits
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-40 px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Reason</label>
                <textarea
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  placeholder="Reason for adjustment..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => resetUserCredits(user.id, user.creditsRemaining + creditAmount)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors duration-150"
                >
                  <Plus className="w-4 h-4" /> Add Credits
                </button>
                <button
                  onClick={() =>
                    resetUserCredits(
                      user.id,
                      Math.max(0, user.creditsRemaining - creditAmount)
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150"
                >
                  <Minus className="w-4 h-4" /> Deduct Credits
                </button>
              </div>
            </div>
          </div>

          {/* Recent Credit Movements */}
          <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
            <h2 className="text-lg font-serif font-bold text-heading mb-4">
              Recent Credit Movements
            </h2>
            {recentLedger.length === 0 ? (
              <p className="text-sm text-muted">No recent credit activity.</p>
            ) : (
              <div className="space-y-3">
                {recentLedger.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {entry.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-danger" />
                      )}
                      <div>
                        <p className="text-sm text-heading capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted">{entry.reason}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        entry.amount > 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
          <h2 className="text-lg font-serif font-bold text-heading mb-4">
            Credit Ledger ({userLedger.length})
          </h2>
          {userLedger.length === 0 ? (
            <p className="text-sm text-muted">No credit activity.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">Action</th>
                    <th className="text-left pb-3 text-muted font-medium">Amount</th>
                    <th className="text-left pb-3 text-muted font-medium">Balance</th>
                    <th className="text-left pb-3 text-muted font-medium">Reason</th>
                    <th className="text-left pb-3 text-muted font-medium">Triggered By</th>
                    <th className="text-left pb-3 text-muted font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {userLedger.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3">
                        <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-button-secondary text-body capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "py-3 pr-3 font-medium",
                          entry.amount > 0 ? "text-success" : "text-danger"
                        )}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount}
                      </td>
                      <td className="py-3 pr-3 text-body">
                        {entry.balanceBefore} → {entry.balanceAfter}
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs max-w-[200px] truncate">
                        {entry.reason}
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs">{entry.triggeredBy}</td>
                      <td className="py-3 text-muted text-xs">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "plans" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
          <h2 className="text-lg font-serif font-bold text-heading mb-4">
            Generated Plans ({userPlans.length})
          </h2>
          {userPlans.length === 0 ? (
            <p className="text-sm text-muted">No plans generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">Destination</th>
                    <th className="text-left pb-3 text-muted font-medium">Duration</th>
                    <th className="text-left pb-3 text-muted font-medium">Risk Score</th>
                    <th className="text-left pb-3 text-muted font-medium">Vaccinations</th>
                    <th className="text-left pb-3 text-muted font-medium">Status</th>
                    <th className="text-left pb-3 text-muted font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {userPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          to={`/admin/plans/${plan.id}`}
                          className="text-heading font-medium hover:text-accent transition-colors duration-150"
                        >
                          {plan.destination}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-body text-xs">{plan.duration}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                            plan.riskScore < 30
                              ? "bg-success/10 text-success"
                              : plan.riskScore < 60
                                ? "bg-warning/10 text-warning"
                                : "bg-danger/10 text-danger"
                          )}
                        >
                          {plan.riskScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-body text-xs">
                        {plan.vaccinations.length}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                            plan.status === "active"
                              ? "bg-success/10 text-success"
                              : plan.status === "flagged"
                                ? "bg-warning/10 text-warning"
                                : "bg-danger/10 text-danger"
                          )}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted text-xs">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons — visible on all tabs */}
      <div className="bg-white rounded-2xl border border-border-light/50 p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-heading mb-4">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {user.status === "active" ? (
            <button
              onClick={() => suspendUser(user.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150"
            >
              <Ban className="w-4 h-4" /> Suspend User
            </button>
          ) : (
            <button
              onClick={() => reactivateUser(user.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors duration-150"
            >
              <RotateCcw className="w-4 h-4" /> Reactivate User
            </button>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-button-secondary text-body rounded-xl text-sm font-medium hover:bg-background-primary transition-colors duration-150">
            <KeyRound className="w-4 h-4" /> Reset Password
          </button>
          <button
            onClick={() => resetUserCredits(user.id, 20)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors duration-150"
          >
            <CreditCard className="w-4 h-4" /> Reset Credits
          </button>
        </div>
      </div>
    </div>
  );
}
