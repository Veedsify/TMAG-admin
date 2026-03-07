import { create } from "zustand";

/* ─── Types ────────────────────────────────────────────────── */

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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "client_admin" | "support_admin";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "critical";
  message: string;
  source: string;
  timestamp: string;
  details?: string;
}

/* ─── Mock Data ────────────────────────────────────────────── */

const MOCK_USERS: ManagedUser[] = [
  { id: "u-001", name: "John Okafor", email: "john@example.com", phone: "+234 812 345 6789", role: "individual", planType: "individual", creditsUsed: 12, creditsRemaining: 8, plansGenerated: 12, lastActivity: "2025-01-15T10:30:00Z", status: "active", riskFlags: [], joinedAt: "2024-06-15", location: "Lagos, Nigeria", bio: "Frequent business traveler" },
  { id: "u-002", name: "Amina Bello", email: "amina@techcorp.com", phone: "+234 803 987 6543", role: "employee", planType: "corporate", companyId: "c-001", companyName: "TechCorp International", creditsUsed: 5, creditsRemaining: 15, plansGenerated: 5, lastActivity: "2025-01-14T14:20:00Z", status: "active", riskFlags: [], joinedAt: "2024-08-20", location: "Abuja, Nigeria" },
  { id: "u-003", name: "David Chen", email: "david@globalhealth.com", phone: "+1 415 555 0123", role: "hr_admin", planType: "corporate", companyId: "c-002", companyName: "GlobalHealth Inc.", creditsUsed: 22, creditsRemaining: 78, plansGenerated: 22, lastActivity: "2025-01-15T09:00:00Z", status: "active", riskFlags: [], joinedAt: "2024-03-10", location: "San Francisco, USA" },
  { id: "u-004", name: "Sarah Williams", email: "sarah@example.com", phone: "+44 20 7946 0958", role: "individual", planType: "individual", creditsUsed: 25, creditsRemaining: 0, plansGenerated: 25, lastActivity: "2025-01-10T16:45:00Z", status: "active", riskFlags: ["exhausted_credits"], joinedAt: "2024-01-05", location: "London, UK" },
  { id: "u-005", name: "Michael Adeyemi", email: "michael@meridian.com", role: "employee", planType: "corporate", companyId: "c-003", companyName: "Meridian Consulting", creditsUsed: 3, creditsRemaining: 7, plansGenerated: 3, lastActivity: "2025-01-13T11:15:00Z", status: "active", riskFlags: [], joinedAt: "2024-09-01", location: "Port Harcourt, Nigeria" },
  { id: "u-006", name: "Grace Eze", email: "grace@techcorp.com", phone: "+234 807 111 2222", role: "hr_admin", planType: "corporate", companyId: "c-001", companyName: "TechCorp International", creditsUsed: 18, creditsRemaining: 32, plansGenerated: 18, lastActivity: "2025-01-15T08:30:00Z", status: "active", riskFlags: [], joinedAt: "2024-04-22", location: "Lagos, Nigeria" },
  { id: "u-007", name: "Liu Wei", email: "liu@example.com", role: "individual", planType: "individual", creditsUsed: 30, creditsRemaining: 0, plansGenerated: 30, lastActivity: "2025-01-12T13:00:00Z", status: "suspended", riskFlags: ["rapid_generation", "spam"], joinedAt: "2024-07-18", location: "Beijing, China" },
  { id: "u-008", name: "Fatima Abdullahi", email: "fatima@globalhealth.com", role: "employee", planType: "corporate", companyId: "c-002", companyName: "GlobalHealth Inc.", creditsUsed: 8, creditsRemaining: 12, plansGenerated: 8, lastActivity: "2025-01-14T17:30:00Z", status: "active", riskFlags: [], joinedAt: "2024-05-30", location: "Kano, Nigeria" },
  { id: "u-009", name: "James Okonkwo", email: "james@example.com", role: "individual", planType: "individual", creditsUsed: 2, creditsRemaining: 18, plansGenerated: 2, lastActivity: "2025-01-15T07:45:00Z", status: "active", riskFlags: [], joinedAt: "2024-11-12", location: "Enugu, Nigeria" },
  { id: "u-010", name: "Elena Rodriguez", email: "elena@meridian.com", role: "hr_admin", planType: "corporate", companyId: "c-003", companyName: "Meridian Consulting", creditsUsed: 15, creditsRemaining: 35, plansGenerated: 15, lastActivity: "2025-01-14T10:00:00Z", status: "active", riskFlags: [], joinedAt: "2024-02-28", location: "Madrid, Spain" },
  { id: "u-011", name: "Chinedu Nwankwo", email: "chinedu@example.com", role: "individual", planType: "individual", creditsUsed: 7, creditsRemaining: 13, plansGenerated: 7, lastActivity: "2025-01-11T15:20:00Z", status: "active", riskFlags: [], joinedAt: "2024-10-05", location: "Benin City, Nigeria" },
  { id: "u-012", name: "Priya Sharma", email: "priya@techcorp.com", role: "employee", planType: "corporate", companyId: "c-001", companyName: "TechCorp International", creditsUsed: 10, creditsRemaining: 10, plansGenerated: 10, lastActivity: "2025-01-13T09:45:00Z", status: "active", riskFlags: [], joinedAt: "2024-06-18", location: "Mumbai, India" },
  { id: "u-013", name: "Olivia Brown", email: "olivia@example.com", role: "individual", planType: "individual", creditsUsed: 4, creditsRemaining: 16, plansGenerated: 4, lastActivity: "2025-01-15T11:00:00Z", status: "active", riskFlags: [], joinedAt: "2024-12-01", location: "Cape Town, South Africa" },
  { id: "u-014", name: "Ahmed Hassan", email: "ahmed@globalhealth.com", role: "employee", planType: "corporate", companyId: "c-002", companyName: "GlobalHealth Inc.", creditsUsed: 6, creditsRemaining: 14, plansGenerated: 6, lastActivity: "2025-01-14T12:15:00Z", status: "active", riskFlags: [], joinedAt: "2024-07-25", location: "Cairo, Egypt" },
];

