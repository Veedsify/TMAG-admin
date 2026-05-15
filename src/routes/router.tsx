import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";

// ---------------------------------------------------------------------------
// Route-level code splitting — each page loads only when first visited.
// AdminLayout is kept eager so the shell renders immediately on auth'd routes.
// LoginPage is kept small and loaded on first paint of /admin.
// ---------------------------------------------------------------------------
const LoginPage               = lazy(() => import("../pages/auth/LoginPage"));
const Dashboard               = lazy(() => import("../pages/dashboard/Dashboard"));
const UsersPage               = lazy(() => import("../pages/users/UsersPage"));
const UserDetailPage          = lazy(() => import("../pages/users/UserDetailPage"));
const CompaniesPage           = lazy(() => import("../pages/companies/CompaniesPage"));
const CompanyDetailPage       = lazy(() => import("../pages/companies/CompanyDetailPage"));
const CreditsPage             = lazy(() => import("../pages/credits/CreditsPage"));
const AILogsPage              = lazy(() => import("../pages/ai-logs/AILogsPage"));
const PlansPage               = lazy(() => import("../pages/plans/PlansPage"));
const EscalatedPlansPage      = lazy(() => import("../pages/plans/EscalatedPlansPage"));
const CreditPlansPage         = lazy(() => import("../pages/credit-plans/CreditPlansPage"));
const AnalyticsPage           = lazy(() => import("../pages/analytics/AnalyticsPage"));
const BillingPage             = lazy(() => import("../pages/billing/BillingPage"));
const RolesPage               = lazy(() => import("../pages/roles/RolesPage"));
const AdminUsersPage          = lazy(() => import("../pages/admin-users/AdminUsersPage"));
const SystemStatusPage        = lazy(() => import("../pages/system/SystemStatusPage"));
const SystemLogsPage          = lazy(() => import("../pages/system/SystemLogsPage"));
const SystemSettingsPage      = lazy(() => import("../pages/system/SystemSettingsPage"));
const AbusePage               = lazy(() => import("../pages/settings/AbusePage"));
const PlanContextsPage        = lazy(() => import("../pages/settings/PlanContextsPage"));
const EbooksPage              = lazy(() => import("../pages/ebooks/EbooksPage"));
const EbookCreatePage         = lazy(() => import("../pages/ebooks/EbookCreatePage"));
const EbookEditPage           = lazy(() => import("../pages/ebooks/EbookEditPage"));
const EbookDetailPage         = lazy(() => import("../pages/ebooks/EbookDetailPage"));
const CompanyOnboardingPage   = lazy(() => import("../pages/company-onboarding/CompanyOnboardingPage"));
const DoctorsPage             = lazy(() => import("../pages/doctors/DoctorsPage"));
const AffiliatesPage          = lazy(() => import("../pages/affiliates/AffiliatesPage"));
const AffiliateDetailPage     = lazy(() => import("../pages/affiliates/AffiliateDetailPage"));

// Minimal fallback — intentionally no spinner library to avoid a chunk dep.
const PageFallback = (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-40" />
  </div>
);

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={PageFallback}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/admin",
    children: [
      /* Login — standalone, no sidebar */
      { index: true, element: <S><LoginPage /></S> },

      /* All authenticated routes share AdminLayout */
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <S><Dashboard /></S> },

          /* Users */
          { path: "users", element: <S><UsersPage /></S> },
          { path: "users/:id", element: <S><UserDetailPage /></S> },
          { path: "users/:id/:tab", element: <S><UserDetailPage /></S> },

          /* Companies */
          { path: "companies", element: <S><CompaniesPage /></S> },
          { path: "companies/:id", element: <S><CompanyDetailPage /></S> },
          { path: "companies/:id/:tab", element: <S><CompanyDetailPage /></S> },

          /* Ledger */
          { path: "ledger", element: <S><CreditsPage /></S> },
          { path: "ledger/:transactionId", element: <S><CreditsPage /></S> },

          /* AI Logs */
          { path: "ai-logs", element: <S><AILogsPage /></S> },
          { path: "ai-logs/failures", element: <S><AILogsPage /></S> },
          { path: "ai-logs/flagged", element: <S><AILogsPage /></S> },
          { path: "ai-logs/high-usage", element: <S><AILogsPage /></S> },
          { path: "ai-logs/:logId", element: <S><AILogsPage /></S> },

          /* Plans */
          { path: "plans", element: <S><PlansPage /></S> },
          { path: "plans/:planId", element: <S><PlansPage /></S> },
          { path: "plans/:planId/archive", element: <S><PlansPage /></S> },
          { path: "plans/:planId/delete", element: <S><PlansPage /></S> },
          { path: "escalated-plans", element: <S><EscalatedPlansPage /></S> },
          { path: "credit-plans", element: <S><CreditPlansPage /></S> },

          /* Analytics */
          { path: "analytics", element: <S><AnalyticsPage /></S> },
          { path: "analytics/usage", element: <S><AnalyticsPage /></S> },
          { path: "analytics/destinations", element: <S><AnalyticsPage /></S> },
          { path: "analytics/credits", element: <S><AnalyticsPage /></S> },
          { path: "analytics/revenue", element: <S><AnalyticsPage /></S> },

          /* System */
          { path: "system/status", element: <S><SystemStatusPage /></S> },
          { path: "system/logs", element: <S><SystemLogsPage /></S> },
          { path: "system/settings", element: <S><SystemSettingsPage /></S> },
          { path: "abuse", element: <S><AbusePage /></S> },
          { path: "plan-contexts", element: <S><PlanContextsPage /></S> },

          /* Billing */
          { path: "billing", element: <S><BillingPage /></S> },
          { path: "billing/:invoiceId", element: <S><BillingPage /></S> },

          /* Access Control */
          { path: "roles", element: <S><RolesPage /></S> },
          { path: "roles/:roleId", element: <S><RolesPage /></S> },
          { path: "admin-users", element: <S><AdminUsersPage /></S> },
          { path: "admin-users/:adminId", element: <S><AdminUsersPage /></S> },

          /* Ebooks */
          { path: "ebooks", element: <S><EbooksPage /></S> },
          { path: "ebooks/create", element: <S><EbookCreatePage /></S> },
          { path: "ebooks/:id", element: <S><EbookDetailPage /></S> },
          { path: "ebooks/:id/edit", element: <S><EbookEditPage /></S> },

          /* Company Onboarding */
          { path: "company-registrations", element: <S><CompanyOnboardingPage /></S> },

          /* Doctors */
          { path: "doctors", element: <S><DoctorsPage /></S> },

          /* Affiliates */
          { path: "affiliates", element: <S><AffiliatesPage /></S> },
          { path: "affiliates/:id", element: <S><AffiliateDetailPage /></S> },

          /* Catch-all */
          {
            path: "*",
            element: (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h1 className="text-4xl font-serif text-heading mb-2">404</h1>
                  <p className="text-muted">Page not found</p>
                </div>
              </div>
            ),
          },
        ],
      },
    ],
  },

  /* Root redirect */
  { path: "/", element: <Navigate to="/admin" replace /> },
  { path: "*", element: <Navigate to="/admin" replace /> },
]);
