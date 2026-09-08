import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ApiDocsPage from './documentation';
import MainLayout from './layouts/MainLayout';
import GuestLayout from './layouts/GuestLayout';

import Dashboard from './layouts/Dashboard';
import Signup from './pages/Signup';
import DigiLockerCallback from './pages/DigiLockerCallback';
import AppDownload from './pages/AppDownload';
import ContactPage from './pages/ContactPage';

// Role
import AddRole from './pages/role/add';
import EditRole from './pages/role/edit';
import ListRole from './pages/role/list';

// Online Service
import DownloadTnc from './online_service/download/DownloadTnc';
// Module
import AddModule from './pages/module/add';
import EditModule from './pages/module/edit';
import ListModule from './pages/module/list';
// Main Module
import AddMainModule from './pages/main_module/add';
import EditMainModule from './pages/main_module/edit';
import ListMainModule from './pages/main_module/list';
// Permission
import AddPermission from './pages/permission/add';
import EditPermission from './pages/permission/edit';
import ListPermission from './pages/permission/list';
// Role Permission
import AddRolePermission from './pages/role_permission/add';
import EditRolePermission from './pages/role_permission/edit';
import ListRolePermission from './pages/role_permission/list';
// User Role Permission
import AddUserRolePermission from './pages/user_role_permission/add';
// User Role Commission
import AddUserRoleCommission from './pages/user_role_commission/add';
// Sub Module
import AddSubModule from './pages/sub_module/add';
import EditSubModule from './pages/sub_module/edit';
import ListSubModule from './pages/sub_module/list';
// Commission
import CommissionList from './pages/commission/list';
import CommissionCreate from './pages/commission/create';
import CommissionEdit from './pages/commission/edit';
// Role Commission
import AddRoleCommission from './pages/role_commission/add';
import EditRoleCommission from './pages/role_commission/edit';
import ListRoleCommission from './pages/role_commission/list';
// Users
import AddUser from './pages/users/add';
import EditUser from './pages/users/edit';
import ListUser from './pages/users/list';
import KycForm from './pages/users/kyc';
import ManualKycVerify from './pages/users/ManualKycVerify';
// HRMS - Department Management
import AddDepartment from './hrms/department/add';
import EditDepartment from './hrms/department/edit';
import ListDepartment from './hrms/department/list';
// HRMS - Designation Management
import AddDesignation from './hrms/designation/add';
import EditDesignation from './hrms/designation/edit';
import ListDesignation from './hrms/designation/list';
// HRMS - Employee Management
import AddEmployee from './hrms/employee/add';
import EditEmployee from './hrms/employee/edit';
import ListEmployee from './hrms/employee/list';
import EmployeeKycView from './hrms/employee/KycView';
// HRMS - Attendance Management
import AddAttendance from './hrms/attendance/add';
import EditAttendance from './hrms/attendance/edit';
import ListAttendance from './hrms/attendance/list';
// HRMS - Leave Management
import AddLeave from './hrms/leave/add';
import EditLeave from './hrms/leave/edit';
import ListLeave from './hrms/leave/list';

// HRMS - payroll Management
import PayrollSetup from './hrms/payroll/setup';
import EmployeePayrollList from './hrms/payroll/employee';
import ReleaseSalary from './hrms/payroll/release';
import PayslipDownload from './hrms/payroll/payslip';
import PayList from './hrms/payroll/payList';
import PayrollList from './hrms/payroll/list';
import PayrollEdit from './hrms/payroll/edit';

// CRM - Lead Management
// import CRMDashboard from './crm/dashboard';
import LeadList from './crm/leads/list';
import AddLead from './crm/leads/add';
import EditLead from './crm/leads/edit';
// CRM - Lead Types
import LeadTypeList from './crm/lead-types/list';
import AddLeadType from './crm/lead-types/add';
import EditLeadType from './crm/lead-types/edit';
// CRM - Lead Sources
import LeadSourceList from './crm/lead-sources/list';
import AddLeadSource from './crm/lead-sources/add';
import EditLeadSource from './crm/lead-sources/edit';
// CRM - Lead Status
import LeadStatusList from './crm/lead-status/list';
import AddLeadStatus from './crm/lead-status/add';
import EditLeadStatus from './crm/lead-status/edit';
// CRM - Followups
import FollowupList from './crm/followups/list';
import AddFollowup from './crm/followups/add';
import EditFollowup from './crm/followups/edit';
// CRM - Activities
import ActivityList from './crm/activities/list';
import AddActivity from './crm/activities/add';
import EditActivity from './crm/activities/edit';
// CRM - Followup Types
import FollowupTypeList from './crm/followup-types/list';
import AddFollowupType from './crm/followup-types/add';
import EditFollowupType from './crm/followup-types/edit';
import ViewFollowupType from './crm/followup-types/view';
// CRM - Followup Statuses
import FollowupStatusList from './crm/followup-statuses/list';
import AddFollowupStatus from './crm/followup-statuses/add';
import EditFollowupStatus from './crm/followup-statuses/edit';
import ViewFollowupStatus from './crm/followup-statuses/view';
// CRM - Emails
import {
    EmailDashboard,
    EmailCompose,
    EmailView,
    Sent
} from './crm/emails';