const MOCK_COMPANIES: Company[] = [
  { id: "c-001", name: "TechCorp International", industry: "Technology", website: "https://techcorp.example.com", creditsPurchased: 500, creditsRemaining: 320, plansGenerated: 180, activeEmployees: 45, billingStatus: "active", contractRenewal: "2025-06-30", tier: "enterprise", hrAdmins: ["u-006"], contactEmail: "admin@techcorp.com", contactPhone: "+234 1 234 5678", address: "12 Victoria Island, Lagos", createdAt: "2024-01-15" },
  { id: "c-002", name: "GlobalHealth Inc.", industry: "Healthcare", website: "https://globalhealth.example.com", creditsPurchased: 300, creditsRemaining: 178, plansGenerated: 122, activeEmployees: 28, billingStatus: "active", contractRenewal: "2025-04-15", tier: "enterprise", hrAdmins: ["u-003"], contactEmail: "admin@globalhealth.com", contactPhone: "+1 415 555 0100", address: "500 Market St, San Francisco", createdAt: "2024-02-20" },
  { id: "c-003", name: "Meridian Consulting", industry: "Consulting", website: "https://meridian.example.com", creditsPurchased: 100, creditsRemaining: 62, plansGenerated: 38, activeEmployees: 12, billingStatus: "overdue", contractRenewal: "2025-02-28", tier: "standard", hrAdmins: ["u-010"], contactEmail: "admin@meridian.com", address: "Calle Mayor 15, Madrid", createdAt: "2024-03-10" },
  { id: "c-004", name: "Nexus Logistics", industry: "Logistics", creditsPurchased: 200, creditsRemaining: 145, plansGenerated: 55, activeEmployees: 18, billingStatus: "active", contractRenewal: "2025-08-01", tier: "standard", hrAdmins: [], contactEmail: "ops@nexuslog.com", createdAt: "2024-05-01" },
];

