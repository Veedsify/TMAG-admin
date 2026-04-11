import { useEffect, type ElementType } from "react";
import { Link, NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
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
    Search,
    Server,
    Receipt,
    UserCog,
    ShieldAlert,
    Bell,
    FileUp,
    BookOpen,
    ClipboardList,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminAuthStore } from "../../stores/adminAuthStore";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useAuth } from "../../context/AuthContext";

/** Flat nav — mirrors client HR / dashboard sidebar item styling */
const navItems: { to: string; icon: ElementType; label: string }[] = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/companies", icon: Building2, label: "Companies" },
    { to: "/admin/company-registrations", icon: ClipboardList, label: "Registrations" },
    { to: "/admin/ledger", icon: CreditCard, label: "Credit Ledger" },
    { to: "/admin/billing", icon: Receipt, label: "Billing" },
    { to: "/admin/ai-logs", icon: Bot, label: "AI Requests" },
    { to: "/admin/plans", icon: FileText, label: "User plans" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/system/status", icon: Server, label: "System Status" },
    { to: "/admin/system/logs", icon: AlertTriangle, label: "System Logs" },
    { to: "/admin/abuse", icon: ShieldAlert, label: "Abuse Flags" },
    { to: "/admin/plan-contexts", icon: FileUp, label: "Plan Contexts" },
    { to: "/admin/ebooks", icon: BookOpen, label: "Store" },
    { to: "/admin/system/settings", icon: Settings, label: "Settings" },
    { to: "/admin/roles", icon: Shield, label: "Roles" },
    { to: "/admin/admin-users", icon: UserCog, label: "Admin Users" },
];

function isNavActive(pathname: string, to: string): boolean {
    if (to === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname === to || pathname.startsWith(`${to}/`);
}

function Sidebar() {
    const { open, close } = useSidebarStore();
    const location = useLocation();

    useEffect(() => {
        close();
    }, [location.pathname, close]);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={close}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen w-64 bg-darkest text-white flex flex-col z-50 transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                <div className="flex items-center justify-between px-6 py-6 border-b border-white/6">
                    <Link
                        to="/admin/dashboard"
                        className="flex flex-col gap-0.5"
                        onClick={close}
                    >
                        <span className="text-xl font-serif font-medium tracking-tight text-white">
                            TMAG
                        </span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">
                            Admin
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={close}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                    >
                        <X className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isNavActive(location.pathname, item.to);
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={close}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                                    active ?
                                        "bg-white/10 text-white"
                                    :   "text-white/45 hover:text-white hover:bg-white/4",
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

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
        <div className="px-4 py-4 border-t border-white/6">
            <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/70 font-serif">
                    {admin.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                    <p className="text-xs text-white/30 truncate">{roleLabel[admin.role]}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/4 transition-colors duration-150 cursor-pointer"
            >
                <LogOut className="w-4 h-4" />
                Sign out
            </button>
        </div>
    );
}

/** Client-style top row: menu (mobile), search, notifications — no white app bar */
function AdminTopBar() {
    const toggle = useSidebarStore((s) => s.toggle);

    return (
        <header className="flex items-center justify-between gap-4 mb-6 lg:mb-8">
            <button
                type="button"
                onClick={toggle}
                className="lg:hidden p-2 rounded-xl bg-button-secondary text-heading hover:bg-border-light transition-colors duration-150 cursor-pointer shrink-0"
            >
                <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex flex-1 max-w-md lg:max-w-lg">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                    <input
                        type="search"
                        name="admin-search"
                        placeholder="Search users, companies, plans..."
                        className="w-full pl-9 pr-4 py-2 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-colors duration-150"
                    />
                </div>
            </div>

            <div className="flex-1 sm:hidden" />

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    className="relative p-2 rounded-xl bg-button-secondary text-heading hover:bg-border-light transition-colors duration-150"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
                </button>
            </div>
        </header>
    );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, logout } = useAuth();
    const isSuperAdmin = useAdminAuthStore((s) => s.isSuperAdmin);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    <p className="text-sm text-muted">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    if (!isSuperAdmin()) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-danger" />
                    </div>
                    <h1 className="text-2xl font-serif text-heading mb-2">Access Denied</h1>
                    <p className="text-sm text-body mb-6">
                        You do not have super admin privileges to access this panel.
                    </p>
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full sm:w-auto py-3 px-8 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default function AdminLayout() {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-background-primary">
                <Sidebar />
                <main className="lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-7xl">
                    <AdminTopBar />
                    <Outlet />
                </main>
            </div>
        </AuthGuard>
    );
}
