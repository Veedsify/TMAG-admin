# Admin API & Hooks Usage Guide

All endpoints are prefixed with `/admin` and organized by feature area.

## 📁 Component → Hook Mapping

### 🔐 Auth
**Components:** `LoginPage`, `AdminLayout`
```tsx
import { useLogin, useLogout, useCurrentUser } from '@/api';

// Login
const { mutate: login } = useLogin();
login({ email, password });

// Logout
const { mutate: logout } = useLogout();

// Get current admin user
const { data: currentUser } = useCurrentUser();
```

---

### 📊 Dashboard
**Component:** `Dashboard`
```tsx
import { useDashboardStats } from '@/api';

const { data: stats } = useDashboardStats();
// Returns: totalUsers, totalCompanies, totalCreditsIssued, aiRequestsToday, etc.
```

---

### 👥 Users Management
**Components:** `UsersPage`, `UserDetailPage`
```tsx
import { 
  useUsers, 
  useUser, 
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser, 
  useActivateUser,
  useResetUserCredits,
  useResetUserPassword
} from '@/api';

// List all users
const { data: users } = useUsers();

// Get single user
const { data: user } = useUser(userId);

// Create user
const { mutate: createUser } = useCreateUser();
createUser({ name: "John Doe", email: "john@example.com" });

// Update user
const { mutate: updateUser } = useUpdateUser();
updateUser({ id: userId, data: { name: "New Name" } });

// Delete user
const { mutate: deleteUser } = useDeleteUser();
deleteUser(userId);

// Suspend/Activate
const { mutate: suspend } = useSuspendUser();
const { mutate: activate } = useActivateUser();
suspend(userId);
activate(userId);

// Reset credits
const { mutate: resetCredits } = useResetUserCredits();
resetCredits({ id: userId, amount: 20 });

// Reset password
const { mutate: resetPassword } = useResetUserPassword();
resetPassword(userId);
```

---

### 🏢 Companies Management
**Components:** `CompaniesPage`, `CompanyDetailPage`
```tsx
import { 
  useCompanies, 
  useCompany, 
  useCompanyEmployees,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useFreezeCompany,
  useUnfreezeCompany,
  useAddCompanyCredits,
  useUpgradeTier
} from '@/api';

// List all companies
const { data: companies } = useCompanies();

// Get single company
const { data: company } = useCompany(companyId);

// Get company employees
const { data: employees } = useCompanyEmployees(companyId);

// Create company
const { mutate: createCompany } = useCreateCompany();
createCompany({ name: "Acme Corp", industry: "Technology" });

// Update company
const { mutate: updateCompany } = useUpdateCompany();
updateCompany({ id: companyId, data: { name: "New Name" } });

// Delete company
const { mutate: deleteCompany } = useDeleteCompany();
deleteCompany(companyId);

// Freeze/Unfreeze
const { mutate: freeze } = useFreezeCompany();
const { mutate: unfreeze } = useUnfreezeCompany();
freeze(companyId);
unfreeze(companyId);

// Add credits
const { mutate: addCredits } = useAddCompanyCredits();
addCredits({ id: companyId, amount: 50 });

// Upgrade tier
const { mutate: upgrade } = useUpgradeTier();
upgrade(companyId);
```

---

### 💳 Credit Ledger
**Components:** `CreditsPage`, `UserDetailPage`, `CompanyDetailPage`
```tsx
import { useCreditLedger, useAdjustCredits } from '@/api';

// Get ledger entries (all, by user, or by company)
const { data: ledger } = useCreditLedger();
const { data: userLedger } = useCreditLedger({ userId });
const { data: companyLedger } = useCreditLedger({ companyId });

// Adjust credits
const { mutate: adjustCredits } = useAdjustCredits();
adjustCredits({
  userId: "user-123",
  amount: 50,
  reason: "Promotional credits"
});
```

---

### 💰 Billing
**Component:** `BillingPage`
```tsx
import { 
  useInvoices, 
  useInvoice, 
  useCreateInvoice,
  useUpdateInvoice,
  useMarkInvoicePaid 
} from '@/api';

// List all invoices
const { data: invoices } = useInvoices();

// Get single invoice
const { data: invoice } = useInvoice(invoiceId);

// Create invoice
const { mutate: createInvoice } = useCreateInvoice();
createInvoice({
  companyId: "123",
  amount: 5000,
  description: "Monthly subscription"
});

// Update invoice
const { mutate: updateInvoice } = useUpdateInvoice();
updateInvoice({ id: invoiceId, data: { amount: 6000 } });

// Mark invoice as paid
const { mutate: markPaid } = useMarkInvoicePaid();
markPaid(invoiceId);
```

---