// Subscription
import Subscription from './pages/subscription';
// Subscription Master
import SubscriptionMasterList from './pages/subscription_master/list';
import SubscriptionMasterAdd from './pages/subscription_master/add';
import SubscriptionMasterEdit from './pages/subscription_master/edit';
// Role Subscription
import AddRoleSubscription from './pages/role_subscription/add';
import AepsRegister from './pages/aeps/register';
import AepsHome from './pages/aeps/home';
import AepsReceipt from './pages/aeps/TransactionReceipt';
import AepsHistory from './pages/aeps/AepsHistory';
import VideoKycDashboard from './pages/aeps/video-kyc/VideoKycDashboard';
import PendingList from './pages/aeps/video-kyc/PendingList';
import VerifiedList from './pages/aeps/video-kyc/VerifiedList';
import OldList from './pages/aeps/video-kyc/OldList';
import VideoKycDetailsPage from './pages/aeps/video-kyc/VideoKycDetailsPage';
// Setting
import SettingIndex from './pages/setting/index';
import UserProfile from './pages/profile/index';
// Banking
import MobileRecharge from './banking/mobilerecharge';
import MobileRechargeReport from './banking/mobilerecharge-report';
import DTHRecharge from './banking/dth-recharge';
import DTHReport from './banking/dth-report';
import BillPayment from './banking/bill-payment';
import BillPaymentReport from './banking/bill-payment-report';
import BillSearchTransaction from './banking/bill-search-transaction';
import BillPaymentInvoice from './banking/BillPaymentInvoice';
import ListAccounts from './banking/accounts';
import AccountsList from './banking/accounts-list';
import ViewAccount from './banking/view-account';
import AccountTransaction from './banking/transaction';
import MerchantList from './banking/reports/merchant';
import RechargeOperatorReport from './banking/recharge_operator/RechargeOperatorReport';
import RechargeOperatorForm from './banking/recharge_operator/RechargeOperatorForm';
import BbpsCategoryManager from './banking/bbps_category/BbpsCategoryManager';
import UtilityCircleManager from './banking/utility_circle/UtilityCircleManager';
import ApiSettingForm from './banking/api_master/ApiSettingForm';
import ApiSettingReport from './banking/api_master/ApiSettingReport';
import ApiPendingSetting from './banking/api_master/ApiPendingSetting';
import ApiServiceSetting from './banking/api_master/ApiServiceSetting';

// Commission Master
import CommissionPackages from './banking/commission_master/CommissionPackages';
import CommissionAssignments from './banking/commission_master/CommissionAssignments';
import SpecialOfferCommissions from './banking/commission_master/SpecialOfferCommissions';
import OperatorMapping from './banking/api_master/OperatorMapping';

import CashDeposit from './banking/cashDeposit/CashDeposit';
import CashDepositHistory from './banking/cashDeposit/CashDepositHistory';
import CashDepositRegister from './banking/cashDeposit/CashDepositRegister';
import CashDepositEkyc from './banking/cashDeposit/CashDepositEkyc';
import CashDepositBiometricKyc from './banking/cashDeposit/CashDepositBiometricKyc';
import CashDepositTwoFactorAuth from './banking/cashDeposit/CashDepositTwoFactorAuth';

import MAtmWithdrawal from './banking/matm';
import MAtmHistory from './banking/matm/history';
import MAtmReceipt from './banking/matm/matmReceipt';
import AddFundRequest from './banking/addFundRequest';
import AddFundHistory from './banking/addFundRequest/history';
import AddFundReceipt from './banking/addFundRequest/AddFundReceipt';
import ReferralList from './banking/ReferralList';
import CommissionReportPage from './banking/CommissionReportPage';
import MyCommissionStructure from './banking/MyCommissionStructure';
import IdCard from './banking/IdCard';
import ShopBanner from './banking/ShopBanner';
import Certificate from './banking/Certificate';

import CMS from './banking/cms';

import InsuranceApply from './gromo/InsuranceApply';

