import api from "./axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  AdminUser,
  ManagedUser,
  Company,
  CreditLedgerEntry,
  CreditAdjustment,
  AIRequestLog,
  GeneratedPlan,
  DashboardStats,
  AnalyticsData,
  Invoice,
  SystemSettings,
  SystemLog,
  SystemStatus,
  AdminRole,
  AbuseFlag,
  HRCreateEmployeeRequest,
  CompanyPricing,
  CompanyCreditQuote,
  CompanyCreditPurchase,
  InitiatePurchaseResponse,
} from "./types";

export const adminApi = {
  // Auth - /admin/auth/*
  login: (data: LoginRequest) => api.post<ApiResponse<AuthResponse>>("/admin/auth/login", data),
  logout: () => api.post("/admin/auth/logout"),
  getCurrentUser: () => api.get<ApiResponse<AdminUser>>("/admin/auth/me"),

  // Dashboard - /admin/dashboard/*
  getDashboardStats: () => api.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats"),

  // Users - /admin/users/*
  getUsers: () => api.get<ApiResponse<ManagedUser[]>>("/admin/users"),
  getUser: (id: string) => api.get<ApiResponse<ManagedUser>>(`/admin/users/${id}`),
  createUser: (data: Partial<ManagedUser>) => api.post<ApiResponse<ManagedUser>>("/admin/users", data),
  updateUser: (id: string, data: Partial<ManagedUser>) => api.put<ApiResponse<ManagedUser>>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.post(`/admin/users/${id}/activate`),
  resetUserCredits: (id: string, amount: number) => api.post(`/admin/users/${id}/reset-credits`, { amount }),
  resetUserPassword: (id: string) => api.post(`/admin/users/${id}/reset-password`),

  // Companies - /admin/companies/*
  getCompanies: () => api.get<ApiResponse<Company[]>>("/admin/companies"),
  getCompany: (id: string) => api.get<ApiResponse<Company>>(`/admin/companies/${id}`),
  createCompany: (data: Partial<Company>) => api.post<ApiResponse<Company>>("/admin/companies", data),
  updateCompany: (id: string, data: Partial<Company>) => api.put<ApiResponse<Company>>(`/admin/companies/${id}`, data),
  deleteCompany: (id: string) => api.delete(`/admin/companies/${id}`),
  getCompanyEmployees: (id: string) => api.get<ApiResponse<ManagedUser[]>>(`/admin/companies/${id}/employees`),
  freezeCompany: (id: string) => api.post(`/admin/companies/${id}/freeze`),
  unfreezeCompany: (id: string) => api.post(`/admin/companies/${id}/unfreeze`),
  addCompanyCredits: (id: string, amount: number) => api.post(`/admin/companies/${id}/add-credits`, { amount }),
  upgradeTier: (id: string) => api.post(`/admin/companies/${id}/upgrade-tier`),

  // Credit Ledger - /admin/ledger/*
  getCreditLedger: (params?: { userId?: string; companyId?: string }) =>
    api.get<ApiResponse<CreditLedgerEntry[]>>("/admin/ledger", { params }),
  adjustCredits: (data: CreditAdjustment) => api.post<ApiResponse<CreditLedgerEntry>>("/admin/ledger/adjust", data),

  // Billing - /admin/billing/*
  getInvoices: () => api.get<ApiResponse<Invoice[]>>("/admin/billing/invoices"),
  getInvoice: (id: string) => api.get<ApiResponse<Invoice>>(`/admin/billing/invoices/${id}`),
  createInvoice: (data: Partial<Invoice>) => api.post<ApiResponse<Invoice>>("/admin/billing/invoices", data),
  updateInvoice: (id: string, data: Partial<Invoice>) => api.put<ApiResponse<Invoice>>(`/admin/billing/invoices/${id}`, data),
  markInvoicePaid: (id: string) => api.post(`/admin/billing/invoices/${id}/paid`),

  // AI Logs - /admin/ai-logs/*
  getAILogs: (params?: { userId?: string; status?: string }) =>
    api.get<ApiResponse<AIRequestLog[]>>("/admin/ai-logs", { params }),
  getAILog: (id: string) => api.get<ApiResponse<AIRequestLog>>(`/admin/ai-logs/${id}`),
  flagAILog: (id: string) => api.post(`/admin/ai-logs/${id}/flag`),

  // Plans - /admin/plans/*
  getGeneratedPlans: (params?: { userId?: string; companyId?: string }) =>
    api.get<ApiResponse<GeneratedPlan[]>>("/admin/plans", { params }),
  getGeneratedPlan: (id: string) => api.get<ApiResponse<GeneratedPlan>>(`/admin/plans/${id}`),
  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),
  archivePlan: (id: string) => api.post(`/admin/plans/${id}/archive`),
  flagPlan: (id: string) => api.post(`/admin/plans/${id}/flag`),

  // Analytics - /admin/analytics/*
  getAnalytics: () => api.get<ApiResponse<AnalyticsData>>("/admin/analytics"),

  // System Status - /admin/system/status/*
  getSystemStatus: () => api.get<ApiResponse<SystemStatus>>("/admin/system/status"),

  // System Logs - /admin/system/logs/*
  getSystemLogs: (params?: { level?: string; limit?: number }) =>
    api.get<ApiResponse<SystemLog[]>>("/admin/system/logs", { params }),

  // System Settings - /admin/system/settings/*
  getSystemSettings: () => api.get<ApiResponse<SystemSettings>>("/admin/system/settings"),
  updateSystemSettings: (data: Partial<SystemSettings>) =>
    api.put<ApiResponse<SystemSettings>>("/admin/system/settings", data),
  toggleMaintenanceMode: () => api.post("/admin/system/settings/toggle-maintenance"),

  // Roles - /admin/roles/*
  getRoles: () => api.get<ApiResponse<AdminRole[]>>("/admin/roles"),
  getRole: (id: string) => api.get<ApiResponse<AdminRole>>(`/admin/roles/${id}`),
  createRole: (data: Partial<AdminRole>) => api.post<ApiResponse<AdminRole>>("/admin/roles", data),
  updateRole: (id: string, data: Partial<AdminRole>) => api.put<ApiResponse<AdminRole>>(`/admin/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/admin/roles/${id}`),

  // Admin Users - /admin/admin-users/*
  getAdminUsers: () => api.get<ApiResponse<AdminUser[]>>("/admin/admin-users"),
  getAdminUser: (id: string) => api.get<ApiResponse<AdminUser>>(`/admin/admin-users/${id}`),
  createAdminUser: (data: Partial<AdminUser>) => api.post<ApiResponse<AdminUser>>("/admin/admin-users", data),
  updateAdminUser: (id: string, data: Partial<AdminUser>) =>
    api.put<ApiResponse<AdminUser>>(`/admin/admin-users/${id}`, data),
  deleteAdminUser: (id: string) => api.delete(`/admin/admin-users/${id}`),

  // Abuse Flags - /admin/abuse/*
  getAbuseFlags: (params?: { resolved?: boolean }) =>
    api.get<ApiResponse<AbuseFlag[]>>("/admin/abuse", { params }),
  resolveAbuseFlag: (id: string) => api.post(`/admin/abuse/${id}/resolve`),

  // ─── HR Management (standard authenticated endpoints) ───────

  // Employees - /v1/employees/*
  hrGetEmployees: (companyId?: string) =>
    api.get("/v1/employees", { params: companyId ? { companyId } : {} }),
  hrCreateEmployee: (data: HRCreateEmployeeRequest) =>
    api.post("/v1/employees", data),
  hrUpdateEmployee: (id: string, data: Partial<HRCreateEmployeeRequest>) =>
    api.put(`/v1/employees/${id}`, data),
  hrDeleteEmployee: (id: string) =>
    api.delete(`/v1/employees/${id}`),
  hrAllocateCredits: (id: string, creditsAllocated: number) =>
    api.put(`/v1/employees/${id}/credits`, { creditsAllocated }),
  hrUpdateEmployeeStatus: (id: string, status: "active" | "inactive") =>
    api.put(`/v1/employees/${id}/status`, { status }),

  // Travel Requests - /v1/travel-requests/*
  hrGetTravelRequests: (companyId?: string) =>
    api.get("/v1/travel-requests", { params: companyId ? { companyId } : {} }),
  hrApproveTravelRequest: (id: string) =>
    api.post(`/v1/travel-requests/${id}/approve`),
  hrRejectTravelRequest: (id: string) =>
    api.post(`/v1/travel-requests/${id}/reject`),

  // Credits - /v1/companies/:id/purchase-credits
  hrPurchaseCredits: (companyId: string, amount: number, reference?: string) =>
    api.post(`/v1/companies/${companyId}/purchase-credits`, { amount, reference }),
  hrGetCreditLedger: (companyId: string) =>
    api.get("/v1/credits", { params: { companyId } }),

  // Company Admin Credit Purchase - /v1/company-admin/credits/*
  getCompanyPricing: (companyId: string) =>
    api.get<ApiResponse<CompanyPricing>>(`/v1/company-admin/credits/pricing`, { params: { companyId } }),
  getCompanyCreditQuote: (companyId: string, credits: number) =>
    api.post<ApiResponse<CompanyCreditQuote>>(`/v1/company-admin/credits/quote`, null, { params: { companyId, credits } }),
  initiateCompanyCreditPurchase: (companyId: string, credits: number) =>
    api.post<ApiResponse<InitiatePurchaseResponse>>(`/v1/company-admin/credits/purchase`, { companyId, credits }),
  verifyCompanyCreditPurchase: (txRef: string, transactionId?: string) =>
    api.get<ApiResponse<{ success: boolean; purchase: CompanyCreditPurchase }>>(`/v1/company-admin/credits/verify/${txRef}`, { params: transactionId ? { transaction_id: transactionId } : {} }),
  getCompanyCreditHistory: (companyId?: string) =>
    api.get<ApiResponse<CompanyCreditPurchase[]>>(`/v1/company-admin/credits/history`, { params: companyId ? { companyId } : {} }),
  getCompanyCreditPurchase: (txRef: string) =>
    api.get<ApiResponse<CompanyCreditPurchase>>(`/v1/company-admin/credits/${txRef}`),
};
