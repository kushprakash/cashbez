# Loan Lead System Routes

## React Router Routes

### User Routes (Guest Layout)
```jsx
// Public access routes
<Route path="loan-apply" element={<LoanApply />} />
<Route path="loan-apply/create" element={<LoanLead />} />
<Route path="loan-apply/list" element={<LoanLeadList />} />
```

### Admin Routes (Main Layout - Authenticated)
```jsx
// Admin management routes
<Route path="gromo/admin/loan-leads/dashboard" element={<AdminLoanLeadDashboard />} />
<Route path="gromo/admin/loan-leads/list" element={<AdminLoanLeadList />} />
<Route path="gromo/admin/loan-leads/manage/:leadId" element={<AdminManageLoanLead />} />
<Route path="gromo/admin/loan-leads/commission-report" element={<LoanCommissionReport />} />
```

## API Endpoints

### User Endpoints
```
GET    /api/loan-leads/dashboard           - User dashboard with statistics
GET    /api/loan-leads                     - List user's loan applications
POST   /api/loan-leads                     - Create new loan application
PUT    /api/loan-leads/{id}/status         - Update application status
POST   /api/loan-leads/{id}/release-commission - Release commission
```

### Admin Endpoints
```
GET    /api/admin/loan-leads/dashboard     - Admin dashboard with all statistics
GET    /api/admin/loan-leads               - List all loan applications (filtered by role)
GET    /api/admin/loan-leads/{id}          - Get specific loan application details
PUT    /api/admin/loan-leads/{id}/status   - Update application status with admin notes
PUT    /api/admin/loan-leads/{id}/assign   - Assign application to team member
PUT    /api/admin/loan-leads/{id}/notes    - Update admin notes and status message
PUT    /api/admin/loan-leads/{id}/commission - Set commission amount and status
POST   /api/admin/loan-leads/{id}/release-commission - Release approved commission
GET    /api/admin/loan-leads/commission-report - Commission report with filtering
```

## Route Patterns

### User Route Pattern
- Base path: `/loan-apply`
- Dashboard: `/loan-apply` (main page)
- Create: `/loan-apply/create` 
- List: `/loan-apply/list`

### Admin Route Pattern
- Base path: `/gromo/admin/loan-leads`
- Dashboard: `/gromo/admin/loan-leads/dashboard`
- List: `/gromo/admin/loan-leads/list`
- Manage: `/gromo/admin/loan-leads/manage/:leadId`
- Reports: `/gromo/admin/loan-leads/commission-report`

## Component Imports Required

```jsx
// User Components
import LoanApply from './gromo/LoanApply';
import LoanLead from './gromo/LoanLead';
import LoanLeadList from './gromo/LoanLeadList';

// Admin Components
import AdminLoanLeadDashboard from './gromo/admin/AdminLoanLeadDashboard';
import AdminLoanLeadList from './gromo/admin/AdminLoanLeadList';
import AdminManageLoanLead from './gromo/admin/AdminManageLoanLead';
import LoanCommissionReport from './gromo/admin/LoanCommissionReport';
```

## Navigation Integration

### For Admin Menu
Add these links to your admin navigation:

```jsx
// Admin Loan Lead Management Section
{
  title: "Loan Leads",
  icon: "ti ti-currency-rupee",
  children: [
    {
      title: "Dashboard",
      path: "/gromo/admin/loan-leads/dashboard"
    },
    {
      title: "Manage Leads", 
      path: "/gromo/admin/loan-leads/list"
    },
    {
      title: "Commission Report",
      path: "/gromo/admin/loan-leads/commission-report"
    }
  ]
}
```

### For User Menu
Add these links to your user navigation:

```jsx
// User Loan Application Section
{
  title: "Loan Application",
  icon: "ti ti-currency-rupee", 
  children: [
    {
      title: "Dashboard",
      path: "/loan-apply"
    },
    {
      title: "Apply for Loan",
      path: "/loan-apply/create"
    },
    {
      title: "My Applications", 
      path: "/loan-apply/list"
    }
  ]
}
```

## URL Examples

### User URLs
- `https://yoursite.com/loan-apply` - Main dashboard
- `https://yoursite.com/loan-apply/create` - Apply for loan
- `https://yoursite.com/loan-apply/list` - View applications

### Admin URLs  
- `https://yoursite.com/gromo/admin/loan-leads/dashboard` - Admin dashboard
- `https://yoursite.com/gromo/admin/loan-leads/list` - Manage all leads
- `https://yoursite.com/gromo/admin/loan-leads/manage/123` - Manage specific lead
- `https://yoursite.com/gromo/admin/loan-leads/commission-report` - Commission reports

## Features Available

### User Features
✅ Apply for personal loans  
✅ Apply for business loans  
✅ View application dashboard with statistics  
✅ List all applications with filtering  
✅ Track application status  
✅ View commission status  

### Admin Features  
✅ View comprehensive dashboard  
✅ Manage all loan applications  
✅ Update application status  
✅ Add admin notes and user messages  
✅ Assign leads to team members  
✅ Set and manage commissions  
✅ Release approved commissions  
✅ Generate commission reports  
✅ Export data to CSV  

The loan lead system is now fully integrated and ready for use!