import LoanApply from './gromo/LoanApply';
import CreateLoanLead from './gromo/LoanLead';
import LoanLeadList from './gromo/LoanLeadList';

import CreditCard from './gromo/CreditCard';
import CreateCreditCardLead from './gromo/CreateCreditCardLead';
import CreditCardLeadList from './gromo/CreditCardLeadList';

// Admin - Loan Lead Management
import AdminLoanLeadDashboard from './gromo/admin/AdminLoanLeadDashboard';
import AdminLoanLeadList from './gromo/admin/AdminLoanLeadList';
import AdminManageLoanLead from './gromo/admin/AdminManageLoanLead';
import LoanCommissionReport from './gromo/admin/LoanCommissionReport';

// Admin - Credit Card Lead Management
import AdminCreditCardLeadDashboard from './gromo/admin/AdminCreditCardDashboard';
import AdminCreditCardLeadList from './gromo/admin/AdminCreditCardList';
import AdminManageCreditCardLead from './gromo/admin/AdminManageLead';
import CreditCardCommissionReport from './gromo/admin/CommissionReport';


// Beneficiary Management
import { BeneficiaryList, AddBeneficiary, ViewBeneficiary, PayoutHistory } from './banking/beneficiary';
// SMS
import MoveTo from './banking/beneficiary/MoveTo';
import AddMoveToAccount from './banking/beneficiary/AddMoveToAccount';

import Reports from './banking/reports/Reports';
import ListMessages from './sms/list';
import AddMessage from './sms/add';
import EditMessage from './sms/edit';
import Testing from './tests/Testing';

import ComplaintsList from './support/complaint/ComplaintsList';
import CreateComplaint from './support/complaint/CreateComplaint';
import ViewComplaint from './support/complaint/ViewComplaint';
import WorkloadReport from './support/complaint/WorkloadReport';
import AdminBbpsComplaints from './banking/AdminBbpsComplaints';
import HelpDeskChat from './support/chat/HelpDeskChat';
import ChatThreadsList from './support/chat/ChatThreadsList';
import ComplaintDashboard from './support/chat/chat_analytics';
import Support from './support/chat/Support';

import Gst from './online_service/gst/index';
import CreateGst from './online_service/gst/create';
import GstList from './online_service/gst/list';
import GstAdminDashboard from './online_service/gst/admin_dashboard';
import GstDashboard from './online_service/gst/dashboard';

import CreateIncomeTax from './online_service/income_tax/create';
import IncomeTaxDashboard from './online_service/income_tax/dashboard';
import IncomeTaxList from './online_service/income_tax/list';
import IncomeTaxAdminDashboard from './online_service/income_tax/admin_dashboard';

import SavingAccountDashboard from './online_service/saving_account/dashboard';
import CreateSavingAccount from './online_service/saving_account/create';
import SavingAccountList from './online_service/saving_account/list';
import SavingAccountAdminDashboard from './online_service/saving_account/admin_dashboard';
import NotificationCompose from './notifications/NotificationCompose';
import NotificationDashboard from './notifications/NotificationDashboard';
import NotificationList from './notifications/NotificationList';
import NotificationView from './notifications/NotificationView';

// Popup Management
import PopupList from './pages/popup/PopupList';
import PopupForm from './pages/popup/PopupForm';
import Summary from './banking/reports/Summary';
import DsaService from './indiasalesdsa/DsaService';

// DSA Admin Management
import { CategoryList, CategoryForm, ItemList, ItemForm, UserList } from './indiasalesdsa/admin';
// DSA User Dashboard
import DsaServices from './indiasalesdsa/user/index';
import DsaDashboard from './indiasalesdsa/user/dashboard';
import DsaApply from './indiasalesdsa/user/apply';
import DsaList from './indiasalesdsa/user/list';
import DsaSuccess from './indiasalesdsa/user/success';
import { BannerList, BannerForm } from './pages/banner';
import MsmeAdminDashboard from './online_service/msme/admin_dashboard';
import MsmeDashboard from './online_service/msme';
import MsmeList from './online_service/msme/list';
import CreateMsme from './online_service/msme/create';
import ApiMerchantList from './banking/reports/ApiMerchantList';
import CardDownload from './online_service/download/CardDownload';
import CardDownloadView from './online_service/download/CardDownloadView';
import CardDownloads from './online_service/download/CardDownloads';
import TDSDoc from './banking/reports/tdsDoc';
import ManageUserReport from './admin/ManageUserReport';

