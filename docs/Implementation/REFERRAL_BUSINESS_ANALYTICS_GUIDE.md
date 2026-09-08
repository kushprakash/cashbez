# Referral Business Analytics System

## Overview
Enhanced referral system with comprehensive business analytics for tracking referral user performance across all financial services.

## 🚀 Features

### 1. Multi-Level Referral Tracking
- Support for 3-level deep referral hierarchy
- Period-based filtering (day, month, year, all)
- Optional business data inclusion for performance analytics

### 2. Comprehensive Business Metrics
For each referral user, track:
- **AEPS Transactions**: Cash Withdrawal, Aadhaar Pay, Balance Enquiry, Mini Statement
- **Utility Services**: Mobile Recharge, DTH Recharge, Bill Payment
- **Payouts**: Money transfer transactions
- **Add Fund**: Account top-up transactions
- **Cash Deposit**: Cash deposit transactions
- **Account Balance**: Total, Hold, Available balance

### 3. Period-Based Analytics
- **Daily**: Today's transactions
- **Monthly**: Current month's transactions
- **Yearly**: Current year's transactions
- **All Time**: Complete transaction history

## 📡 API Endpoints

### 1. Get Referrals List
```http
GET /api/referrals?period={period}&business_data={boolean}
```

#### Parameters
- `period` (optional): `day`, `month`, `year`, `all` (default: `all`)
- `business_data` (optional): `true`/`false` (default: `false`)

#### Example Request
```http
GET /api/referrals?period=month&business_data=true
```

#### Response Structure
```json
{
  "status": 1,
  "message": "Referrals retrieved successfully",
  "data": {
    "period": "month",
    "business_data_included": true,
    "levels": {
      "1": [
        {
          "id": 123,
          "name": "John Doe",
          "mobile": "9876543210",
          "email": "john@example.com",
          "mid": "USER123",
          "refer_by": "PARENT_MID",
          "created_at": "2024-01-15T10:30:00.000000Z",
          "status": 1,
          "business_data": {
            "aeps": {
              "cash_withdrawal": {
                "count": 45,
                "success_count": 42,
                "failed_count": 3,
                "total_amount": 125000.0,
                "success_amount": 120000.0
              },
              "aadhaar_pay": {
                "count": 23,
                "success_count": 22,
                "failed_count": 1,
                "total_amount": 45000.0,
                "success_amount": 44000.0
              },
              "balance_enquiry": {
                "count": 156,
                "success_count": 150,
                "failed_count": 6
              },
              "mini_statement": {
                "count": 89,
                "success_count": 85,
                "failed_count": 4
              }
            },
            "utility_services": {
              "mobile_recharge": {
                "count": 67,
                "success_count": 65,
                "failed_count": 2,
                "pending_count": 0,
                "total_amount": 12500.0,
                "success_amount": 12300.0
              },
              "dth_recharge": {
                "count": 23,
                "success_count": 23,
                "failed_count": 0,
                "pending_count": 0,
                "total_amount": 4600.0,
                "success_amount": 4600.0
              },
              "bill_payment": {
                "count": 12,
                "success_count": 12,
                "failed_count": 0,
                "pending_count": 0,
                "total_amount": 15600.0,
                "success_amount": 15600.0
              }
            },
            "payouts": {
              "count": 34,
              "success_count": 32,
              "failed_count": 1,
              "pending_count": 1,
              "total_amount": 89000.0,
              "success_amount": 85000.0
            },
            "add_fund": {
              "count": 15,
              "success_count": 14,
              "failed_count": 0,
              "pending_count": 1,
              "total_amount": 50000.0,
              "success_amount": 45000.0
            },
            "cash_deposit": {
              "count": 8,
              "success_count": 8,
              "failed_count": 0,
              "pending_count": 0,
              "total_amount": 25000.0,
              "success_amount": 25000.0
            },
            "account_balance": {
              "total_balance": 15000.0,
              "hold_balance": 2000.0,
              "available_balance": 13000.0,
              "account_status": 1,
              "account_created": "2024-01-10T08:00:00.000000Z"
            },
            "summary": {
              "total_success_volume": 351500.0,
              "period": "month",
              "last_updated": "2024-11-11T10:30:00.000000Z"
            }
          }
        }
      ],
      "2": [...],
      "3": [...]
    }
  }
}
```

### 2. Get Individual Referral User Dashboard
```http
GET /api/referral-user-dashboard?user_mid={mid}&period={period}
```

#### Parameters
- `user_mid` (required): MID of the referral user
- `period` (optional): `day`, `month`, `year`, `all` (default: `all`)

#### Example Request
```http
GET /api/referral-user-dashboard?user_mid=USER123&period=month
```