const MOCK_CREDIT_LEDGER: CreditLedgerEntry[] = [
  { id: "cl-001", userId: "u-001", userName: "John Okafor", action: "consume", amount: -1, balanceBefore: 9, balanceAfter: 8, reason: "Travel plan generated: Lagos → London", triggeredBy: "system", timestamp: "2025-01-15T10:30:00Z" },
  { id: "cl-002", userId: "u-002", userName: "Amina Bello", companyId: "c-001", companyName: "TechCorp International", action: "consume", amount: -1, balanceBefore: 16, balanceAfter: 15, reason: "Travel plan generated: Abuja → Dubai", triggeredBy: "system", timestamp: "2025-01-14T14:20:00Z" },
  { id: "cl-003", userId: "u-004", userName: "Sarah Williams", action: "admin_add", amount: 5, balanceBefore: 0, balanceAfter: 5, reason: "Admin credit top-up – customer request", triggeredBy: "admin-001", timestamp: "2025-01-13T09:00:00Z" },
  { id: "cl-004", userId: "u-007", userName: "Liu Wei", action: "refund", amount: 3, balanceBefore: 0, balanceAfter: 3, reason: "Refund for failed AI generations", triggeredBy: "admin-001", timestamp: "2025-01-12T15:30:00Z" },
  { id: "cl-005", userId: "u-003", userName: "David Chen", companyId: "c-002", companyName: "GlobalHealth Inc.", action: "consume", amount: -1, balanceBefore: 79, balanceAfter: 78, reason: "Travel plan generated: Accra → Tokyo", triggeredBy: "system", timestamp: "2025-01-15T09:00:00Z" },
  { id: "cl-006", userId: "u-009", userName: "James Okonkwo", action: "purchase", amount: 20, balanceBefore: 0, balanceAfter: 20, reason: "Individual plan purchase", triggeredBy: "paystack", timestamp: "2024-11-12T08:00:00Z" },
  { id: "cl-007", userId: "u-006", userName: "Grace Eze", companyId: "c-001", companyName: "TechCorp International", action: "system_grant", amount: 50, balanceBefore: 0, balanceAfter: 50, reason: "Initial corporate credit allocation", triggeredBy: "system", timestamp: "2024-04-22T10:00:00Z" },
  { id: "cl-008", userId: "u-010", userName: "Elena Rodriguez", companyId: "c-003", companyName: "Meridian Consulting", action: "admin_deduct", amount: -5, balanceBefore: 40, balanceAfter: 35, reason: "Credit adjustment – billing correction", triggeredBy: "admin-001", timestamp: "2025-01-10T14:00:00Z" },
  { id: "cl-009", userId: "u-013", userName: "Olivia Brown", action: "purchase", amount: 20, balanceBefore: 0, balanceAfter: 20, reason: "Individual plan purchase", triggeredBy: "paystack", timestamp: "2024-12-01T09:00:00Z" },
  { id: "cl-010", userId: "u-011", userName: "Chinedu Nwankwo", action: "consume", amount: -1, balanceBefore: 14, balanceAfter: 13, reason: "Travel plan generated: Benin City → Amsterdam", triggeredBy: "system", timestamp: "2025-01-11T15:20:00Z" },
  { id: "cl-011", userId: "u-014", userName: "Ahmed Hassan", companyId: "c-002", companyName: "GlobalHealth Inc.", action: "consume", amount: -1, balanceBefore: 15, balanceAfter: 14, reason: "Travel plan generated: Cairo → Singapore", triggeredBy: "system", timestamp: "2025-01-14T12:15:00Z" },
  { id: "cl-012", userId: "u-012", userName: "Priya Sharma", companyId: "c-001", companyName: "TechCorp International", action: "consume", amount: -1, balanceBefore: 11, balanceAfter: 10, reason: "Travel plan generated: Mumbai → Lagos", triggeredBy: "system", timestamp: "2025-01-13T09:45:00Z" },
];

