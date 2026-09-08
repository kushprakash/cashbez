# Credit Card Lead Management System

Complete implementation of a Credit Card Lead Management System with user and admin interfaces.

## 📋 Overview

This system allows users to submit credit card applications and admins to manage, track, and process these leads with commission management.

## 🗄️ Database Setup

### SQL Table Creation

Execute the SQL file located at:
```
database/sql/credit_card_leads.sql
```

This will create two tables:
1. **credit_card_leads** - Main table storing all lead information
2. **credit_card_lead_history** - Tracks all status changes and actions

### Key Features of the Database:
- Auto-incrementing lead IDs with format: `L20251031001`
- Comprehensive lead information (personal, financial, preferences)
- Status tracking with 7 states (new, contacted, document_pending, under_review, approved, rejected, cancelled)
- Commission management with 4 states (pending, approved, released, cancelled)
- Full audit trail with history table
- Soft deletes support
- Foreign key constraints for data integrity

## 🎯 API Endpoints

### User-Side Endpoints

#### Dashboard
```
GET /api/credit-card-leads/dashboard
```
Returns statistics, recent leads, and pending count

#### List Leads
```
GET /api/credit-card-leads
```
Query Parameters: status, desired_card, lead_source, assigned_to, date_from, date_to, search

#### Create Lead
```
POST /api/credit-card-leads
```
Body:
```json
{
  "user_id": 1,
  "full_name": "Amit Kumar",
  "mobile": "+919876543210",
  "email": "amit@example.com",
  "dob": "1990-04-15",
  "pan": "ABCDE1234F",
  "monthly_income": 50000,
  "desired_card": "Cashback",
  "lead_source": "Website",
  "preferred_contact_time": "evening",
  "consent": true,
  "notes": "Interested in cashback cards"
}
```

#### View Lead Details
```
GET /api/credit-card-leads/{lead_id}
```

#### Delete Lead
```
DELETE /api/credit-card-leads/{lead_id}
```

### Admin-Side Endpoints

#### Admin Dashboard
```
GET /api/admin/credit-card-leads/dashboard
```
Returns comprehensive stats, leads requiring attention, and commission overview

#### Admin List Leads
```
GET /api/admin/credit-card-leads
```
Query Parameters: status, commission_status, search, date_from, date_to

#### Update Status
```
PUT /api/admin/credit-card-leads/{lead_id}/status
```
Body:
```json
{
  "status": "approved",
  "status_message": "Your application has been approved",
  "admin_notes": "Internal notes about the approval"
}
```

#### Assign Lead
```
PUT /api/admin/credit-card-leads/{lead_id}/assign
```
Body:
```json
{
  "assigned_to": 5,
  "remarks": "Assigned to senior agent"
}
```

#### Update Notes
```
PUT /api/admin/credit-card-leads/{lead_id}/notes
```
Body:
```json
{
  "admin_notes": "Internal admin notes",
  "status_message": "User-facing status message"
}
```

#### Set Commission
```
PUT /api/admin/credit-card-leads/{lead_id}/commission
```
Body:
```json
{
  "commission_amount": 1000,
  "commission_status": "approved",
  "remarks": "Standard commission for cashback card"
}
```

#### Release Commission
```
POST /api/admin/credit-card-leads/{lead_id}/release-commission
```
Body:
```json
{
  "remarks": "Commission released after verification"
}
```

#### Commission Report
```
GET /api/admin/credit-card-leads/commission-report
```
Query Parameters: date_from, date_to

## 🎨 Frontend Components

### User-Side Pages

1. **CreditCardDashboard.jsx**
   - Location: `resources/js/gromo/CreditCardDashboard.jsx`
   - Shows statistics, commission summary, and recent leads
   - Quick actions for creating and viewing leads

2. **CreateCreditCardLead.jsx**
   - Location: `resources/js/gromo/CreateCreditCardLead.jsx`
   - Form with validation for creating new leads
   - PAN validation, email validation, consent requirement
   - Sections: Personal Information, Card Preferences, Consent

3. **CreditCardLeadList.jsx**
   - Location: `resources/js/gromo/CreditCardLeadList.jsx`
   - Filterable table showing all leads
   - Filters: status, card type, date range, search
   - Shows commission status and amounts

### Admin-Side Pages

1. **AdminCreditCardDashboard.jsx**
   - Location: `resources/js/gromo/admin/AdminCreditCardDashboard.jsx`
   - Comprehensive statistics with all status counts
   - Commission overview (pending, approved, released)
   - Leads requiring attention section
   - Recent leads with quick actions

2. **AdminManageLead.jsx**
   - Location: `resources/js/gromo/admin/AdminManageLead.jsx`
   - Complete lead details view
   - Status update form with user message
   - Commission management (set amount, approve, release)
   - Action history timeline

3. **AdminCreditCardList.jsx**
   - Location: `resources/js/gromo/admin/AdminCreditCardList.jsx`
   - Admin view of all leads with filters
   - Commission status filtering
   - Bulk management capabilities

4. **CommissionReport.jsx**
   - Location: `resources/js/gromo/admin/CommissionReport.jsx`
   - Summary cards (pending, approved, released)
   - Detailed commission table with filters
   - CSV export functionality
   - Total commission calculations

### Core Component

**CreditCard.jsx**
- Location: `resources/js/gromo/CreditCard.jsx`
- Conditional header/footer rendering based on `states` prop
- Usage: `<CreditCard states={true}>{children}</CreditCard>`
- When `states=false`, header and footer are hidden