#### Response Structure
```json
{
  "status": 1,
  "message": "Referral user dashboard data retrieved successfully",
  "data": {
    "user_info": {
      "id": 123,
      "name": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com",
      "mid": "USER123",
      "status": 1,
      "created_at": "2024-01-15T10:30:00.000000Z"
    },
    "period": "month",
    "business_data": {
      // Same structure as above business_data
    }
  }
}
```

## 🏗️ Database Schema

### Tables Used
1. **users**: User information and referral relationships
2. **aeps_transactions**: AEPS service transactions
3. **recharges**: Utility service transactions (mobile, DTH, bill)
4. **payouts**: Money transfer transactions
5. **cash_deposits**: Cash deposit transactions
6. **accounts_add_money**: Add fund transactions
7. **accounts**: User account information
8. **passbooks**: Account balance history

### Key Relationships
- Users linked via `refer_by` field (MID-based)
- Transactions linked to users via `user_id` or `mid`
- AEPS transactions use `mid` field for user identification
- Other transactions use standard `user_id` field

## 🎯 Business Analytics Metrics

### Transaction Types Tracked
1. **AEPS Services**
   - Cash Withdrawal (CW) - with amounts
   - Aadhaar Pay (M) - with amounts
   - Balance Enquiry (BE) - count only
   - Mini Statement (MS) - count only

2. **Utility Services**
   - Mobile Recharge (type=1)
   - DTH Recharge (type=2)
   - Bill Payment (type=3)

3. **Financial Services**
   - Payouts/Money Transfer
   - Add Fund Transactions
   - Cash Deposit Transactions

### Metrics Per Service
- **Count**: Total transactions
- **Success Count**: Successful transactions
- **Failed Count**: Failed transactions
- **Pending Count**: Pending transactions (where applicable)
- **Total Amount**: Sum of all transaction amounts
- **Success Amount**: Sum of successful transaction amounts

## 🔐 Security & Access Control

### Access Levels
1. **Super Admin**: Access to all referral data
2. **Admin**: Access to their referral network only
3. **User**: Access to their direct referrals only

### Access Validation
- 3-level deep referral verification
- MID-based relationship validation
- Cross-referral access prevention

## 💡 Frontend Implementation

### Recommended UI Components

#### 1. Referral List with Period Filter
```jsx
// Period selector buttons
<div className="period-selector">
  <button onClick={() => setPeriod('day')}>Today</button>
  <button onClick={() => setPeriod('month')}>This Month</button>
  <button onClick={() => setPeriod('year')}>This Year</button>
  <button onClick={() => setPeriod('all')}>All Time</button>
</div>

// Referral cards with business metrics
<div className="referral-cards">
  {referrals.map(user => (
    <ReferralCard 
      key={user.mid}
      user={user}
      businessData={user.business_data}
      onViewDetails={() => viewUserDashboard(user.mid)}
    />
  ))}
</div>
```

#### 2. Business Metrics Dashboard
```jsx
// Key metrics summary
<div className="metrics-grid">
  <MetricCard 
    title="Total Volume"
    value={businessData.summary.total_success_volume}
    period={period}
  />
  <MetricCard 
    title="AEPS Transactions"
    value={aepsData.cash_withdrawal.success_count}
    amount={aepsData.cash_withdrawal.success_amount}
  />
  <MetricCard 
    title="Utility Services"
    value={utilityData.mobile_recharge.success_count}
    amount={utilityData.mobile_recharge.success_amount}
  />
</div>
```

## 📊 Analytics Features

### Summary Calculations
- Total business volume across all services
- Success rate percentages
- Period-over-period comparisons
- Service-wise performance metrics

### Data Aggregation
- Real-time balance calculations
- Transaction success rates
- Period-based filtering
- Multi-level referral summaries

## 🔧 Technical Notes

### Performance Considerations
- Efficient query optimization for large datasets
- Proper indexing on user relationships and transaction tables
- Caching for frequently accessed referral data
- Pagination support for large referral networks

### Error Handling
- Graceful handling of missing data
- Fallback values for non-existent tables
- Access control validation
- Transaction integrity checks

## 🚀 Usage Examples

### Get Basic Referral List
```bash
curl -X GET "https://api.example.com/api/referrals" \
  -H "Authorization: Bearer {token}"
```

### Get Monthly Referral Analytics
```bash
curl -X GET "https://api.example.com/api/referrals?period=month&business_data=true" \
  -H "Authorization: Bearer {token}"
```

### Get Specific User Dashboard
```bash
curl -X GET "https://api.example.com/api/referral-user-dashboard?user_mid=USER123&period=month" \
  -H "Authorization: Bearer {token}"
```

This enhanced referral system provides comprehensive business intelligence for tracking and analyzing referral network performance across all financial services.