const MOCK_AI_LOGS: AIRequestLog[] = [
  { id: "ai-001", userId: "u-001", userName: "John Okafor", destination: "London, UK", promptSummary: "Business trip, 2 weeks, no pre-existing conditions", outputSummary: "Low risk. No vaccinations required. General travel health advisory provided.", tokensUsed: 2340, processingTimeMs: 3200, status: "success", riskLevel: "low", timestamp: "2025-01-15T10:30:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-002", userId: "u-002", userName: "Amina Bello", companyId: "c-001", companyName: "TechCorp International", destination: "Dubai, UAE", promptSummary: "Conference trip, 5 days, diabetes management", outputSummary: "Low risk. Insulin storage advisory. Heat precautions included.", tokensUsed: 2890, processingTimeMs: 4100, status: "success", riskLevel: "low", timestamp: "2025-01-14T14:20:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-003", userId: "u-003", userName: "David Chen", companyId: "c-002", companyName: "GlobalHealth Inc.", destination: "Tokyo, Japan", promptSummary: "Research trip, 3 weeks, allergies to penicillin", outputSummary: "Low risk. JE vaccine recommended. Alternative antibiotics noted.", tokensUsed: 3100, processingTimeMs: 3800, status: "success", riskLevel: "low", timestamp: "2025-01-15T09:00:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-004", userId: "u-007", userName: "Liu Wei", destination: "Kinshasa, DRC", promptSummary: "NGO deployment, 6 months, immunocompromised", outputSummary: "HIGH RISK. Multiple vaccinations required. Malaria prophylaxis critical.", tokensUsed: 4200, processingTimeMs: 5600, status: "flagged", riskLevel: "high", timestamp: "2025-01-12T12:00:00Z", modelUsed: "gpt-4o", creditConsumed: true },
  { id: "ai-005", userId: "u-005", userName: "Michael Adeyemi", companyId: "c-003", companyName: "Meridian Consulting", destination: "São Paulo, Brazil", promptSummary: "Client meeting, 1 week, no conditions", outputSummary: "", tokensUsed: 0, processingTimeMs: 12000, status: "error", errorMessage: "AI model timeout – request exceeded 10s limit", riskLevel: "low", timestamp: "2025-01-13T11:15:00Z", modelUsed: "gpt-4o-mini", creditConsumed: false },
  { id: "ai-006", userId: "u-008", userName: "Fatima Abdullahi", companyId: "c-002", companyName: "GlobalHealth Inc.", destination: "Nairobi, Kenya", promptSummary: "Field work, 2 weeks, pregnancy", outputSummary: "MEDIUM RISK. Yellow fever vaccine contraindicated in pregnancy. Zika advisory.", tokensUsed: 3800, processingTimeMs: 4500, status: "flagged", riskLevel: "medium", timestamp: "2025-01-14T17:30:00Z", modelUsed: "gpt-4o", creditConsumed: true },
  { id: "ai-007", userId: "u-011", userName: "Chinedu Nwankwo", destination: "Paris, France", promptSummary: "Vacation, 10 days, asthma", outputSummary: "Low risk. Air quality advisory. Inhaler supply recommendation.", tokensUsed: 2100, processingTimeMs: 2900, status: "success", riskLevel: "low", timestamp: "2025-01-11T15:20:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-008", userId: "u-012", userName: "Priya Sharma", companyId: "c-001", companyName: "TechCorp International", destination: "Lagos, Nigeria", promptSummary: "Training program, 3 days, no conditions", outputSummary: "Medium risk. Yellow fever vaccine required. Malaria prophylaxis recommended.", tokensUsed: 2650, processingTimeMs: 3400, status: "success", riskLevel: "medium", timestamp: "2025-01-13T09:45:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-009", userId: "u-013", userName: "Olivia Brown", destination: "Bangkok, Thailand", promptSummary: "Solo travel, 3 weeks, no conditions", outputSummary: "Low risk. Hepatitis A recommended. Food/water safety advisory.", tokensUsed: 2400, processingTimeMs: 3100, status: "success", riskLevel: "low", timestamp: "2025-01-15T11:00:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-010", userId: "u-014", userName: "Ahmed Hassan", companyId: "c-002", companyName: "GlobalHealth Inc.", destination: "Singapore", promptSummary: "Conference, 1 week, hypertension", outputSummary: "Low risk. Medication supply advisory. No vaccinations required.", tokensUsed: 2200, processingTimeMs: 2800, status: "success", riskLevel: "low", timestamp: "2025-01-14T12:15:00Z", modelUsed: "gpt-4o-mini", creditConsumed: true },
  { id: "ai-011", userId: "u-001", userName: "John Okafor", destination: "Mogadishu, Somalia", promptSummary: "Emergency deployment, 2 weeks, no conditions", outputSummary: "CRITICAL RISK. Active conflict zone. Full vaccination panel recommended.", tokensUsed: 4800, processingTimeMs: 6200, status: "flagged", riskLevel: "high", timestamp: "2025-01-14T08:00:00Z", modelUsed: "gpt-4o", creditConsumed: true },
  { id: "ai-012", userId: "u-009", userName: "James Okonkwo", destination: "Accra, Ghana", promptSummary: "Wedding, 4 days, no conditions", outputSummary: "", tokensUsed: 0, processingTimeMs: 15000, status: "error", errorMessage: "Rate limit exceeded – too many concurrent requests", riskLevel: "low", timestamp: "2025-01-15T07:45:00Z", modelUsed: "gpt-4o-mini", creditConsumed: false },
];

