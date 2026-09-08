// Add these routes to your React Router configuration
// Typically in App.jsx or Routes.jsx

import CreditCardDashboard from './gromo/CreditCardDashboard';
import CreateCreditCardLead from './gromo/CreateCreditCardLead';
import CreditCardLeadList from './gromo/CreditCardLeadList';
import AdminCreditCardDashboard from './gromo/admin/AdminCreditCardDashboard';
import AdminManageLead from './gromo/admin/AdminManageLead';
import AdminCreditCardList from './gromo/admin/AdminCreditCardList';
import CommissionReport from './gromo/admin/CommissionReport';

// USER ROUTES - Add to your route configuration
const userRoutes = [
  {
    path: '/gromo/credit-card/dashboard',
    element: <CreditCardDashboard />
  },
  {
    path: '/gromo/credit-card/create',
    element: <CreateCreditCardLead />
  },
  {
    path: '/gromo/credit-card/list',
    element: <CreditCardLeadList />
  },
  {
    path: '/gromo/credit-card/view/:leadId',
    element: <CreditCardLeadList /> // Will open in view mode
  }
];

// ADMIN ROUTES - Add to your route configuration
const adminRoutes = [
  {
    path: '/gromo/admin/credit-card/dashboard',
    element: <AdminCreditCardDashboard />
  },
  {
    path: '/gromo/admin/credit-card/list',
    element: <AdminCreditCardList />
  },
  {
    path: '/gromo/admin/credit-card/manage/:leadId',
    element: <AdminManageLead />
  },
  {
    path: '/gromo/admin/credit-card/commission-report',
    element: <CommissionReport />
  }
];

// Example using React Router v6
/*
<Routes>
  {/* User Routes *\/}
  <Route path="/gromo/credit-card/dashboard" element={<CreditCardDashboard />} />
  <Route path="/gromo/credit-card/create" element={<CreateCreditCardLead />} />
  <Route path="/gromo/credit-card/list" element={<CreditCardLeadList />} />
  <Route path="/gromo/credit-card/view/:leadId" element={<CreditCardLeadList />} />
  
  {/* Admin Routes *\/}
  <Route path="/gromo/admin/credit-card/dashboard" element={<AdminCreditCardDashboard />} />
  <Route path="/gromo/admin/credit-card/list" element={<AdminCreditCardList />} />
  <Route path="/gromo/admin/credit-card/manage/:leadId" element={<AdminManageLead />} />
  <Route path="/gromo/admin/credit-card/commission-report" element={<CommissionReport />} />
</Routes>
*/

// CreditCard.jsx Usage Examples:

// WITH Header and Footer (Default)
/*
import CreditCard from './gromo/CreditCard';

<CreditCard states={true}>
  <YourComponent />
</CreditCard>
*/

// WITHOUT Header and Footer
/*
import CreditCard from './gromo/CreditCard';

<CreditCard states={false}>
  <YourComponent />
</CreditCard>
*/

export { userRoutes, adminRoutes };
