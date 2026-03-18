// API Response wrapper (matches Spring Boot SuccessResponse)
export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

// Auth
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "client_admin" | "support_admin";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  exp: number;
  user: AdminUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Users
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "individual" | "employee" | "hr_admin";
  planType: "individual" | "corporate";
  companyId?: string;
  companyName?: string;
  creditsUsed: number;
  creditsRemaining: number;
  plansGenerated: number;
  lastActivity: string;
  status: "active" | "suspended";
  riskFlags: string[];
  joinedAt: string;
  avatar?: string;
  location?: string;
  bio?: string;
}

// Companies
export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  creditsPurchased: number;
  creditsRemaining: number;
  plansGenerated: number;
  activeEmployees: number;
  billingStatus: "active" | "overdue" | "frozen";
  contractRenewal: string;
  tier: "standard" | "enterprise";
  hrAdmins: string[];
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
}

// Credits
export interface CreditLedgerEntry {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  companyName?: string;
  action: "consume" | "admin_add" | "admin_deduct" | "refund" | "purchase" | "system_grant";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  triggeredBy: string;
  timestamp: string;
}

export interface CreditAdjustment {
  userId?: string;
  companyId?: string;
  amount: number;
  reason: string;
}

// AI Logs
export interface AIRequestLog {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  companyName?: string;
  destination: string;
  promptSummary: string;
  outputSummary: string;
  tokensUsed: number;
  processingTimeMs: number;
  status: "success" | "error" | "flagged";
  errorMessage?: string;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
  modelUsed: string;
  creditConsumed: boolean;
}

// Plans
export interface GeneratedPlan {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  companyName?: string;
  destination: string;
  duration: string;
  purpose: string;
  riskScore: number;
  vaccinations: string[];
  healthAlerts: string[];
  safetyAdvisories: string[];
  status: "active" | "flagged" | "archived" | "deleted";
  createdAt: string;
  creditUsed: boolean;
}

// Analytics
export interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalCreditsIssued: number;
  totalCreditsConsumed: number;
  aiRequestsToday: number;
  revenueOverview: number;
  failedAICalls: number;
  systemHealthStatus: "healthy" | "degraded" | "down";
  activeUsersToday: number;
  newUsersThisWeek: number;
}

export interface AnalyticsData {
  topDestinations: { name: string; count: number }[];
  avgCreditsPerUser: number;
  corporateVsIndividual: { corporate: number; individual: number };
  peakUsageTimes: { hour: number; requests: number }[];
  monthlyRequests: { month: string; requests: number; revenue: number }[];
  dailyActiveUsers: { day: string; users: number }[];
  creditUsageByType: { type: string; used: number; remaining: number }[];
}

// Billing
export interface Invoice {
  id: string;
  companyId?: string;
  companyName?: string;
  userId?: string;
  userName?: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "refunded";
  description: string;
  issuedAt: string;
  paidAt?: string;
  dueDate: string;
  paymentMethod?: string;
}

// System
export interface SystemSettings {
  defaultIndividualCredits: number;
  defaultCorporateCredits: number;
  aiModelVersion: string;
  planGenerationLimit: number;
  globalDisclaimer: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  maxEmployeesPerCompany: number;
}

export interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "critical";
  message: string;
  source: string;
  timestamp: string;
  details?: string;
}

export interface SystemStatus {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  services: {
    name: string;
    status: "healthy" | "degraded" | "down";
    latency?: number;
  }[];
  lastChecked: string;
}

// Roles & Permissions
export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

// Abuse
export interface AbuseFlag {
  id: string;
  userId: string;
  userName: string;
  type: "rapid_generation" | "credit_bypass" | "spam" | "suspicious_query";
  description: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ─── HR Management ────────────────────────────────────────────

export interface HREmployee {
  id: number;
  name: string;
  email: string;
  department: string;
  creditsUsed: number;
  creditsAllocated: number;
  status: "active" | "inactive";
  plansGenerated: number;
  companyId: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HRCreateEmployeeRequest {
  name: string;
  email: string;
  department: string;
  creditsAllocated: number;
  status: "active" | "inactive";
  company_id: number;
  creditsUsed?: number;
  plansGenerated?: number;
}

export interface HRTravelRequest {
  id: number;
  destination: string;
  dates: string;
  status: "pending" | "approved" | "rejected" | "completed";
  submittedAt?: string;
  companyId?: number;
  employeeId?: number;
  employeeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HRCreditLedgerEntry {
  id: number;
  amount: number;
  balanceAfter: number;
  type: string;
  reference: string;
  companyId?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