const MOCK_PLANS: GeneratedPlan[] = [
  { id: "p-001", userId: "u-001", userName: "John Okafor", destination: "London, UK", duration: "2 weeks", purpose: "Business", riskScore: 15, vaccinations: ["None required"], healthAlerts: ["General travel advisory"], safetyAdvisories: ["Standard UK travel safety"], status: "active", createdAt: "2025-01-15", creditUsed: true },
  { id: "p-002", userId: "u-002", userName: "Amina Bello", companyId: "c-001", companyName: "TechCorp International", destination: "Dubai, UAE", duration: "5 days", purpose: "Conference", riskScore: 20, vaccinations: ["None required"], healthAlerts: ["Heat precautions", "Insulin storage"], safetyAdvisories: ["Moderate heat advisory"], status: "active", createdAt: "2025-01-14", creditUsed: true },
  { id: "p-003", userId: "u-003", userName: "David Chen", companyId: "c-002", companyName: "GlobalHealth Inc.", destination: "Tokyo, Japan", duration: "3 weeks", purpose: "Research", riskScore: 18, vaccinations: ["Japanese Encephalitis"], healthAlerts: ["Penicillin allergy noted"], safetyAdvisories: ["Earthquake preparedness"], status: "active", createdAt: "2025-01-15", creditUsed: true },
  { id: "p-004", userId: "u-007", userName: "Liu Wei", destination: "Kinshasa, DRC", duration: "6 months", purpose: "NGO Deployment", riskScore: 85, vaccinations: ["Yellow Fever", "Typhoid", "Hepatitis A", "Hepatitis B", "Rabies", "Meningococcal"], healthAlerts: ["Malaria prophylaxis critical", "Immunocompromised patient – specialist consultation required"], safetyAdvisories: ["Active conflict zones", "Limited medical infrastructure", "Water purification required"], status: "flagged", createdAt: "2025-01-12", creditUsed: true },
  { id: "p-005", userId: "u-008", userName: "Fatima Abdullahi", companyId: "c-002", companyName: "GlobalHealth Inc.", destination: "Nairobi, Kenya", duration: "2 weeks", purpose: "Field Work", riskScore: 55, vaccinations: ["Typhoid", "Hepatitis A"], healthAlerts: ["Yellow fever vaccine contraindicated", "Zika risk area", "Pregnancy considerations"], safetyAdvisories: ["Urban security advisory", "Wildlife precautions"], status: "flagged", createdAt: "2025-01-14", creditUsed: true },
  { id: "p-006", userId: "u-011", userName: "Chinedu Nwankwo", destination: "Paris, France", duration: "10 days", purpose: "Vacation", riskScore: 10, vaccinations: ["None required"], healthAlerts: ["Air quality advisory", "Inhaler supply"], safetyAdvisories: ["Standard EU travel safety"], status: "active", createdAt: "2025-01-11", creditUsed: true },
  { id: "p-007", userId: "u-012", userName: "Priya Sharma", companyId: "c-001", companyName: "TechCorp International", destination: "Lagos, Nigeria", duration: "3 days", purpose: "Training", riskScore: 45, vaccinations: ["Yellow Fever", "Typhoid"], healthAlerts: ["Malaria prophylaxis recommended"], safetyAdvisories: ["Urban security advisory", "Traffic safety"], status: "active", createdAt: "2025-01-13", creditUsed: true },
  { id: "p-008", userId: "u-009", userName: "James Okonkwo", destination: "New York, USA", duration: "1 week", purpose: "Conference", riskScore: 8, vaccinations: ["None required"], healthAlerts: ["General travel advisory"], safetyAdvisories: ["Standard US travel safety"], status: "active", createdAt: "2025-01-10", creditUsed: true },
  { id: "p-009", userId: "u-013", userName: "Olivia Brown", destination: "Bangkok, Thailand", duration: "3 weeks", purpose: "Solo Travel", riskScore: 25, vaccinations: ["Hepatitis A", "Typhoid"], healthAlerts: ["Food and water safety", "Dengue precautions"], safetyAdvisories: ["Street safety", "Scam awareness"], status: "active", createdAt: "2025-01-15", creditUsed: true },
  { id: "p-010", userId: "u-014", userName: "Ahmed Hassan", companyId: "c-002", companyName: "GlobalHealth Inc.", destination: "Singapore", duration: "1 week", purpose: "Conference", riskScore: 5, vaccinations: ["None required"], healthAlerts: ["Hypertension medication supply"], safetyAdvisories: ["Standard Singapore safety"], status: "active", createdAt: "2025-01-14", creditUsed: true },
  { id: "p-011", userId: "u-001", userName: "John Okafor", destination: "Mogadishu, Somalia", duration: "2 weeks", purpose: "Emergency Deployment", riskScore: 95, vaccinations: ["Yellow Fever", "Typhoid", "Hepatitis A", "Hepatitis B", "Meningococcal", "Polio"], healthAlerts: ["Active conflict zone – extreme risk", "Full vaccination panel required", "Trauma kit recommended"], safetyAdvisories: ["Armed conflict", "Kidnapping risk", "No reliable medical facilities"], status: "flagged", createdAt: "2025-01-14", creditUsed: true },
];