### 🤖 AI Logs
**Component:** `AILogsPage`
```tsx
import { useAILogs, useAILog, useFlagAILog } from '@/api';

// Get all AI logs (with optional filters)
const { data: logs } = useAILogs();
const { data: failedLogs } = useAILogs({ status: "error" });
const { data: userLogs } = useAILogs({ userId });

// Get single log
const { data: log } = useAILog(logId);

// Flag a log
const { mutate: flagLog } = useFlagAILog();
flagLog(logId);
```

---

### 📋 Generated Plans
**Components:** `PlansPage`, `UserDetailPage`, `CompanyDetailPage`
```tsx
import { 
  useGeneratedPlans, 
  useGeneratedPlan,
  useDeletePlan,
  useArchivePlan,
  useFlagPlan 
} from '@/api';

// Get all plans (with optional filters)
const { data: plans } = useGeneratedPlans();
const { data: userPlans } = useGeneratedPlans({ userId });
const { data: companyPlans } = useGeneratedPlans({ companyId });

// Get single plan
const { data: plan } = useGeneratedPlan(planId);

// Plan actions
const { mutate: deletePlan } = useDeletePlan();
const { mutate: archivePlan } = useArchivePlan();
const { mutate: flagPlan } = useFlagPlan();
```

---

### 📈 Analytics
**Component:** `AnalyticsPage`
```tsx
import { useAnalytics } from '@/api';

const { data: analytics } = useAnalytics();
// Returns: topDestinations, avgCreditsPerUser, corporateVsIndividual,
//          peakUsageTimes, monthlyRequests, dailyActiveUsers, creditUsageByType
```

---

### 🖥️ System Status
**Component:** `SystemStatusPage`
```tsx
import { useSystemStatus } from '@/api';

const { data: status } = useSystemStatus();
// Auto-refetches every 30 seconds
// Returns: status, uptime, services[], lastChecked
```

---

### 📝 System Logs
**Component:** `SystemLogsPage`
```tsx
import { useSystemLogs } from '@/api';

// Get all logs
const { data: logs } = useSystemLogs();

// Filter by level
const { data: errorLogs } = useSystemLogs({ level: "error" });

// Limit results
const { data: recentLogs } = useSystemLogs({ limit: 100 });
```

---

### ⚙️ System Settings
**Components:** `SystemSettingsPage`, `SettingsPage`, `SystemStatusPage`
```tsx
import { 
  useSystemSettings, 
  useUpdateSystemSettings,
  useToggleMaintenanceMode
} from '@/api';

// Get settings
const { data: settings } = useSystemSettings();

// Update settings
const { mutate: updateSettings } = useUpdateSystemSettings();
updateSettings({
  defaultIndividualCredits: 10,
  maintenanceMode: false
});

// Toggle maintenance mode
const { mutate: toggleMaintenance } = useToggleMaintenanceMode();
toggleMaintenance();
```

---

### 🛡️ Roles & Permissions
**Component:** `RolesPage`
```tsx
import { 
  useRoles, 
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole 
} from '@/api';

// List all roles
const { data: roles } = useRoles();

// Get single role
const { data: role } = useRole(roleId);

// CRUD operations
const { mutate: createRole } = useCreateRole();
const { mutate: updateRole } = useUpdateRole();
const { mutate: deleteRole } = useDeleteRole();
```

---

### 👨‍💼 Admin Users
**Component:** `AdminUsersPage`
```tsx
import { 
  useAdminUsers, 
  useAdminUser,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser 
} from '@/api';

// List all admin users
const { data: adminUsers } = useAdminUsers();

// Get single admin user
const { data: adminUser } = useAdminUser(adminId);

// CRUD operations
const { mutate: createAdmin } = useCreateAdminUser();
const { mutate: updateAdmin } = useUpdateAdminUser();
const { mutate: deleteAdmin } = useDeleteAdminUser();
```

---

### 🚨 Abuse Flags
**Component:** `AbusePage`
```tsx
import { useAbuseFlags, useResolveAbuseFlag } from '@/api';

// Get all flags
const { data: flags } = useAbuseFlags();

// Filter by resolved status
const { data: unresolvedFlags } = useAbuseFlags({ resolved: false });

// Resolve a flag
const { mutate: resolveFlag } = useResolveAbuseFlag();
resolveFlag(flagId);
```

---

## 🔗 API Endpoints Reference

All endpoints are prefixed with `/admin`:

### Auth
- `POST /admin/auth/login`
- `POST /admin/auth/logout`
- `GET /admin/auth/me`

### Dashboard
- `GET /admin/dashboard/stats`

### Users
- `GET /admin/users`
- `GET /admin/users/:id`
- `POST /admin/users`
- `PUT /admin/users/:id`
- `DELETE /admin/users/:id`
- `POST /admin/users/:id/suspend`
- `POST /admin/users/:id/activate`
- `POST /admin/users/:id/reset-credits` (body: `{ amount: number }`)
- `POST /admin/users/:id/reset-password`

