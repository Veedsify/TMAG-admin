import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import UsersPage from "../pages/users/UsersPage";
import UserDetailPage from "../pages/users/UserDetailPage";
import CompaniesPage from "../pages/companies/CompaniesPage";
import CompanyDetailPage from "../pages/companies/CompanyDetailPage";
import CreditsPage from "../pages/credits/CreditsPage";
import AILogsPage from "../pages/ai-logs/AILogsPage";
import PlansPage from "../pages/plans/PlansPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import BillingPage from "../pages/billing/BillingPage";
import RolesPage from "../pages/roles/RolesPage";
import AdminUsersPage from "../pages/admin-users/AdminUsersPage";
import SystemStatusPage from "../pages/system/SystemStatusPage";
import SystemLogsPage from "../pages/system/SystemLogsPage";
import SystemSettingsPage from "../pages/system/SystemSettingsPage";
import AbusePage from "../pages/settings/AbusePage";
import PlanContextsPage from "../pages/settings/PlanContextsPage";
import EbooksPage from "../pages/ebooks/EbooksPage";
import EbookCreatePage from "../pages/ebooks/EbookCreatePage";
import EbookEditPage from "../pages/ebooks/EbookEditPage";
import EbookDetailPage from "../pages/ebooks/EbookDetailPage";
import CompanyOnboardingPage from "../pages/company-onboarding/CompanyOnboardingPage";
import DoctorsPage from "../pages/doctors/DoctorsPage";
import EscalatedPlansPage from "../pages/plans/EscalatedPlansPage";
import CreditPlansPage from "../pages/credit-plans/CreditPlansPage";
import AffiliatesPage from "../pages/affiliates/AffiliatesPage";
import AffiliateDetailPage from "../pages/affiliates/AffiliateDetailPage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    children: [
      /* Login — standalone, no sidebar */
      { index: true, element: <LoginPage /> },

      /* All authenticated routes share AdminLayout */
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },

          /* Users */
          { path: "users", element: <UsersPage /> },
          { path: "users/:id", element: <UserDetailPage /> },
          { path: "users/:id/:tab", element: <UserDetailPage /> },

          /* Companies */
          { path: "companies", element: <CompaniesPage /> },
          { path: "companies/:id", element: <CompanyDetailPage /> },
          { path: "companies/:id/:tab", element: <CompanyDetailPage /> },

          /* Ledger */
          { path: "ledger", element: <CreditsPage /> },
          { path: "ledger/:transactionId", element: <CreditsPage /> },

          /* AI Logs */
          { path: "ai-logs", element: <AILogsPage /> },
          { path: "ai-logs/failures", element: <AILogsPage /> },
          { path: "ai-logs/flagged", element: <AILogsPage /> },
          { path: "ai-logs/high-usage", element: <AILogsPage /> },
          { path: "ai-logs/:logId", element: <AILogsPage /> },

           /* Plans */
           { path: "plans", element: <PlansPage /> },
           { path: "plans/:planId", element: <PlansPage /> },
           { path: "plans/:planId/archive", element: <PlansPage /> },
           { path: "plans/:planId/delete", element: <PlansPage /> },
           { path: "escalated-plans", element: <EscalatedPlansPage /> },
           { path: "credit-plans", element: <CreditPlansPage /> },

          /* Analytics */
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "analytics/usage", element: <AnalyticsPage /> },
          { path: "analytics/destinations", element: <AnalyticsPage /> },
          { path: "analytics/credits", element: <AnalyticsPage /> },
          { path: "analytics/revenue", element: <AnalyticsPage /> },

          /* System */
          { path: "system/status", element: <SystemStatusPage /> },
          { path: "system/logs", element: <SystemLogsPage /> },
          { path: "system/settings", element: <SystemSettingsPage /> },
          { path: "abuse", element: <AbusePage /> },
          { path: "plan-contexts", element: <PlanContextsPage /> },

          /* Billing */
          { path: "billing", element: <BillingPage /> },
          { path: "billing/:invoiceId", element: <BillingPage /> },

          /* Access Control */
          { path: "roles", element: <RolesPage /> },
          { path: "roles/:roleId", element: <RolesPage /> },
          { path: "admin-users", element: <AdminUsersPage /> },
          { path: "admin-users/:adminId", element: <AdminUsersPage /> },

          /* Ebooks */
          { path: "ebooks", element: <EbooksPage /> },
          { path: "ebooks/create", element: <EbookCreatePage /> },
          { path: "ebooks/:id", element: <EbookDetailPage /> },
          { path: "ebooks/:id/edit", element: <EbookEditPage /> },

          /* Company Onboarding */
          { path: "company-registrations", element: <CompanyOnboardingPage /> },

          /* Doctors */
          { path: "doctors", element: <DoctorsPage /> },

          /* Affiliates */
          { path: "affiliates", element: <AffiliatesPage /> },
          { path: "affiliates/:id", element: <AffiliateDetailPage /> },

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