// PAN Card Service
import PsaAgentRegistration from './online_service/pancard/PsaAgentRegistration';
import PanAddFund from './online_service/pancard/PanAddFund';
import AdminAgentList from './online_service/pancard/AdminAgentList';
import AdminFundRequests from './online_service/pancard/AdminFundRequests';
import PanApplicationReport from './online_service/pancard/PanApplicationReport';

// Guest Payment Gateway
import GuestPaymentGateway from './pages/pg/GuestPaymentGateway';





const AppRoutes = () => (


    <Routes>

        <Route element={<GuestLayout />}>
            <Route path="/" element={<Signup />} />
            <Route path="signin" element={<Signup />} />
            <Route path="signup" element={<Signup />} />
            <Route path="referral/:referralid" element={<Signup />} />
            <Route path="mobile-mode" element={<Signup />} />
            <Route path="api-docs" element={<ApiDocsPage />} />

            {/* Guest Payment Gateway Routes (No Header / Footer) */}
            <Route path="pg/checkout/:accessKey" element={<GuestPaymentGateway />} />
            <Route path="pg/checkout" element={<GuestPaymentGateway />} />
            <Route path="payment-checkout/:accessKey" element={<GuestPaymentGateway />} />
            <Route path="payment-checkout" element={<GuestPaymentGateway />} />

            <Route path="credit-card" element={<CreditCard />} />
            <Route path="credit-card/create" element={<CreateCreditCardLead />} />
            <Route path="credit-card/list" element={<CreditCardLeadList />} />
            <Route path="loan-apply" element={<LoanApply />} />
            <Route path="loan-apply/create" element={<CreateLoanLead />} />
            <Route path="loan-apply/list" element={<LoanLeadList />} />
            <Route path="insurance-apply" element={<InsuranceApply />} />
            <Route path="user/:id" element={<IdCard />} />
            <Route path="user/:id" element={<ShopBanner />} />
            <Route path="certificate/:id" element={<Certificate />} />
            <Route path="addFundReceipt" element={<AddFundReceipt />} />

            {/* Route For DSA India Sales */}
            <Route path="dsa" element={<DsaService />} />

            {/* App Download Page */}
            <Route path="app-download" element={<AppDownload />} />
            <Route path="download-app" element={<AppDownload />} />
            <Route path="download" element={<AppDownload />} />

            {/* Contact Us Page */}
            <Route path="contact-2" element={<ContactPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* DigiLocker OAuth Callback */}
            <Route path="digilocker/callback" element={<DigiLockerCallback />} />
        </Route>


        <Route element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            {/* Role */}
            <Route path="role/create" element={<AddRole />} />
            <Route path="role/edit/:id" element={<EditRole />} />
            <Route path="role/list" element={<ListRole />} />
            {/* Module */}
            <Route path="module/create" element={<AddModule />} />
            <Route path="module/edit/:id" element={<EditModule />} />
            <Route path="module/list" element={<ListModule />} />
            {/* MAIN Module */}
            <Route path="main-module/create" element={<AddMainModule />} />
            <Route path="main-module/edit/:id" element={<EditMainModule />} />
            <Route path="main-module/list" element={<ListMainModule />} />
            {/* Permission */}
            <Route path="permission/create" element={<AddPermission />} />
            <Route path="permission/edit/:id" element={<EditPermission />} />
            <Route path="permission/list" element={<ListPermission />} />
            {/* Role Permission */}
            <Route path="role-permission/create" element={<AddRolePermission />} />
            <Route path="role-permission/edit/:id" element={<EditRolePermission />} />
            <Route path="role-permission/list" element={<ListRolePermission />} />
            {/* User Role Permission */}
            <Route path="user-role-permission/create" element={<AddUserRolePermission />} />
            {/* User Role Commission */}
            <Route path="user-role-commission/create" element={<AddUserRoleCommission />} />
            {/* Sub Module */}
            <Route path="sub-module/create" element={<AddSubModule />} />
            <Route path="sub-module/edit/:id" element={<EditSubModule />} />
            <Route path="sub-module/list" element={<ListSubModule />} />
            {/* Commission */}
            <Route path="commission/list" element={<CommissionList />} />
            <Route path="commission/create" element={<CommissionCreate />} />
            <Route path="commission/edit/:id" element={<CommissionEdit />} />
            {/* Role Commission */}
            <Route path="role-commission/create" element={<AddRoleCommission />} />
            <Route path="role-commission/edit/:id" element={<EditRoleCommission />} />
            <Route path="role-commission/list" element={<ListRoleCommission />} />
            {/* Users */}
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="users/list" element={<ListUser />} />
            <Route path="users/kyc" element={<KycForm />} />
            <Route path="users/manual-kyc/:userId" element={<ManualKycVerify />} />
            {/* HRMS - Department Management */}
            <Route path="hrms/departments/add" element={<AddDepartment />} />
            <Route path="hrms/departments/edit/:id" element={<EditDepartment />} />
            <Route path="hrms/departments/list" element={<ListDepartment />} />
            {/* HRMS - Designation Management */}
            <Route path="hrms/designations/add" element={<AddDesignation />} />
            <Route path="hrms/designations/edit/:id" element={<EditDesignation />} />
            <Route path="hrms/designations/list" element={<ListDesignation />} />
            {/* HRMS - Employee Management */}
            <Route path="hrms/employees/add" element={<AddEmployee />} />
            <Route path="hrms/employees/edit/:id" element={<EditEmployee />} />
            <Route path="hrms/employees/list" element={<ListEmployee />} />
            <Route path="hrms/employees/kyc/:userId" element={<EmployeeKycView />} />
            {/* HRMS - Attendance Management */}
            <Route path="hrms/attendance/add" element={<AddAttendance />} />
            <Route path="hrms/attendance/edit/:id" element={<EditAttendance />} />
            <Route path="hrms/attendance/list" element={<ListAttendance />} />
            {/* HRMS - Leave Management */}
            <Route path="hrms/leaves/add" element={<AddLeave />} />
            <Route path="hrms/leaves/edit/:id" element={<EditLeave />} />
            <Route path="hrms/leaves/list" element={<ListLeave />} />


            {/* Payroll Management */}
            <Route path="hrms/payroll/setup" element={<PayrollSetup />} />
            <Route path="hrms/payroll/list" element={<PayrollList />} />
            <Route path="hrms/payroll/edit/:id" element={<PayrollEdit />} />
            <Route path="hrms/payroll/employees" element={<EmployeePayrollList />} />
            <Route path="hrms/payroll/release/:id" element={<ReleaseSalary />} />
            <Route path="hrms/payroll/payslist" element={<PayList />} />
            <Route path="hrms/payroll/payslips" element={<PayList />} />
            <Route path="hrms/payroll/payslip/:id" element={<PayslipDownload />} />

            {/* CRM - Dashboard */}
            {/* <Route path="crm/dashboard" element={<CRMDashboard />} /> */}
            {/* CRM - Lead Management */}
            <Route path="crm/leads/list" element={<LeadList />} />
            <Route path="crm/leads/add" element={<AddLead />} />
            <Route path="crm/leads/edit/:id" element={<EditLead />} />
            {/* CRM - Lead Types */}
            <Route path="crm/lead-types/list" element={<LeadTypeList />} />
            <Route path="crm/lead-types/add" element={<AddLeadType />} />
            <Route path="crm/lead-types/edit/:id" element={<EditLeadType />} />
            {/* CRM - Lead Sources */}
            <Route path="crm/lead-sources/list" element={<LeadSourceList />} />
            <Route path="crm/lead-sources/add" element={<AddLeadSource />} />
            <Route path="crm/lead-sources/edit/:id" element={<EditLeadSource />} />
            {/* CRM - Lead Status */}
            <Route path="crm/lead-status/list" element={<LeadStatusList />} />
            <Route path="crm/lead-status/add" element={<AddLeadStatus />} />
            <Route path="crm/lead-status/edit/:id" element={<EditLeadStatus />} />
            {/* CRM - Followups */}
            <Route path="crm/followups/list" element={<FollowupList />} />
            <Route path="crm/followups/add" element={<AddFollowup />} />
            <Route path="crm/followups/edit/:id" element={<EditFollowup />} />
            {/* CRM - Activities */}
            <Route path="crm/activities/list" element={<ActivityList />} />
            <Route path="crm/activities/add" element={<AddActivity />} />
            <Route path="crm/activities/edit/:id" element={<EditActivity />} />
            {/* CRM - Followup Types */}
            <Route path="crm/followup-types/list" element={<FollowupTypeList />} />
            <Route path="crm/followup-types/add" element={<AddFollowupType />} />
            <Route path="crm/followup-types/edit/:id" element={<EditFollowupType />} />
            <Route path="crm/followup-types/view/:id" element={<ViewFollowupType />} />
            {/* CRM - Followup Statuses */}
            <Route path="crm/followup-statuses/list" element={<FollowupStatusList />} />
            <Route path="crm/followup-statuses/add" element={<AddFollowupStatus />} />
            <Route path="crm/followup-statuses/edit/:id" element={<EditFollowupStatus />} />
            <Route path="crm/followup-statuses/view/:id" element={<ViewFollowupStatus />} />
            {/* CRM - Emails */}
            <Route path="crm/emails" element={<EmailDashboard />}>
                <Route path="sent" element={<Sent />} />
                <Route index element={<Sent />} />
            </Route>
            <Route path="crm/emails/compose" element={<EmailCompose />} />
            <Route path="crm/emails/compose/:id" element={<EmailCompose />} />
            <Route path="crm/emails/view/:id" element={<EmailView />} />


            {/* Subscription */}
            <Route path="subscription" element={<Subscription />} />
            {/* Subscription Master */}
            <Route path="subscription-master/list" element={<SubscriptionMasterList />} />
            <Route path="subscription-master/add" element={<SubscriptionMasterAdd />} />
            <Route path="subscription-master/edit/:id" element={<SubscriptionMasterEdit />} />
            {/* Role Subscription */}
            <Route path="role-subscription/create" element={<AddRoleSubscription />} />
            {/* Setting */}
            <Route path="setting" element={<SettingIndex />} />
            <Route path="setting/admin/:id" element={<SettingIndex />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="user-profile" element={<UserProfile />} />


            {/* Banking */}
            <Route path="banking/account-list" element={<AccountsList />} />
            <Route path="banking/accounts" element={<ListAccounts />} />
            <Route path="banking/reports" element={<Reports />} />
            <Route path="banking/summary" element={<Summary />} />
            <Route path="banking/tds-letter/:mid" element={<TDSDoc />} />
            <Route path="banking/tds-letter" element={<TDSDoc />} />


            <Route path="banking/accounts/view/:id" element={<ViewAccount />} />
            <Route path="banking/transaction" element={<AccountTransaction />} />
            <Route path="banking/mobile/recharge" element={<BillPayment />} />
            <Route path="banking/mobile-recharge" element={<BillPayment />} />
            <Route path="banking/mobilerecharge" element={<BillPayment />} />
            <Route path="mobile/recharge" element={<BillPayment />} />
            <Route path="banking/mobile/recharge-report" element={<BillPayment />} />
            <Route path="banking/dth/recharge" element={<BillPayment />} />
            <Route path="banking/dth-recharge" element={<BillPayment />} />
            <Route path="banking/dthrecharge" element={<BillPayment />} />
            <Route path="dth/recharge" element={<BillPayment />} />
            <Route path="banking/dth/recharge-report" element={<DTHReport />} />
            <Route path="banking/bill/payment" element={<BillPayment />} />
            <Route path="banking/bill-payment" element={<BillPayment />} />
            <Route path="banking/bill/payment-report" element={<BillPayment />} />
            <Route path="banking/bill/search-transaction" element={<BillPayment />} />
            <Route path="bill-payment-invoice" element={<BillPayment />} />
            <Route path="banking/bill-payment-invoice" element={<BillPayment />} />

            {/* Recharge Operator Management CRUD */}
            <Route path="recharge/operator" element={<RechargeOperatorReport />} />
            <Route path="recharge/operator/report" element={<RechargeOperatorReport />} />
            <Route path="recharge/operator/add" element={<RechargeOperatorForm />} />
            <Route path="recharge/operator/edit/:id" element={<RechargeOperatorForm />} />
            <Route path="recharge/category" element={<BbpsCategoryManager />} />
            <Route path="recharge/circle" element={<UtilityCircleManager />} />

            {/* API Master Setting Routes */}
            <Route path="api-master/setting" element={<ApiSettingForm />} />
            <Route path="api-master/setting/add" element={<ApiSettingForm />} />
            <Route path="api-master/setting/report" element={<ApiSettingReport />} />
            <Route path="api-master/pending-setting" element={<ApiPendingSetting />} />
            <Route path="api-master/service-wise-setting" element={<ApiServiceSetting />} />
            <Route path="api-master/setting/edit/:id" element={<ApiSettingForm />} />
            <Route path="api-master/operator-mapping" element={<OperatorMapping />} />
            <Route path="recharge/operator-mapping" element={<OperatorMapping />} />

            {/* Commission Master Routes */}
            <Route path="commission-master/packages" element={<CommissionPackages />} />
            <Route path="commission-master/assignments" element={<CommissionAssignments />} />
            <Route path="commission-master/special-offers" element={<SpecialOfferCommissions />} />

            {/* Cash Deposit Service */}
            <Route path="cash-deposit" element={<CashDeposit />} />
            <Route path="cash-deposit/history" element={<CashDepositHistory />} />
            <Route path="cash-deposit/register" element={<CashDepositRegister />} />
            <Route path="cash-deposit/ekyc" element={<CashDepositEkyc />} />
            <Route path="cash-deposit/biometric-kyc" element={<CashDepositBiometricKyc />} />
            <Route path="cash-deposit/two-factor-auth" element={<CashDepositTwoFactorAuth />} />

            {/* Beneficiary Management */}
            <Route path="banking/beneficiary" element={<BeneficiaryList />} />
            <Route path="banking/beneficiary/add" element={<AddBeneficiary />} />
            <Route path="banking/beneficiary/view/:id" element={<ViewBeneficiary />} />
            <Route path="banking/payout" element={<PayoutHistory />} />
            <Route path="banking/move-to" element={<MoveTo />} />
            <Route path="banking/add-move-to-account" element={<AddMoveToAccount />} />
            {/* SMS Messages */}
            <Route path="sms/list" element={<ListMessages />} />
            <Route path="sms/create" element={<AddMessage />} />
            <Route path="sms/edit/:id" element={<EditMessage />} />




            <Route path="aeps" element={<AepsHome />} />
            <Route path="register" element={<AepsRegister />} />
            <Route path="aeps-receipt" element={<AepsReceipt />} />
            <Route path="aeps-history" element={<AepsHistory />} />
            <Route path="aeps/report" element={<AepsHistory />} />
            <Route path="aeps/video-kyc" element={<VideoKycDashboard />} />
            <Route path="aeps/video-kyc/pending-list" element={<PendingList />} />
            <Route path="aeps/video-kyc/verified-list" element={<VerifiedList />} />
            <Route path="aeps/video-kyc/old-list" element={<OldList />} />
            <Route path="aeps/video-kyc/details/:id" element={<VideoKycDetailsPage />} />




            <Route path="m-atm/withdrawal" element={<MAtmWithdrawal />} />
            <Route path="cms" element={<CMS />} />
            <Route path="m-atm/withdrawal-history" element={<MAtmHistory />} />
            <Route path="matm-reciept" element={<MAtmReceipt />} />

            <Route path="banking/add-fund-request" element={<AddFundRequest />} />
            <Route path="banking/add-fund-history" element={<AddFundHistory />} />
            <Route path="banking/commission-report" element={<CommissionReportPage />} />
            <Route path="my-commission-structure" element={<MyCommissionStructure />} />
            <Route path="commission-structure" element={<MyCommissionStructure />} />
            <Route path="my-commission-slabs" element={<MyCommissionStructure />} />
            <Route path="banking/my-commission-slabs" element={<MyCommissionStructure />} />





            <Route path="banking/admin-complaints" element={<AdminBbpsComplaints />} />
            <Route path="recharge/admin-complaints" element={<AdminBbpsComplaints />} />
            <Route path="/complaints/dashboard" element={<ComplaintDashboard />} />
            <Route path="/complaints/list" element={<ComplaintsList />} />
            <Route path="/complaints/create" element={<CreateComplaint />} />
            <Route path="/complaints/view/:id" element={<ViewComplaint />} />
            <Route path="/complaints/workload-report" element={<WorkloadReport />} />
            <Route path="/chat" element={<ChatThreadsList />} />
            <Route path="/chat/:threadId" element={<HelpDeskChat />} />
            <Route path="/support" element={<Support />} />
            <Route path="/api-documentation" element={<ApiDocsPage />} />

            {/* Admin - Loan Lead Management */}
            <Route path="loan-leads/dashboard" element={<AdminLoanLeadDashboard />} />
            <Route path="loan-leads/list" element={<AdminLoanLeadList />} />
            <Route path="loan-leads/manage/:leadId" element={<AdminManageLoanLead />} />
            <Route path="loan-leads/commission-report" element={<LoanCommissionReport />} />

            {/* Admin - Credit Card Lead Management */}
            <Route path="credit-card-leads/dashboard" element={<AdminCreditCardLeadDashboard />} />
            <Route path="credit-card-leads/list" element={<AdminCreditCardLeadList />} />
            <Route path="credit-card-leads/manage/:leadId" element={<AdminManageCreditCardLead />} />
            <Route path="credit-card-leads/commission-report" element={<CreditCardCommissionReport />} />


            <Route path="banking/credit-card" element={<CreditCard />} />
            <Route path="banking/credit-card/create" element={<CreateCreditCardLead />} />
            <Route path="banking/credit-card/list" element={<CreditCardLeadList />} />

            <Route path="banking/loan-apply" element={<LoanApply />} />
            <Route path="banking/loan-apply/create" element={<CreateLoanLead />} />
            <Route path="banking/loan-apply/list" element={<LoanLeadList />} />
            <Route path="banking/merchant/list" element={<MerchantList />} />
            <Route path="banking/api-merchant/list" element={<ApiMerchantList />} />
            <Route path="admin/manage-user-report" element={<ManageUserReport />} />
            <Route path="banking/manage-user-report" element={<ManageUserReport />} />
            <Route path="manage-user-report" element={<ManageUserReport />} />

            <Route path="banking/insurance-apply" element={<InsuranceApply />} />
            <Route path="referral-list" element={<ReferralList />} />

            <Route path="id-card" element={<IdCard />} />
            <Route path="shop-banner" element={<ShopBanner />} />
            <Route path="shop-banner/:id" element={<ShopBanner />} />
            <Route path="certificate" element={<Certificate />} />

            <Route path="gst" element={<Gst />} />
            <Route path="gst/create" element={<CreateGst />} />
            <Route path="gst/list" element={<GstList />} />
            <Route path="gst/admin-dashboard" element={<GstAdminDashboard />} />
            <Route path="gst/dashboard" element={<GstDashboard />} />

            <Route path="income-tax/create" element={<CreateIncomeTax />} />
            <Route path="income-tax" element={<IncomeTaxDashboard />} />
            <Route path="income-tax/list" element={<IncomeTaxList />} />
            <Route path="income-tax/admin-dashboard" element={<IncomeTaxAdminDashboard />} />

            <Route path="msme" element={<MsmeDashboard />} />
            <Route path="msme/create" element={<CreateMsme />} />
            <Route path="msme/list" element={<MsmeList />} />
            <Route path="msme/admin-dashboard" element={<MsmeAdminDashboard />} />
            <Route path="msme/dashboard" element={<MsmeDashboard />} />

            {/* Saving Account Routes */}
            <Route path="saving-account/create" element={<CreateSavingAccount />} />
            <Route path="saving-account" element={<SavingAccountDashboard />} />
            <Route path="saving-account/list" element={<SavingAccountList />} />
            <Route path="saving-account/admin-dashboard" element={<SavingAccountAdminDashboard />} />

            {/* Notification Routes */}
            <Route path="notification/compose" element={<NotificationCompose />} />
            <Route path="notification/dashboard" element={<NotificationDashboard />} />
            <Route path="notification/list" element={<NotificationList />} />
            <Route path="notification/view/:id" element={<NotificationView />} />

            {/* Popup Management Routes */}
            <Route path="popup/list" element={<PopupList />} />
            <Route path="popup/add" element={<PopupForm />} />
            <Route path="popup/edit/:id" element={<PopupForm />} />

            {/* DSA Admin Routes */}
            <Route path="dsa/admin/categories" element={<CategoryList />} />
            <Route path="dsa/admin/categories/add" element={<CategoryForm />} />
            <Route path="dsa/admin/categories/edit/:id" element={<CategoryForm />} />
            <Route path="dsa/admin/items" element={<ItemList />} />
            <Route path="dsa/admin/items/add" element={<ItemForm />} />
            <Route path="dsa/admin/items/edit/:id" element={<ItemForm />} />
            <Route path="dsa/admin/users" element={<UserList />} />

            {/* DSA User Routes */}
            <Route path="dsa/services" element={<DsaServices />} />
            <Route path="dsa/dashboard" element={<DsaDashboard />} />
            <Route path="dsa/apply" element={<DsaApply />} />
            <Route path="dsa/list" element={<DsaList />} />
            <Route path="dsa/success" element={<DsaSuccess />} />

            {/* Banner Routes */}
            <Route path="admin/banners" element={<BannerList />} />
            <Route path="admin/banners/create" element={<BannerForm />} />
            <Route path="admin/banners/:id/edit" element={<BannerForm />} />

            <Route path="card-download/" element={<CardDownloads />} />
            <Route path="card-download/:cardType" element={<CardDownload />} />
            <Route path="card-download/:cardType/:id" element={<CardDownloadView />} />
            <Route path="card-download-tnc" element={<DownloadTnc />} />

            {/* PAN Card Service Routes */}
            <Route path="pancard/agent-register" element={<PsaAgentRegistration />} />
            <Route path="pancard/add-fund" element={<PanAddFund />} />
            <Route path="pancard/admin/agents" element={<AdminAgentList />} />
            <Route path="pancard/admin/fund-requests" element={<AdminFundRequests />} />
            <Route path="pancard/admin/application-report" element={<PanApplicationReport />} />


        </Route>


        <Route path="testing" element={<Testing />} />


        <Route path="*" element={<div>404 Not Found</div>} />





    </Routes>
);

export default AppRoutes;


