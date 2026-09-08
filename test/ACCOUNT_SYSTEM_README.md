# Account Management System API Documentation

## Overview
This document describes the Account Management and Passbook system APIs for the ERP application.

## Database Structure

### Accounts Table
```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    hold_amount DECIMAL(15,2) DEFAULT 0.00,
    created_by BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

### Passbooks Table
```sql
CREATE TABLE passbooks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    details TEXT NOT NULL,
    type ENUM('CR','DR') NOT NULL,
    pre_balance DECIMAL(15,2) DEFAULT 0.00,
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    created_by BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

## API Endpoints

### Account Management

#### 1. Get All Accounts
**GET** `/api/accounts`

**Description:** Retrieve all accounts for the authenticated user with current balances.

**Response:**
```json
{
    "status": 1,
    "message": "Accounts retrieved successfully",
    "data": {
        "accounts": [
            {
                "id": "1",
                "name": "Savings Account",
                "number": "****1234",
                "balance": "₹25,000",
                "available_balance": "₹25,000",
                "hold_amount": "₹0.00",
                "status": 1,
                "full_number": "1234567890",
                "raw_balance": 25000.00,
                "raw_available_balance": 25000.00,
                "raw_hold_amount": 0.00
            }
        ]
    }
}
```

#### 2. Create Account
**POST** `/api/accounts`

**Request Body:**
```json
{
    "user_id": 1,
    "name": "New Account",
    "number": "1234567890",
    "initial_balance": 1000.00
}
```

**Response:**
```json
{
    "status": 1,
    "message": "Account created successfully",
    "data": {
        "account": {
            "id": 1,
            "name": "New Account",
            "number": "****7890",
            "balance": "₹1,000.00",
            "status": 1
        }
    }
}
```

#### 3. Get Account Details
**GET** `/api/accounts/{id}`

**Response:**
```json
{
    "status": 1,
    "message": "Account details retrieved successfully",
    "data": {
        "account": {
            "id": 1,
            "name": "Savings Account",
            "number": "****1234",
            "balance": "₹25,000.00",
            "available_balance": "₹25,000.00",
            "hold_amount": "₹0.00",
            "status": 1,
            "created_at": "2025-08-14 10:30:00"
        },
        "recent_transactions": [
            {
                "id": 1,
                "details": "Account opening balance",
                "type": "CR",
                "amount": "+₹25,000.00",
                "balance": "₹25,000.00",
                "date": "2025-08-14 10:30:00"
            }
        ]
    }
}
```

#### 4. Update Account Status
**PUT** `/api/accounts/{id}/status`

**Request Body:**
```json
{
    "status": 0
}
```

### Passbook Management

#### 1. Create Transaction
**POST** `/api/passbook/transaction`

**Description:** Create a new debit or credit transaction.

**Request Body:**
```json
{
    "account_id": 1,
    "details": "Mobile recharge for 9876543210",
    "type": "DR",
    "amount": 299.00
}
```

**Response:**
```json
{
    "status": 1,
    "message": "Transaction created successfully",
    "data": {
        "transaction": {
            "id": 1,
            "details": "Mobile recharge for 9876543210",
            "type": "DR",
            "amount": "-₹299.00",
            "pre_balance": "₹25,000.00",
            "balance": "₹24,701.00",
            "date": "2025-08-14 11:00:00"
        }
    }
}
```

#### 2. Get Account Transactions
**GET** `/api/passbook/account/{accountId}/transactions?page=1&per_page=20`

**Response:**
```json
{
    "status": 1,
    "message": "Transactions retrieved successfully",
    "data": {
        "transactions": [
            {
                "id": 1,
                "details": "Mobile recharge for 9876543210",
                "type": "DR",
                "amount": "-₹299.00",
                "balance": "₹24,701.00",
                "date": "2025-08-14 11:00:00"
            }
        ],
        "pagination": {
            "current_page": 1,
            "last_page": 1,
            "per_page": 20,
            "total": 1
        }
    }
}
```

#### 3. Get Last Transaction
**GET** `/api/passbook/account/{accountId}/last-transaction`

**Description:** Get the most recent transaction for balance verification.

**Response:**
```json
{
    "status": 1,
    "message": "Last transaction retrieved successfully",
    "data": {
        "transaction": {
            "id": 1,
            "details": "Mobile recharge for 9876543210",
            "type": "DR",
            "amount": "-₹299.00",
            "balance": "₹24,701.00",
            "date": "2025-08-14 11:00:00"
        },
        "balance": "₹24,701.00",
        "raw_balance": 24701.00
    }
}
```

#### 4. Get Account Statement
**GET** `/api/passbook/account/{accountId}/statement?from_date=2025-08-01&to_date=2025-08-31&type=DR`

**Parameters:**
- `from_date` (optional): Filter transactions from this date
- `to_date` (optional): Filter transactions until this date  
- `type` (optional): Filter by transaction type (CR/DR)

**Response:**
```json
{
    "status": 1,
    "message": "Account statement retrieved successfully",
    "data": {
        "account": {
            "id": 1,
            "name": "Savings Account",
            "number": "****1234"
        },
        "statement": {
            "transactions": [
                {
                    "id": 1,
                    "details": "Mobile recharge for 9876543210",
                    "type": "DR",
                    "amount": "-₹299.00",
                    "pre_balance": "₹25,000.00",
                    "balance": "₹24,701.00",
                    "date": "2025-08-14 11:00:00"
                }
            ],
            "summary": {
                "total_credit": "₹25,000.00",
                "total_debit": "₹299.00",
                "net_balance": "₹24,701.00",
                "transaction_count": 2
            }
        }
    }
}
```

## Features

### Account Management
- Create user accounts with initial balance
- Manage account status (active/inactive)
- Track available balance vs hold amount
- Secure account number display (masked)

### Transaction System
- Real-time balance calculation
- Transaction history with passbook entries
- Support for both credit (CR) and debit (DR) transactions
- Pre-balance tracking for audit trail

### Security Features
- User-specific account access
- Authentication required for all operations
- Account number masking in responses
- Soft delete support

### Integration with Mobile Recharge
The account system is integrated with the mobile recharge functionality:
- Fetches user accounts for payment selection
- Creates debit transactions for recharge amounts
- Real-time balance updates
- Transaction history for recharge records

## Setup Instructions

1. Run migrations:
```bash
php artisan migrate
```

2. Seed sample accounts (optional):
```bash
php artisan db:seed --class=AccountSeeder
```

3. Run tests:
```bash
php artisan test --filter AccountApiTest
```

## Models

### Account Model
- Manages account data and relationships
- Provides formatted number and balance attributes
- Includes scopes for filtering active accounts
- Calculates available balance (balance - hold_amount)

### Passbook Model  
- Handles transaction records
- Supports credit/debit transaction types
- Maintains balance history
- Provides formatted amount display with signs

## Error Handling

All APIs return standardized error responses:

```json
{
    "status": 0,
    "message": "Error description",
    "error": "Detailed error information"
}
```

Common error scenarios:
- Insufficient balance for debit transactions
- Account not found or access denied
- Validation errors for required fields
- Server errors with detailed logging
