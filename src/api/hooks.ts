import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./api";
import { getAuthCookie } from "./axios";
import type { LoginRequest, CreditAdjustment } from "./types";

export const queryKeys = {
  // Auth
  currentUser: ["admin", "currentUser"] as const,
  
  // Dashboard
  dashboardStats: ["admin", "dashboard", "stats"] as const,
  
  // Users - Use in: UsersPage, UserDetailPage
  users: ["admin", "users"] as const,
  user: (id: string) => ["admin", "users", id] as const,
  
  // Companies - Use in: CompaniesPage, CompanyDetailPage
  companies: ["admin", "companies"] as const,
  company: (id: string) => ["admin", "companies", id] as const,
  companyEmployees: (id: string) => ["admin", "companies", id, "employees"] as const,
  
  // Credit Ledger - Use in: CreditsPage, UserDetailPage, CompanyDetailPage
  creditLedger: (params?: { userId?: string; companyId?: string }) => 
    ["admin", "ledger", params] as const,
  
  // Billing - Use in: BillingPage
  invoices: ["admin", "billing", "invoices"] as const,
  invoice: (id: string) => ["admin", "billing", "invoices", id] as const,
  
  // AI Logs - Use in: AILogsPage
  aiLogs: (params?: { userId?: string; status?: string }) => 
    ["admin", "ai-logs", params] as const,
  aiLog: (id: string) => ["admin", "ai-logs", id] as const,
  
  // Plans - Use in: PlansPage, UserDetailPage, CompanyDetailPage
  generatedPlans: (params?: { userId?: string; companyId?: string }) => 
    ["admin", "plans", params] as const,
  generatedPlan: (id: string) => ["admin", "plans", id] as const,
  
  // Analytics - Use in: AnalyticsPage
  analytics: ["admin", "analytics"] as const,
  
  // System Status - Use in: SystemStatusPage
  systemStatus: ["admin", "system", "status"] as const,
  
  // System Logs - Use in: SystemLogsPage
  systemLogs: (params?: { level?: string; limit?: number }) => 
    ["admin", "system", "logs", params] as const,
  
  // System Settings - Use in: SystemSettingsPage, SettingsPage
  systemSettings: ["admin", "system", "settings"] as const,
  
  // Roles - Use in: RolesPage
  roles: ["admin", "roles"] as const,
  role: (id: string) => ["admin", "roles", id] as const,
  
  // Admin Users - Use in: AdminUsersPage
  adminUsers: ["admin", "admin-users"] as const,
  adminUser: (id: string) => ["admin", "admin-users", id] as const,
  
  // Abuse Flags - Use in: AbusePage
  abuseFlags: (params?: { resolved?: boolean }) => 
    ["admin", "abuse", params] as const,
};

// ============================================================================
// AUTH HOOKS - Use in: LoginPage, AdminLayout
// ============================================================================

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => adminApi.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const { data } = await adminApi.getCurrentUser();
      return data.data;
    },
    enabled: !!getAuthCookie(),
  });
};

// ============================================================================
// DASHBOARD HOOKS - Use in: Dashboard
// ============================================================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      const { data } = await adminApi.getDashboardStats();
      return data;
    },
  });
};

// ============================================================================
// USER HOOKS - Use in: UsersPage, UserDetailPage
// ============================================================================

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { data } = await adminApi.getUsers();
      return data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      const { data } = await adminApi.getUser(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useResetUserCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      adminApi.resetUserCredits(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.resetUserPassword(id),
  });
};

// ============================================================================
// COMPANY HOOKS - Use in: CompaniesPage, CompanyDetailPage
// ============================================================================

