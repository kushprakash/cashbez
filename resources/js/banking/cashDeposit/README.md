# Cash Deposit Module

This module provides a complete Cash Deposit service implementation following the same pattern as AEPS, with step-by-step verification and transaction processing.

## File Structure

```
resources/js/banking/cashDeposit/
├── CashDeposit.jsx                 # Main transaction interface
├── CashDepositHistory.jsx          # Transaction history page
├── CashDepositRegister.jsx         # Registration/draft creation
├── CashDepositEkyc.jsx             # eKYC verification
├── CashDepositBiometricKyc.jsx     # Biometric authentication
├── CashDepositTwoFactorAuth.jsx    # Two-factor authentication setup
├── mantra_morpho/                  # Biometric scanner components (copied from AEPS)
├── App.css                         # Styles (copied from AEPS)
├── npci-logo.png                   # NPCI logo
└── index.js                        # Component exports
```

## API Integration

The module integrates with the following backend API endpoints:

- `POST /api/v2/cash-deposit/send-otp` - Send OTP for transaction
- `POST /api/v2/cash-deposit/verify-otp` - Verify OTP
- `POST /api/v2/cash-deposit/process` - Process cash deposit transaction
- `POST /api/v2/cash-deposit/history` - Get transaction history

## Step-by-Step Process

### 1. Registration/Draft (`CashDepositRegister.jsx`)
- Merchant registration with personal, bank, and address information
- Location capture (latitude/longitude)
- OTP verification for registration completion

### 2. eKYC Verification (`CashDepositEkyc.jsx`)
- Aadhaar number verification
- Mobile number and email verification
- OTP-based eKYC completion

### 3. Biometric KYC (`CashDepositBiometricKyc.jsx`)
- Biometric device discovery
- Fingerprint capture using Mantra/Morpho devices
- Biometric data submission for KYC

### 4. Two-Factor Authentication (`CashDepositTwoFactorAuth.jsx`)
- Transaction PIN setup
- SMS/Email verification
- Two-factor authentication activation

### 5. Transaction Processing (`CashDeposit.jsx`)
- Customer details entry (mobile, Aadhaar, bank)
- Amount selection (with quick amount buttons)
- Biometric capture for transaction
- OTP verification and processing

### 6. Transaction History (`CashDepositHistory.jsx`)
- Filterable transaction history
- Date range, status, and transaction ID filters
- Transaction details viewing
- Receipt download (placeholder)

## Component Features

### Main Transaction Interface (`CashDeposit.jsx`)
- Form validation for all required fields
- Fast cash amount selection (₹100 to ₹10,000)
- Bank selection dropdown
- Biometric integration
- Step-wise modal progression for incomplete verifications
- Real-time status checking

### History Page (`CashDepositHistory.jsx`)
- Paginated transaction listing
- Advanced filtering options
- Status badges (Success, Failed, Pending)
- Responsive data table
- Export functionality (placeholder)

## Security Features

1. **Multi-step Verification**: Registration → eKYC → Biometric → Two-FA → Transaction
2. **Biometric Authentication**: Fingerprint capture for all transactions
3. **OTP Verification**: SMS/Email OTP for critical operations
4. **Transaction PIN**: Additional PIN verification for transactions
5. **Device Validation**: IMEI and device information capture

## Usage

### Import Components
```javascript
import { 
  CashDeposit, 
  CashDepositHistory, 
  CashDepositRegister,
  CashDepositEkyc,
  CashDepositBiometricKyc,
  CashDepositTwoFactorAuth
} from './banking/cashDeposit';
```

### Route Configuration (Example)
```javascript
// Add to your routing configuration
{
  path: '/banking/cash-deposit',
  component: CashDeposit
},
{
  path: '/banking/cash-deposit/history',
  component: CashDepositHistory
},
{
  path: '/banking/cash-deposit/register',
  component: CashDepositRegister
},
{
  path: '/banking/cash-deposit/ekyc',
  component: CashDepositEkyc
},
{
  path: '/banking/cash-deposit/biometric-kyc',
  component: CashDepositBiometricKyc
},
{
  path: '/banking/cash-deposit/two-factor-auth',
  component: CashDepositTwoFactorAuth
}
```

## Dependencies

- React Router for navigation
- react-toastify for notifications
- ApiService for backend communication
- AuthContext for user authentication
- Biometric scanner components (Mantra/Morpho)

## Backend Requirements

The backend should implement the Cash Deposit controller methods:
- `sendOtp()` - Step 1: Send OTP after biometric capture
- `verifyOtp()` - Step 2: Verify OTP
- `processCashDeposit()` - Step 3: Process the actual deposit
- `cashDepositHistory()` - Get transaction history

## Error Handling

- Comprehensive form validation
- API error handling with user-friendly messages
- Biometric device error handling
- Network error recovery
- Step progression validation

## Styling

The module uses the same styling pattern as AEPS:
- Bootstrap classes for layout
- Custom CSS from App.css
- Consistent color scheme (#6c5ce7 primary)
- NPCI branding elements
- Responsive design

## Configuration

Update the API endpoints in each component if your backend uses different routes:

```javascript
// Example API endpoint configuration
const API_ENDPOINTS = {
  SEND_OTP: '/api/v2/cash-deposit/send-otp',
  VERIFY_OTP: '/api/v2/cash-deposit/verify-otp',
  PROCESS: '/api/v2/cash-deposit/process',
  HISTORY: '/api/v2/cash-deposit/history'
};
```

## Testing

Test each step of the process:
1. Registration with valid/invalid data
2. eKYC with different mobile numbers
3. Biometric capture with different devices
4. Two-FA setup and verification
5. Transaction processing with various amounts
6. History filtering and pagination

## Support

For issues related to:
- Biometric devices: Check device connectivity and drivers
- API integration: Verify backend controller implementation
- Step progression: Ensure proper status management
- UI/UX: Check console for JavaScript errors