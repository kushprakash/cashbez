# Beneficiary Management System

## Overview
The Beneficiary Management System allows users to add, view, and delete bank account beneficiaries with OTP-based verification. The system includes account and IFSC code verification features.

## Features

### 1. Database Structure
- **Table**: `beneficiaries`
- **Columns**: 
  - `id` - Primary key
  - `user_id` - Foreign key to users table
  - `name` - Beneficiary name
  - `account` - Bank account number
  - `ifsc` - IFSC code
  - `branch` - Bank branch name (auto-populated from IFSC verification)
  - `admin_id` - Admin who processed the beneficiary
  - `created_by` - User who created the record
  - `account_verified` - Boolean flag for account verification
  - `ifsc_verified` - Boolean flag for IFSC verification
  - `verification_data` - JSON field storing verification API responses
  - `created_at`, `updated_at`, `deleted_at` - Timestamps (soft deletes enabled)

### 2. Verification System
- **IFSC Verification**: Uses Razorpay IFSC API to verify IFSC codes and fetch branch details
- **Account Verification**: Placeholder for bank account verification API (implement based on available service)
- **Branch Auto-population**: Branch name is automatically filled from IFSC verification response

### 3. Security Features
- **OTP-based Operations**: Both adding and deleting beneficiaries require OTP verification
- **Soft Deletes**: Deleted beneficiaries are soft-deleted, maintaining audit trail
- **User Isolation**: Users can only access their own beneficiaries
- **Input Validation**: Comprehensive validation for all input fields

### 4. Business Rules
- **No Editing**: Beneficiary details cannot be edited once added (read-only after creation)
- **Duplicate Prevention**: System prevents adding duplicate beneficiary with same account+IFSC
- **OTP Expiry**: OTP expires after 5 minutes
- **IFSC Format Validation**: Validates IFSC code format (XXXX0XXXXXX)

## API Endpoints

### Authentication Required
All endpoints require authentication via `api.token.auth` middleware.

### 1. List Beneficiaries
```
GET /api/beneficiaries
```
**Parameters:**
- `search` (optional) - Search by name, account, IFSC, or branch
- `verified` (optional) - Filter by verification status (true/false)
- `page` (optional) - Page number for pagination
- `per_page` (optional) - Items per page (default: 15)

**Response:**
```json
{
  "status": 1,
  "message": "Beneficiaries retrieved successfully",
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 2,
    "total": 25
  }
}
```

### 2. Add Beneficiary
```
POST /api/beneficiaries
```
**Body:**
```json
{
  "name": "John Doe",
  "account": "1234567890123456",
  "ifsc": "SBIN0001234",
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Beneficiary added successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "account": "1234567890123456",
    "ifsc": "SBIN0001234",
    "branch": "SBI Main Branch",
    "account_verified": true,
    "ifsc_verified": true,
    "created_at": "2025-08-19T18:30:00.000000Z"
  }
}
```

### 3. Send OTP
```
POST /api/beneficiaries/send-otp
```
**Response:**
```json
{
  "status": 1,
  "message": "OTP sent successfully",
  "data": {
    "expires_in": 300
  }
}
```

### 4. View Beneficiary
```
GET /api/beneficiaries/{id}
```
**Response:**
```json
{
  "status": 1,
  "message": "Beneficiary retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "account": "1234567890123456",
    "ifsc": "SBIN0001234",
    "branch": "SBI Main Branch",
    "account_verified": true,
    "ifsc_verified": true,
    "verification_data": {...},
    "user": {...},
    "admin": {...},
    "creator": {...}
  }
}
```

### 5. Delete Beneficiary
```
DELETE /api/beneficiaries/{id}
```
**Body:**
```json
{
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Beneficiary deleted successfully"
}
```

## Frontend Pages

### 1. Beneficiary List (`/banking/beneficiary`)
- Displays paginated list of beneficiaries
- Search and filter functionality
- Verification status indicators
- Delete with OTP confirmation
- Add new beneficiary button

### 2. Add Beneficiary (`/banking/beneficiary/add`)
- Form to add new beneficiary
- Real-time IFSC verification
- OTP-based submission
- Validation and error handling
- Branch auto-population

### 3. View Beneficiary (`/banking/beneficiary/view/{id}`)
- Read-only view of beneficiary details
- Verification status and details
- Bank information from IFSC verification
- System information (created by, dates, etc.)
- Delete functionality with OTP

## Model Relationships

### Beneficiary Model
```php
// Relationships
public function user() // belongsTo User (owner)
public function admin() // belongsTo User (processor)
public function creator() // belongsTo User (creator)

// Scopes
public function scopeVerified($query) // Get verified beneficiaries
public function scopeForUser($query, $userId) // Get user's beneficiaries

// Methods
public function isFullyVerified() // Check if both account and IFSC verified
```

## Installation & Setup

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Seed Sample Data (Optional)
```bash
php artisan db:seed BeneficiarySeeder
```

### 3. Build Frontend
```bash
npm run build
```

## Customization

### 1. Account Verification Service
Update the `verifyBankAccount()` method in `BeneficiaryController` to integrate with your preferred bank account verification service.

### 2. OTP Service
Update the `sendOtp()` and `verifyOtp()` methods to integrate with your SMS service provider.

### 3. Validation Rules
Modify validation rules in the controller based on your specific requirements.

### 4. UI Customization
Frontend components are located in `resources/js/banking/beneficiary/` and can be customized as needed.

## Security Considerations

1. **OTP Security**: Implement rate limiting for OTP requests
2. **Input Sanitization**: All inputs are validated and sanitized
3. **User Authorization**: Users can only access their own beneficiaries
4. **Audit Trail**: Soft deletes maintain complete audit trail
5. **API Rate Limiting**: Consider implementing rate limiting for API endpoints

## Testing

Use the provided test file `test_beneficiary_system.php` for API testing guidelines and sample requests.

## File Structure

```
app/
├── Models/
│   └── Beneficiary.php
├── Http/Controllers/Banking/
│   └── BeneficiaryController.php
database/
├── migrations/
│   └── 2025_08_19_180507_create_beneficiaries_table.php
└── seeders/
    └── BeneficiarySeeder.php
resources/js/banking/beneficiary/
├── list.jsx
├── add.jsx
├── view.jsx
└── index.js
routes/
└── api.php (beneficiary routes)
```

## Support

For issues or feature requests related to the beneficiary system, please refer to the main project documentation or contact the development team.