## 🔧 Laravel Controllers

### CreditCardLeadController
- Location: `app/Http/Controllers/Gromo/CreditCardLeadController.php`
- Handles user-side operations
- Role-based filtering
- Permission checks

### CreditCardLeadAdminController
- Location: `app/Http/Controllers/Gromo/Admin/CreditCardLeadAdminController.php`
- Handles admin operations
- Commission management
- Status updates
- Assignment functionality

## 📦 Models

### CreditCardLead
- Location: `app/Models/CreditCardLead.php`
- Main model for credit card leads
- Relationships: user, assignedTo, admin, createdBy, commissionReleasedBy
- Scopes: active, byStatus, byUserId, etc.
- Methods: generateLeadId(), canBeEdited(), canReleaseCommission()

### CreditCardLeadHistory
- Location: `app/Models/CreditCardLeadHistory.php`
- Tracks all changes to leads
- Records: status changes, assignments, notes updates

## 🚀 Features

### User Features
- ✅ Create new credit card lead applications
- ✅ View dashboard with statistics
- ✅ List and filter their own leads
- ✅ Track application status
- ✅ View commission status and amounts
- ✅ See status messages from admin

### Admin Features
- ✅ Comprehensive dashboard with all metrics
- ✅ Manage all leads
- ✅ Update lead status with user-facing messages
- ✅ Add internal admin notes
- ✅ Assign leads to team members
- ✅ Set commission amounts
- ✅ Approve commissions
- ✅ Release commissions
- ✅ View commission reports
- ✅ Export commission data to CSV
- ✅ Filter by multiple criteria
- ✅ View complete action history

## 🔐 Security & Permissions

- Token-based authentication required for all endpoints
- Role-based access control:
  - **SuperAdmin (role=1)**: Full access to all leads
  - **Admin (role=2)**: Access to leads under their admin_id
  - **Users**: Access only to their own created leads
- Commission release restricted to approved leads only
- Status updates require admin privileges
- Soft deletes for data retention

## 📊 Status Flow

```
new → contacted → document_pending → under_review → approved/rejected
                                                        ↓
                                                   cancelled
```

## 💰 Commission Flow

```
Lead Created → Lead Approved → Commission Set (pending) → 
Commission Approved → Commission Released
```

## 📝 Sample Data Format

```json
{
  "id": 1,
  "user_id": 1,
  "lead_id": "L20251031001",
  "created_at": "2025-10-31T10:00:00+05:30",
  "full_name": "Amit Kumar",
  "mobile": "+919876543210",
  "email": "amit@example.com",
  "dob": "1990-04-15",
  "pan": "ABCDE1234F",
  "monthly_income": "50000",
  "desired_card": "Cashback",
  "lead_source": "Website",
  "preferred_contact_time": "evening",
  "consent": true,
  "consent_timestamp": "2025-10-31T10:00:00+05:30",
  "status": "new",
  "assigned_to": null,
  "admin_id": 1,
  "created_by": 1,
  "notes": "Interested in cashback + no annual fee",
  "updated_at": "2025-10-31T10:00:00+05:30"
}
```

## 🛠️ Installation Steps

1. **Database Setup**
   ```bash
   # Execute the SQL file to create tables
   mysql -u username -p database_name < database/sql/credit_card_leads.sql
   ```

2. **No Migration Needed** - SQL file provided for direct execution

3. **Models & Controllers** - Already created in proper Laravel structure

4. **API Routes** - Already added to `routes/api.php`

5. **Frontend Components** - Created in `resources/js/gromo/` directory

## 🎯 Usage Examples

### Creating a Lead (User)
```javascript
const lead = await apiService.vPost('/api/credit-card-leads', {
  user_id: currentUser.id,
  full_name: "John Doe",
  mobile: "+919876543210",
  email: "john@example.com",
  dob: "1985-05-15",
  pan: "ABCDE1234F",
  monthly_income: 75000,
  desired_card: "Travel",
  consent: true
});
```

### Updating Status (Admin)
```javascript
const result = await apiService.vPost(`/api/admin/credit-card-leads/${leadId}/status`, {
  status: "approved",
  status_message: "Congratulations! Your application is approved.",
  admin_notes: "Verified all documents"
});
```

### Releasing Commission (Admin)
```javascript
const result = await apiService.vPost(
  `/api/admin/credit-card-leads/${leadId}/release-commission`,
  { remarks: "Commission released after successful card activation" }
);
```

## 📱 Responsive Design

All components are built with Bootstrap 5 and are fully responsive:
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced features
- Touch-friendly interfaces

## 🐛 Error Handling

All endpoints return standardized responses:
```json
{
  "status": 1,  // 1 for success, 0 for error
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## 📈 Future Enhancements (Optional)

- [ ] Document upload functionality
- [ ] Email notifications for status changes
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Lead scoring system
- [ ] Automated assignment based on workload
- [ ] Integration with banking APIs
- [ ] Multi-language support

## 👥 Support

For issues or questions:
1. Check the API endpoint documentation
2. Verify database tables are created correctly
3. Ensure proper authentication token is passed
4. Check Laravel logs for backend errors
5. Check browser console for frontend errors

---

**Created**: October 31, 2025
**Version**: 1.0.0
**Framework**: Laravel 11 + React
