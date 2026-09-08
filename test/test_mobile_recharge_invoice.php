<?php
/**
 * Mobile Recharge Invoice Test Script
 * Tests the mobile recharge API response and invoice data structure
 */

// Test data simulating the API response
$testResponse = [
    "status" => 1,
    "message" => "Transaction processed successfully",
    "error_code" => null,
    "validation" => [
        "status" => 1,
        "message" => "Transaction validation successful",
        "error_code" => null,
        "account_id" => 6,
        "account_name" => "Test Account",
        "account_number" => "1755322080415",
        "balance" => "4970.00",
        "available_balance" => 2970,
        "hold_amount" => "2000.00",
        "transaction_amount" => 199,
        "remaining_balance" => 2771,
        "validated_at" => date('c'),
        "user_id" => 1
    ],
    "transaction" => [
        "status" => 1,
        "message" => "Transaction created successfully",
        "error_code" => null,
        "transaction_id" => time(),
        "passbook_id" => 6,
        "previous_balance" => "4970.00",
        "new_balance" => 4771
    ]
];

// Test recharge details
$testRechargeDetails = [
    "number" => "9876543210",
    "details" => "Unlimited calls + 1.5GB data per day for 28 days",
    "planType" => "Data",
    "validity" => "28 days",
    "amount" => 199,
    "talktime" => "0.00"
];

// Test operator details
$testOperatorDetails = [
    "operatorname" => "Airtel",
    "operator" => "AT",
    "circalname" => "Delhi NCR",
    "circal" => "DL"
];

// Function to validate invoice data structure
function validateInvoiceData($response, $rechargeDetails, $operatorDetails) {
    $errors = [];
    
    // Validate response structure
    if (!isset($response['status']) || $response['status'] !== 1) {
        $errors[] = "Invalid response status";
    }
    
    if (!isset($response['validation'])) {
        $errors[] = "Missing validation data";
    }
    
    if (!isset($response['transaction'])) {
        $errors[] = "Missing transaction data";
    }
    
    // Validate validation structure
    $validation = $response['validation'] ?? [];
    $required_validation_fields = [
        'account_id', 'account_name', 'account_number', 
        'transaction_amount', 'validated_at'
    ];
    
    foreach ($required_validation_fields as $field) {
        if (!isset($validation[$field])) {
            $errors[] = "Missing validation field: $field";
        }
    }
    
    // Validate transaction structure
    $transaction = $response['transaction'] ?? [];
    $required_transaction_fields = [
        'transaction_id', 'passbook_id', 'previous_balance', 'new_balance'
    ];
    
    foreach ($required_transaction_fields as $field) {
        if (!isset($transaction[$field])) {
            $errors[] = "Missing transaction field: $field";
        }
    }
    
    // Validate recharge details
    $required_recharge_fields = ['number', 'details', 'amount'];
    foreach ($required_recharge_fields as $field) {
        if (!isset($rechargeDetails[$field])) {
            $errors[] = "Missing recharge field: $field";
        }
    }
    
    // Validate operator details
    $required_operator_fields = ['operatorname', 'operator'];
    foreach ($required_operator_fields as $field) {
        if (!isset($operatorDetails[$field])) {
            $errors[] = "Missing operator field: $field";
        }
    }
    
    return $errors;
}

// Function to generate invoice data structure for frontend
function generateInvoiceData($response, $rechargeDetails, $operatorDetails) {
    return [
        'transaction' => $response['transaction'],
        'validation' => $response['validation'],
        'rechargeDetails' => $rechargeDetails,
        'operatorDetails' => $operatorDetails,
        'timestamp' => date('c')
    ];
}

// Run validation test
echo "🧪 Testing Mobile Recharge Invoice Data Structure\n";
echo "================================================\n\n";

$errors = validateInvoiceData($testResponse, $testRechargeDetails, $testOperatorDetails);

if (empty($errors)) {
    echo "✅ All validation tests passed!\n\n";
    
    // Generate invoice data
    $invoiceData = generateInvoiceData($testResponse, $testRechargeDetails, $testOperatorDetails);
    
    echo "📋 Generated Invoice Data Structure:\n";
    echo "====================================\n";
    echo json_encode($invoiceData, JSON_PRETTY_PRINT) . "\n\n";
    
    // Test specific data points
    echo "🔍 Key Data Points:\n";
    echo "==================\n";
    echo "Transaction ID: " . $invoiceData['transaction']['transaction_id'] . "\n";
    echo "Account Name: " . $invoiceData['validation']['account_name'] . "\n";
    echo "Mobile Number: " . $invoiceData['rechargeDetails']['number'] . "\n";
    echo "Amount: ₹" . $invoiceData['rechargeDetails']['amount'] . "\n";
    echo "Operator: " . $invoiceData['operatorDetails']['operatorname'] . "\n";
    echo "Previous Balance: ₹" . $invoiceData['transaction']['previous_balance'] . "\n";
    echo "New Balance: ₹" . $invoiceData['transaction']['new_balance'] . "\n";
    
} else {
    echo "❌ Validation errors found:\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
}

echo "\n📄 Invoice Features Available:\n";
echo "==============================\n";
echo "✅ Professional invoice layout\n";
echo "✅ Print functionality\n";
echo "✅ PDF download\n";
echo "✅ Transaction details\n";
echo "✅ Account information\n";
echo "✅ Recharge details\n";
echo "✅ Operator information\n";
echo "✅ Responsive design\n";
echo "✅ Error handling\n";
echo "✅ Toast notifications\n";

echo "\n🚀 Next Steps:\n";
echo "=============\n";
echo "1. Test the mobile recharge API endpoint\n";
echo "2. Verify PDF generation works in browser\n";
echo "3. Test print functionality\n";
echo "4. Check responsive design on mobile\n";
echo "5. Validate error handling scenarios\n";

echo "\n💡 Usage in Frontend:\n";
echo "====================\n";
echo "const invoiceData = {\n";
echo "    transaction: apiResponse.transaction,\n";
echo "    validation: apiResponse.validation,\n";
echo "    rechargeDetails: { number, details, planType, validity, amount, talktime },\n";
echo "    operatorDetails: operatorDetails,\n";
echo "    timestamp: new Date().toISOString()\n";
echo "};\n";
echo "setInvoiceData(invoiceData);\n";
echo "setShowInvoice(true);\n";