const MOCK_ABUSE_FLAGS: AbuseFlag[] = [
  { id: "af-001", userId: "u-007", userName: "Liu Wei", type: "rapid_generation", description: "30 plans generated within 48 hours. Possible automated usage.", severity: "high", resolved: false, timestamp: "2025-01-12T13:00:00Z" },
  { id: "af-002", userId: "u-007", userName: "Liu Wei", type: "spam", description: "Repeated identical destination queries with minor variations.", severity: "medium", resolved: false, timestamp: "2025-01-12T14:00:00Z" },
  { id: "af-003", userId: "u-004", userName: "Sarah Williams", type: "credit_bypass", description: "Attempted to access plan generation endpoint after credits exhausted.", severity: "low", resolved: true, timestamp: "2025-01-10T17:00:00Z" },
];

const MOCK_INVOICES: Invoice[] = [
  { id: "inv-001", companyId: "c-001", companyName: "TechCorp International", amount: 250000, currency: "NGN", status: "paid", description: "Enterprise plan – 500 credits", issuedAt: "2024-01-15", paidAt: "2024-01-16", dueDate: "2024-02-15", paymentMethod: "Paystack" },
  { id: "inv-002", companyId: "c-002", companyName: "GlobalHealth Inc.", amount: 150000, currency: "NGN", status: "paid", description: "Enterprise plan – 300 credits", issuedAt: "2024-02-20", paidAt: "2024-02-21", dueDate: "2024-03-20", paymentMethod: "Bank Transfer" },
  { id: "inv-003", companyId: "c-003", companyName: "Meridian Consulting", amount: 50000, currency: "NGN", status: "overdue", description: "Standard plan – 100 credits", issuedAt: "2024-12-28", dueDate: "2025-01-28" },
  { id: "inv-004", userId: "u-001", userName: "John Okafor", amount: 10000, currency: "NGN", status: "paid", description: "Individual plan – 20 credits", issuedAt: "2024-06-15", paidAt: "2024-06-15", dueDate: "2024-07-15", paymentMethod: "Paystack" },
  { id: "inv-005", userId: "u-009", userName: "James Okonkwo", amount: 10000, currency: "NGN", status: "paid", description: "Individual plan – 20 credits", issuedAt: "2024-11-12", paidAt: "2024-11-12", dueDate: "2024-12-12", paymentMethod: "Paystack" },
  { id: "inv-006", companyId: "c-004", companyName: "Nexus Logistics", amount: 100000, currency: "NGN", status: "paid", description: "Standard plan – 200 credits", issuedAt: "2024-05-01", paidAt: "2024-05-02", dueDate: "2024-06-01", paymentMethod: "Paystack" },
  { id: "inv-007", userId: "u-004", userName: "Sarah Williams", amount: 15000, currency: "NGN", status: "paid", description: "Individual plan – 25 credits", issuedAt: "2024-01-05", paidAt: "2024-01-05", dueDate: "2024-02-05", paymentMethod: "Stripe" },
  { id: "inv-008", companyId: "c-001", companyName: "TechCorp International", amount: 125000, currency: "NGN", status: "pending", description: "Credit top-up – 250 credits", issuedAt: "2025-01-15", dueDate: "2025-02-15" },
];

const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: "adm-001", name: "System Admin", email: "admin@tmag.com", role: "super_admin", status: "active", lastLogin: "2025-01-15T08:00:00Z", createdAt: "2023-01-01", permissions: ["all"] },
  { id: "adm-002", name: "Client Manager", email: "client@tmag.com", role: "client_admin", status: "active", lastLogin: "2025-01-14T09:30:00Z", createdAt: "2024-03-15", permissions: ["users.read", "users.write", "companies.read", "companies.write", "credits.write"] },
  { id: "adm-003", name: "Support Agent", email: "support@tmag.com", role: "support_admin", status: "active", lastLogin: "2025-01-15T10:00:00Z", createdAt: "2024-06-01", permissions: ["users.read", "ai-logs.read", "plans.read", "credits.read"] },
  { id: "adm-004", name: "Backup Admin", email: "backup@tmag.com", role: "super_admin", status: "inactive", lastLogin: "2024-12-01T14:00:00Z", createdAt: "2023-06-15", permissions: ["all"] },
];

const MOCK_ROLES: AdminRole[] = [
  { id: "role-001", name: "Super Admin", description: "Full system access with no restrictions. Can manage all users, companies, credits, settings, and other admins.", permissions: ["all"], userCount: 2 },
  { id: "role-002", name: "Client Admin", description: "Can manage users and companies. Can issue credits and view billing. Cannot access system settings or manage other admins.", permissions: ["users.read", "users.write", "companies.read", "companies.write", "credits.write", "billing.read", "plans.read", "ai-logs.read"], userCount: 1 },
  { id: "role-003", name: "Support Admin", description: "Read-only access to users, AI logs, plans, and credits. Can reset user passwords. Cannot modify company or billing data.", permissions: ["users.read", "ai-logs.read", "plans.read", "credits.read", "users.reset-password"], userCount: 1 },
];