### Companies
- `GET /admin/companies`
- `GET /admin/companies/:id`
- `POST /admin/companies`
- `PUT /admin/companies/:id`
- `DELETE /admin/companies/:id`
- `GET /admin/companies/:id/employees`
- `POST /admin/companies/:id/freeze`
- `POST /admin/companies/:id/unfreeze`
- `POST /admin/companies/:id/add-credits` (body: `{ amount: number }`)
- `POST /admin/companies/:id/upgrade-tier`

### Credit Ledger
- `GET /admin/ledger?userId=&companyId=`
- `POST /admin/ledger/adjust`

### Billing
- `GET /admin/billing/invoices`
- `GET /admin/billing/invoices/:id`
- `POST /admin/billing/invoices`
- `PUT /admin/billing/invoices/:id`
- `POST /admin/billing/invoices/:id/paid`

### AI Logs
- `GET /admin/ai-logs?userId=&status=`
- `GET /admin/ai-logs/:id`
- `POST /admin/ai-logs/:id/flag`

### Plans
- `GET /admin/plans?userId=&companyId=`
- `GET /admin/plans/:id`
- `DELETE /admin/plans/:id`
- `POST /admin/plans/:id/archive`
- `POST /admin/plans/:id/flag`

### Analytics
- `GET /admin/analytics`

### System
- `GET /admin/system/status`
- `GET /admin/system/logs?level=&limit=`
- `GET /admin/system/settings`
- `PUT /admin/system/settings`
- `POST /admin/system/settings/toggle-maintenance`

### Roles
- `GET /admin/roles`
- `GET /admin/roles/:id`
- `POST /admin/roles`
- `PUT /admin/roles/:id`
- `DELETE /admin/roles/:id`

### Admin Users
- `GET /admin/admin-users`
- `GET /admin/admin-users/:id`
- `POST /admin/admin-users`
- `PUT /admin/admin-users/:id`
- `DELETE /admin/admin-users/:id`

### Abuse
- `GET /admin/abuse?resolved=`
- `POST /admin/abuse/:id/resolve`

# Additional API Endpoints - Scan Results

## 🔍 Found Additional Action Endpoints

After scanning all admin pages, these additional action endpoints were identified and added:

### 👤 User Actions
**Used in:** `UsersPage`, `UserDetailPage`, `AbusePage`

1. **Reset User Credits**
   - `POST /admin/users/:id/reset-credits`
   - Body: `{ amount: number }`
   - Hook: `useResetUserCredits()`
   - Invalidates: users, creditLedger

2. **Reset User Password**
   - `POST /admin/users/:id/reset-password`
   - Hook: `useResetUserPassword()`
   - Sends password reset email/link

### 🏢 Company Actions
**Used in:** `CompanyDetailPage`

1. **Freeze Company**
   - `POST /admin/companies/:id/freeze`
   - Hook: `useFreezeCompany()`
   - Sets billingStatus to "frozen"

2. **Unfreeze Company**
   - `POST /admin/companies/:id/unfreeze`
   - Hook: `useUnfreezeCompany()`
   - Restores billingStatus to "active"

3. **Add Company Credits**
   - `POST /admin/companies/:id/add-credits`
   - Body: `{ amount: number }`
   - Hook: `useAddCompanyCredits()`
   - Invalidates: companies, creditLedger

4. **Upgrade Tier**
   - `POST /admin/companies/:id/upgrade-tier`
   - Hook: `useUpgradeTier()`
   - Upgrades from "standard" to "enterprise"

### ⚙️ System Actions
**Used in:** `SystemStatusPage`

1. **Toggle Maintenance Mode**
   - `POST /admin/system/settings/toggle-maintenance`
   - Hook: `useToggleMaintenanceMode()`
   - Invalidates: systemSettings, systemStatus
   - Toggles maintenanceMode on/off

## 📊 Summary

**Total Additional Endpoints:** 8

- User actions: 2
- Company actions: 4
- System actions: 1
- Already covered: 1 (suspend/activate users)

All hooks include proper cache invalidation to keep the UI in sync.

## 🎯 Usage Examples

### User Actions
```tsx
// Reset credits
const { mutate: resetCredits } = useResetUserCredits();
resetCredits({ id: "user-123", amount: 20 });

// Reset password
const { mutate: resetPassword } = useResetUserPassword();
resetPassword("user-123");
```

### Company Actions
```tsx
// Freeze/Unfreeze
const { mutate: freeze } = useFreezeCompany();
const { mutate: unfreeze } = useUnfreezeCompany();
freeze("company-123");
unfreeze("company-123");

// Add credits
const { mutate: addCredits } = useAddCompanyCredits();
addCredits({ id: "company-123", amount: 50 });

// Upgrade tier
const { mutate: upgrade } = useUpgradeTier();
upgrade("company-123");
```

### System Actions
```tsx
// Toggle maintenance mode
const { mutate: toggleMaintenance } = useToggleMaintenanceMode();
toggleMaintenance();
```
