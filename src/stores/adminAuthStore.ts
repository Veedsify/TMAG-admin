import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";

export type AdminRole = "super_admin" | "client_admin" | "support_admin";

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    avatar?: string;
}

const MOCK_SUPER_ADMIN: AdminUser = {
    id: "admin-001",
    name: "System Admin",
    email: "admin@tmag.com",
    role: "super_admin",
};

const MOCK_CLIENT_ADMIN: AdminUser = {
    id: "admin-002",
    name: "Client Manager",
    email: "client@tmag.com",
    role: "client_admin",
};

const MOCK_SUPPORT_ADMIN: AdminUser = {
    id: "admin-003",
    name: "Support Agent",
    email: "support@tmag.com",
    role: "support_admin",
};

// Toggle this to preview different admin roles
export const PREVIEW_ADMIN: AdminUser | null = MOCK_SUPER_ADMIN;
export {MOCK_CLIENT_ADMIN, MOCK_SUPPORT_ADMIN};

interface AdminAuthState {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (admin: AdminUser) => void;
    logout: () => void;
    hasPermission: (requiredRole: AdminRole | AdminRole[]) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set, get) => ({
            admin: PREVIEW_ADMIN,
            isAuthenticated: !!PREVIEW_ADMIN,
            login: (admin) => set({admin, isAuthenticated: true}),
            logout: () => set({admin: null, isAuthenticated: false}),
            hasPermission: (requiredRole) => {
                const {admin} = get();
                if (!admin) return false;
                if (admin.role === "super_admin") return true;
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                return roles.includes(admin.role);
            },
        }),
        {
            name: "tmag-admin-auth",
            storage: createJSONStorage(() => localStorage),
            version: PREVIEW_ADMIN ? PREVIEW_ADMIN.id.charCodeAt(PREVIEW_ADMIN.id.length - 1) : 0,
            migrate: () => ({
                admin: PREVIEW_ADMIN,
                isAuthenticated: !!PREVIEW_ADMIN,
            }),
        }
    )
);
