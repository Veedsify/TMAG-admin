import { useState } from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    Bot,
    FileText,
    BarChart3,
    Settings,
    Shield,
    AlertTriangle,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Bell,
    Search,
    Server,
    Receipt,
    UserCog,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminAuthStore } from "../../stores/adminAuthStore";
import { useSidebarStore } from "../../stores/sidebarStore";

/* ─── Navigation items ───────────────────────────────────── */
const navGroups = [
    {
        label: "Overview",
        items: [
            { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
    },
    {
        label: "Management",
        items: [
            { to: "/admin/users", icon: Users, label: "Users" },
            { to: "/admin/companies", icon: Building2, label: "Companies" },
            { to: "/admin/ledger", icon: CreditCard, label: "Credit Ledger" },
            { to: "/admin/billing", icon: Receipt, label: "Billing" },
        ],
    },
    {
        label: "AI & Content",
        items: [
            { to: "/admin/ai-logs", icon: Bot, label: "AI Requests" },
            { to: "/admin/plans", icon: FileText, label: "Plans" },
            { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        ],
    },
    {
        label: "System",
        items: [
            { to: "/admin/system/status", icon: Server, label: "System Status" },
            { to: "/admin/system/logs", icon: AlertTriangle, label: "System Logs" },
            { to: "/admin/system/settings", icon: Settings, label: "Settings" },
        ],
    },
    {
        label: "Access Control",
        items: [
            { to: "/admin/roles", icon: Shield, label: "Roles" },
            { to: "/admin/admin-users", icon: UserCog, label: "Admin Users" },
        ],
    },
];

/* ─── Sidebar ─────────────────────────────────────────────── */
function Sidebar() {
    const { open, close } = useSidebarStore();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const toggleGroup = (label: string) => {
        setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={close}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-darkest text-white flex flex-col transition-transform duration-200",
                    "lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-serif font-bold text-base tracking-tight">TMAG</span>
                            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 font-medium uppercase tracking-wider">Admin</span>
                        </div>
                    </div>
                    <button onClick={close} className="lg:hidden text-white/50 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <button
                                onClick={() => toggleGroup(group.label)}
                                className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-white/50"
                            >
                                {group.label}
                                <ChevronDown
                                    className={cn(
                                        "w-3 h-3 transition-transform",
                                        collapsed[group.label] && "-rotate-90"
                                    )}
                                />
                            </button>
                            {!collapsed[group.label] && (
                                <div className="space-y-0.5 mb-3">
                                    {group.items.map((item) => {
                                        const isActive = location.pathname.startsWith(item.to);
                                        return (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                onClick={close}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150",
                                                    isActive
                                                        ? "bg-white/10 text-white font-medium"
                                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <item.icon className="w-4 h-4 shrink-0" />
                                                {item.label}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Admin profile footer */}
                <AdminProfileFooter />
            </aside>
        </>
    );
}

function AdminProfileFooter() {
    const admin = useAdminAuthStore((s) => s.admin);
    const logout = useAdminAuthStore((s) => s.logout);
    if (!admin) return null;

    const roleLabel: Record<string, string> = {
        super_admin: "Super Admin",
        client_admin: "Client Admin",
        support_admin: "Support",
    };

    return (
        <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/30 flex items-center justify-center text-accent text-xs font-bold font-serif">
                    {admin.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                    <p className="text-[11px] text-white/40 truncate">{roleLabel[admin.role]}</p>
                </div>
                <button onClick={logout} className="text-white/30 hover:text-white transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/* ─── Header ──────────────────────────────────────────────── */
function Header() {
    const toggle = useSidebarStore((s) => s.toggle);
    const admin = useAdminAuthStore((s) => s.admin);

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-border-light flex items-center px-4 lg:px-6 gap-4">
            <button onClick={toggle} className="lg:hidden text-muted hover:text-heading transition-colors">
                <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                    type="text"
                    placeholder="Search users, companies, plans..."
                    className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
                />
            </div>

            <div className="flex-1 sm:hidden" />

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 rounded-xl hover:bg-background-primary text-muted hover:text-heading transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
                </button>

                {/* Admin profile */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-border-light">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-heading">{admin?.name}</p>
                        <p className="text-[11px] text-muted capitalize">{admin?.role.replace(/_/g, " ")}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent text-sm font-bold font-serif flex items-center justify-center">
                        {admin?.name.charAt(0) ?? "A"}
                    </div>
                </div>
            </div>
        </header>
    );
}

/* ─── Auth Guard ─────────────────────────────────────────── */
function AuthGuard({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/admin" replace />;
    return <>{children}</>;
}

/* ─── Layout ──────────────────────────────────────────────── */
export default function AdminLayout() {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-background-primary">
                <Sidebar />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 p-4 lg:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