const MOCK_SYSTEM_LOGS: SystemLog[] = [
  { id: "log-001", level: "info", message: "System started successfully", source: "core", timestamp: "2025-01-15T06:00:00Z" },
  { id: "log-002", level: "info", message: "AI model gpt-4o-mini loaded", source: "ai-engine", timestamp: "2025-01-15T06:01:00Z" },
  { id: "log-003", level: "warning", message: "Rate limit threshold reached for user u-007", source: "rate-limiter", timestamp: "2025-01-12T13:30:00Z", details: "User hit 30 requests in 48 hours" },
  { id: "log-004", level: "error", message: "AI request timeout for request ai-005", source: "ai-engine", timestamp: "2025-01-13T11:15:00Z", details: "Request exceeded 10s timeout. Model: gpt-4o-mini. Destination: São Paulo" },
  { id: "log-005", level: "critical", message: "Payment gateway connection failed", source: "billing", timestamp: "2025-01-10T22:00:00Z", details: "Paystack API returned 503. Retry scheduled." },
  { id: "log-006", level: "info", message: "Scheduled credit cleanup completed", source: "scheduler", timestamp: "2025-01-15T00:00:00Z" },
  { id: "log-007", level: "warning", message: "Database connection pool at 80% capacity", source: "database", timestamp: "2025-01-14T15:00:00Z" },
  { id: "log-008", level: "error", message: "AI request timeout for request ai-012", source: "ai-engine", timestamp: "2025-01-15T07:45:00Z", details: "Rate limit exceeded. User: James Okonkwo" },
  { id: "log-009", level: "info", message: "User u-007 suspended by admin", source: "user-management", timestamp: "2025-01-12T14:30:00Z" },
  { id: "log-010", level: "info", message: "Company c-003 billing status changed to overdue", source: "billing", timestamp: "2025-01-29T00:00:00Z" },
  { id: "log-011", level: "warning", message: "High-risk plan generated for conflict zone", source: "ai-engine", timestamp: "2025-01-14T08:00:00Z", details: "Destination: Mogadishu. Risk score: 95. Auto-flagged." },
  { id: "log-012", level: "info", message: "Daily backup completed", source: "backup", timestamp: "2025-01-15T03:00:00Z" },
];

const MOCK_SETTINGS: SystemSettings = {
  defaultIndividualCredits: 20,
  defaultCorporateCredits: 100,
  aiModelVersion: "gpt-4o-mini",
  planGenerationLimit: 5,
  globalDisclaimer: "This service provides AI-generated travel health advisories and does not constitute medical advice. Always consult a licensed healthcare professional before making health decisions related to travel.",
  maintenanceMode: false,
  emailNotifications: true,
  maxEmployeesPerCompany: 100,
};

const MOCK_STATS: DashboardStats = {
  totalUsers: 14,
  totalCompanies: 4,
  totalCreditsIssued: 1320,
  totalCreditsConsumed: 880,
  aiRequestsToday: 28,
  revenueOverview: 710000,
  failedAICalls: 4,
  systemHealthStatus: "healthy",
  activeUsersToday: 9,
  newUsersThisWeek: 3,
};

const MOCK_ANALYTICS: AnalyticsData = {
  topDestinations: [
    { name: "London", count: 145 },
    { name: "Dubai", count: 98 },
    { name: "Lagos", count: 87 },
    { name: "Tokyo", count: 72 },
    { name: "New York", count: 65 },
    { name: "Nairobi", count: 58 },
    { name: "Paris", count: 52 },
    { name: "São Paulo", count: 41 },
    { name: "Bangkok", count: 38 },
    { name: "Singapore", count: 32 },
  ],
  avgCreditsPerUser: 8.5,
  corporateVsIndividual: { corporate: 340, individual: 440 },
  peakUsageTimes: [
    { hour: 8, requests: 45 },
    { hour: 9, requests: 78 },
    { hour: 10, requests: 92 },
    { hour: 11, requests: 85 },
    { hour: 12, requests: 60 },
    { hour: 13, requests: 55 },
    { hour: 14, requests: 88 },
    { hour: 15, requests: 95 },
    { hour: 16, requests: 72 },
    { hour: 17, requests: 40 },
  ],
  monthlyRequests: [
    { month: "Aug", requests: 120, revenue: 48000 },
    { month: "Sep", requests: 185, revenue: 74000 },
    { month: "Oct", requests: 210, revenue: 84000 },
    { month: "Nov", requests: 245, revenue: 98000 },
    { month: "Dec", requests: 198, revenue: 79200 },
    { month: "Jan", requests: 280, revenue: 112000 },
  ],
  dailyActiveUsers: [
    { day: "Mon", users: 42 },
    { day: "Tue", users: 38 },
    { day: "Wed", users: 55 },
    { day: "Thu", users: 48 },
    { day: "Fri", users: 61 },
    { day: "Sat", users: 22 },
    { day: "Sun", users: 15 },
  ],
  creditUsageByType: [
    { type: "Individual", used: 440, remaining: 280 },
    { type: "Corporate", used: 340, remaining: 560 },
  ],
};