export const useCompanies = () => {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => {
      const { data } = await adminApi.getCompanies();
      return data;
    },
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: queryKeys.company(id),
    queryFn: async () => {
      const { data } = await adminApi.getCompany(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCompanyEmployees = (id: string) => {
  return useQuery({
    queryKey: queryKeys.companyEmployees(id),
    queryFn: async () => {
      const { data } = await adminApi.getCompanyEmployees(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useFreezeCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.freezeCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useUnfreezeCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unfreezeCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useAddCompanyCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      adminApi.addCompanyCredits(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
    },
  });
};

export const useUpgradeTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.upgradeTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

// ============================================================================
// CREDIT LEDGER HOOKS - Use in: CreditsPage, UserDetailPage, CompanyDetailPage
// ============================================================================

export const useCreditLedger = (params?: { userId?: string; companyId?: string }) => {
  return useQuery({
    queryKey: queryKeys.creditLedger(params),
    queryFn: async () => {
      const { data } = await adminApi.getCreditLedger(params);
      return data;
    },
  });
};

export const useAdjustCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreditAdjustment) => adminApi.adjustCredits(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

// ============================================================================
// BILLING HOOKS - Use in: BillingPage
// ============================================================================

export const useInvoices = () => {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: async () => {
      const { data } = await adminApi.getInvoices();
      return data;
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: async () => {
      const { data } = await adminApi.getInvoice(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.markInvoicePaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
};

// ============================================================================
// AI LOGS HOOKS - Use in: AILogsPage
// ============================================================================

export const useAILogs = (params?: { userId?: string; status?: string }) => {
  return useQuery({
    queryKey: queryKeys.aiLogs(params),
    queryFn: async () => {
      const { data } = await adminApi.getAILogs(params);
      return data;
    },
  });
};

export const useAILog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.aiLog(id),
    queryFn: async () => {
      const { data } = await adminApi.getAILog(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useFlagAILog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.flagAILog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiLogs() });
    },
  });
};

// ============================================================================
// PLANS HOOKS - Use in: PlansPage, UserDetailPage, CompanyDetailPage
// ============================================================================

export const useGeneratedPlans = (params?: { userId?: string; companyId?: string }) => {
  return useQuery({
    queryKey: queryKeys.generatedPlans(params),
    queryFn: async () => {
      const { data } = await adminApi.getGeneratedPlans(params);
      return data;
    },
  });
};

export const useGeneratedPlan = (id: string) => {
  return useQuery({
    queryKey: queryKeys.generatedPlan(id),
    queryFn: async () => {
      const { data } = await adminApi.getGeneratedPlan(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generatedPlans() });
    },
  });
};

export const useArchivePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.archivePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generatedPlans() });
    },
  });
};

export const useFlagPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.flagPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generatedPlans() });
    },
  });
};

// ============================================================================
// ANALYTICS HOOKS - Use in: AnalyticsPage
// ============================================================================

export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      const { data } = await adminApi.getAnalytics();
      return data;
    },
  });
};

// ============================================================================
// SYSTEM STATUS HOOKS - Use in: SystemStatusPage
// ============================================================================

export const useSystemStatus = () => {
  return useQuery({
    queryKey: queryKeys.systemStatus,
    queryFn: async () => {
      const { data } = await adminApi.getSystemStatus();
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// ============================================================================
// SYSTEM LOGS HOOKS - Use in: SystemLogsPage
// ============================================================================

export const useSystemLogs = (params?: { level?: string; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.systemLogs(params),
    queryFn: async () => {
      const { data } = await adminApi.getSystemLogs(params);
      return data;
    },
  });
};

// ============================================================================
// SYSTEM SETTINGS HOOKS - Use in: SystemSettingsPage, SettingsPage
// ============================================================================

export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.systemSettings,
    queryFn: async () => {
      const { data } = await adminApi.getSystemSettings();
      return data;
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings });
    },
  });
};

export const useToggleMaintenanceMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.toggleMaintenanceMode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings });
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
    },
  });
};

// ============================================================================
// ROLES HOOKS - Use in: RolesPage
// ============================================================================

export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: async () => {
      const { data } = await adminApi.getRoles();
      return data;
    },
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: queryKeys.role(id),
    queryFn: async () => {
      const { data } = await adminApi.getRole(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
  });
};

// ============================================================================
// ADMIN USERS HOOKS - Use in: AdminUsersPage
// ============================================================================

export const useAdminUsers = () => {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: async () => {
      const { data } = await adminApi.getAdminUsers();
      return data;
    },
  });
};

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: async () => {
      const { data } = await adminApi.getAdminUser(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

// ============================================================================
// ABUSE FLAGS HOOKS - Use in: AbusePage
// ============================================================================

export const useAbuseFlags = (params?: { resolved?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.abuseFlags(params),
    queryFn: async () => {
      const { data } = await adminApi.getAbuseFlags(params);
      return data;
    },
  });
};

export const useResolveAbuseFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.resolveAbuseFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abuseFlags() });
    },
  });
};