/* ─── Store ────────────────────────────────────────────── */

interface AdminDataState {
  users: ManagedUser[];
  companies: Company[];
  creditLedger: CreditLedgerEntry[];
  aiLogs: AIRequestLog[];
  plans: GeneratedPlan[];
  abuseFlags: AbuseFlag[];
  settings: SystemSettings;
  stats: DashboardStats;
  analytics: AnalyticsData;
  invoices: Invoice[];
  adminUsers: AdminUser[];
  roles: AdminRole[];
  systemLogs: SystemLog[];

  // User actions
  suspendUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  resetUserCredits: (userId: string, amount: number) => void;
  updateUser: (userId: string, data: Partial<ManagedUser>) => void;

  // Company actions
  freezeCompany: (companyId: string) => void;
  unfreezeCompany: (companyId: string) => void;
  addCompanyCredits: (companyId: string, amount: number) => void;
  upgradeTier: (companyId: string) => void;
  updateCompany: (companyId: string, data: Partial<Company>) => void;

  // Plan actions
  flagPlan: (planId: string) => void;
  archivePlan: (planId: string) => void;
  deletePlan: (planId: string) => void;

  // Abuse actions
  resolveAbuseFlag: (flagId: string) => void;

  // Settings actions
  updateSettings: (settings: Partial<SystemSettings>) => void;
}

export const useAdminDataStore = create<AdminDataState>()((set) => ({
  users: MOCK_USERS,
  companies: MOCK_COMPANIES,
  creditLedger: MOCK_CREDIT_LEDGER,
  aiLogs: MOCK_AI_LOGS,
  plans: MOCK_PLANS,
  abuseFlags: MOCK_ABUSE_FLAGS,
  settings: MOCK_SETTINGS,
  stats: MOCK_STATS,
  analytics: MOCK_ANALYTICS,
  invoices: MOCK_INVOICES,
  adminUsers: MOCK_ADMIN_USERS,
  roles: MOCK_ROLES,
  systemLogs: MOCK_SYSTEM_LOGS,

  suspendUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u)),
    })),

  reactivateUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, status: "active", riskFlags: [] } : u)),
    })),

  resetUserCredits: (userId, amount) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, creditsRemaining: amount, creditsUsed: 0 } : u)),
    })),

  updateUser: (userId, data) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, ...data } : u)),
    })),

  freezeCompany: (companyId) =>
    set((s) => ({
      companies: s.companies.map((c) => (c.id === companyId ? { ...c, billingStatus: "frozen" } : c)),
    })),

  unfreezeCompany: (companyId) =>
    set((s) => ({
      companies: s.companies.map((c) => (c.id === companyId ? { ...c, billingStatus: "active" } : c)),
    })),

  addCompanyCredits: (companyId, amount) =>
    set((s) => ({
      companies: s.companies.map((c) =>
        c.id === companyId
          ? { ...c, creditsPurchased: c.creditsPurchased + amount, creditsRemaining: c.creditsRemaining + amount }
          : c
      ),
    })),

  upgradeTier: (companyId) =>
    set((s) => ({
      companies: s.companies.map((c) => (c.id === companyId ? { ...c, tier: "enterprise" } : c)),
    })),

  updateCompany: (companyId, data) =>
    set((s) => ({
      companies: s.companies.map((c) => (c.id === companyId ? { ...c, ...data } : c)),
    })),

  flagPlan: (planId) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "flagged" } : p)),
    })),

  archivePlan: (planId) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "archived" } : p)),
    })),

  deletePlan: (planId) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "deleted" } : p)),
    })),

  resolveAbuseFlag: (flagId) =>
    set((s) => ({
      abuseFlags: s.abuseFlags.map((f) => (f.id === flagId ? { ...f, resolved: true } : f)),
    })),

  updateSettings: (newSettings) =>
    set((s) => ({
      settings: { ...s.settings, ...newSettings },
    })),
}));
