const apiDocs = {
    "Mobile Recharge": [
        {
            id: "mrecharge-1",
            category: "Mobile Recharge",
            name: "Fetch Mobile Plans",
            method: "POST",
            path: "/api/v2/mobile-plan",
            description: "Fetch latest prepaid recharge plans & offers for selected operator and circle.",
            request: {
                number: "9876543210"
            },
            response: {
                status: "success",
                code: 200,
                plans: [
                    { id: "P239", price: 239, validity: "28 Days", data: "1.5GB/Day", talktime: "Unlimited", description: "Truly unlimited calls + 1.5GB daily data" },
                    { id: "P299", price: 299, validity: "28 Days", data: "2GB/Day", talktime: "Unlimited", description: "Truly unlimited calls + 2GB daily data + Disney+ Hotstar" }
                ]
            },
            fieldDocs: [
                { field: "number", type: "string", required: true, description: "10-digit mobile number" },
            ]
        },
        {
            id: "mrecharge-2",
            category: "Mobile Recharge",
            name: "Process Mobile Recharge",
            method: "POST",
            path: "/api/v2/mobile-recharge",
            description: "Execute instant prepaid or postpaid mobile recharge transaction.",
            request: {
                number: "9876543210",
                operator: 'AT',
                circle: '2',
                amount: 239,
                type: 1
            },
            response: {
                status: 1,
                message: "Mobile Recharge Successful",
                data: {
                    orderId: "REC98172635",
                    txnId: "OP991827361",
                    resText: "Recharge Success",
                    operator: "AT"
                }
            },
            fieldDocs: [
                { field: "number", type: "string", required: true, description: "Customer 10-digit mobile number" },
                { field: "operator", type: "string", required: true, description: "Operator code" },
                { field: "circle", type: "string", required: true, description: "circal code only required id Mobile Prepaid" },
                { field: "amount", type: "number", required: true, description: "Recharge amount in INR" },
                { field: "type", type: "string", required: true, description: "Type 1 for Prepaid and 2 for DTH and 3 for Bill Payment" }
            ]
        },
        {
            id: "mrecharge-3",
            category: "Mobile Recharge",
            name: "Recharge Status Check",
            method: "POST",
            path: "/api/v2/recharge-status",
            description: "Query real-time status of a mobile recharge transaction.",
            request: {
                txnid: "REC98172635",
            },
            response: {
                status: 1,
                message: "Recharge Status Success",
            },
            fieldDocs: [
                { field: "txnid", type: "string", required: false, description: "System transaction ID" }
            ]
        }
    ],

    "Bill Payment": [
        {
            id: "bill-1",
            category: "Bill Payment",
            name: "Get Bill Categories",
            method: "GET",
            path: "/api/v2/bill-categories",
            description: "Fetch list of available BBPS utility bill categories (Electricity, Water, Gas, Broadband, DTH, LPG).",
            request: {},
            response: {
                status: "success",
                categories: [
                    { id: "cat_1", name: "Electricity", code: "ELECTRICITY", icon: "fa-bolt" },
                    { id: "cat_2", name: "Water", code: "WATER", icon: "fa-tint" },
                    { id: "cat_3", name: "Piped Gas", code: "GAS", icon: "fa-fire" },
                    { id: "cat_4", name: "Broadband", code: "BROADBAND", icon: "fa-wifi" },
                    { id: "cat_5", name: "DTH", code: "DTH", icon: "fa-tv" },
                    { id: "cat_6", name: "LPG Cylinder", code: "LPG", icon: "fa-burn" }
                ]
            },
            fieldDocs: []
        },
        {
            id: "bill-2",
            category: "Bill Payment",
            name: "Get Billers by Category",
            method: "POST",
            path: "/api/v2/billers-by-category",
            description: "Fetch billers list and required input parameters for a specific category.",
            request: {
                category: "Electric"
            },
            response: {
                "status": 1,
                "message": "Billers fetched successfully",
                "billers": [
                    {
                        "id": 35,
                        "type": "ElectriCitymh",
                        "state": "13",
                        "code": "323",
                        "name": "Adani Electricity",
                        "category": "Electric",
                        "label": "Consumer Number",
                        "icon": "https://nexusmudra.com/banking/Uploads/OpratorImage/icons/bharat-billpay.png",
                        "biller_icon": "https://icchhamatidataservice.com/assets/b-icon.png",
                        "is_active": true,
                        "popular": 1,
                        "created_at": "2025-08-18T06:18:07.000000Z",
                        "updated_at": "2025-08-18T06:18:07.000000Z"
                    },
                    {
                        "id": 46,
                        "type": "ElectriCityra",
                        "state": "19",
                        "code": "331",
                        "name": "Ajmer Vidyut Vitran Nigam Limited",
                        "category": "Electric",
                        "label": "Consumer Number",
                        "icon": "https://nexusmudra.com/banking/Uploads/OpratorImage/icons/bharat-billpay.png",
                        "biller_icon": "https://icchhamatidataservice.com/assets/b-icon.png",
                        "is_active": true,
                        "popular": 1,
                        "created_at": "2025-08-18T06:18:07.000000Z",
                        "updated_at": "2025-08-18T06:18:07.000000Z"
                    },
                    {
                        "id": 1,
                        "type": "ElectriCityap",
                        "state": "1",
                        "code": "APCPDCL",
                        "name": "APCPDCL - Andhra Pradesh",
                        "category": "Electric",
                        "label": "Consumer Number",
                        "icon": "https://nexusmudra.com/banking/Uploads/OpratorImage/icons/bharat-billpay.png",
                        "biller_icon": "https://icchhamatidataservice.com/assets/b-icon.png",
                        "is_active": true,
                        "popular": 1,
                        "created_at": "2025-08-18T06:18:07.000000Z",
                        "updated_at": "2025-08-18T06:18:07.000000Z"
                    }
                ]
            },
            fieldDocs: [
                { field: "category", type: "string", required: true, description: "Category code (e.g. ELECTRICITY, WATER, GAS, DTH)" }
            ]
        },
        {
            id: "bill-3",
            category: "Bill Payment",
            name: "Fetch Bill Details",
            method: "POST",
            path: "/api/v2/fetch-bill",
            description: "Fetch live bill amount, due date, and customer name from biller before payment.",
            request: {
                biller_code: "BSES0001",
                customer_id: "100012345"
            },
            response: {
                status: "success",
                billDetails: {
                    billerId: "BSES0001",
                    customerName: "RAMESH CHANDRA",
                    billNumber: "BILL-2026-8812",
                    billDate: "2026-08-25",
                    dueDate: "2026-09-10",
                    amount: 1450.00,
                    fetchRefId: "FETCH98172635"
                }
            },
            fieldDocs: [
                { field: "billerId", type: "string", required: true, description: "Unique Biller ID" },
                { field: "customerKey", type: "string", required: true, description: "Account Number / CA Number / Consumer ID" }
            ]
        },
        {
            id: "bill-4",
            category: "Bill Payment",
            name: "Pay Utility Bill",
            method: "POST",
            path: "/api/v2/bill-payment",
            description: "Execute bill payment transaction for fetched utility bill.",
            request: {
                number: "9876543210",
                operator: 'AT',
                circle: '2',
                amount: 239,
                type: 1
            },
            response: {
                status: 1,
                message: "Mobile Recharge Successful",
                data: {
                    orderId: "REC98172635",
                    txnId: "OP991827361",
                    resText: "Recharge Success",
                    operator: "AT"
                }
            },
            fieldDocs: [
                { field: "number", type: "string", required: true, description: "Providor Customer ID" },
                { field: "operator", type: "string", required: true, description: "Operator code" },
                { field: "amount", type: "number", required: true, description: "Recharge amount in INR" },
                { field: "type", type: "string", required: true, description: "Type 3 for Bill Payment" }
            ]
        },
        {
            id: "bill-5",
            category: "Bill Payment",
            name: "Bill Payment Status",
            method: "POST",
            path: "/api/v2/bill-status",
            description: "Query payment status of a utility bill transaction.",
            request: {
                txnid: "REC98172635",
            },
            response: {
                status: 1,
                message: "Recharge Status Success",
            },
            fieldDocs: [
                { field: "txnid", type: "string", required: false, description: "System transaction ID" }
            ]
        }
    ],

    "AEPS": [
        {
            id: "aeps-1",
            category: "AEPS",
            name: "Fetch State List",
            method: "GET",
            path: "/api/v2/aeps/state-list",
            description: "Fetch the list of states supported for AEPS onboarding.",
            request: {},
            response: {
                status: 1,
                message: "State fetch successfully",
                data: [
                    { stateId: "1", stateName: "ANDHRA PRADESH" },
                    { stateId: "2", stateName: "BIHAR" },
                    { stateId: "3", stateName: "DELHI" }
                ]
            },
            fieldDocs: []
        },
        {
            id: "aeps-2",
            category: "AEPS",
            name: "Create / Update AEPS Agent Draft",
            method: "POST",
            path: "/api/v2/aeps/draft",
            description: "Create or update merchant AEPS registration draft details including location, shop, personal, and bank info.",
            request: {
                latitude: "28.6139",
                longitude: "77.2090",
                shop_name: "Bharat Telecom",
                shop_address: "Shop No 12, Main Market",
                shop_city: "New Delhi",
                shop_district: "South Delhi",
                state_id: "Delhi",
                shop_pin_code: "110001",
                full_name: "Rahul Verma",
                phone: "9876543210",
                email: "rahul@example.com",
                pan_no: "ABCDE1234F",
                aadhaar_number: "123456789012",
                account_number: "918273645012",
                ifsc_code: "SBIN0001234",
                bank_name: "State Bank of India",
                bank_branch: "Connaught Place"
            },
            response: {
                status: 1,
                message: "AEPS draft created successfully",
                data: {
                    id: 105,
                    mid: "BP100293",
                    outletId: "BP100293",
                    full_name: "Rahul Verma",
                    phone: "9876543210",
                    pan_no: "ABCDE1234F",
                    aadhaar_number: "123456789012",
                    status: "draft"
                }
            },
            fieldDocs: [
                { field: "latitude", type: "string", required: true, description: "Shop location latitude" },
                { field: "longitude", type: "string", required: true, description: "Shop location longitude" },
                { field: "shop_name", type: "string", required: true, description: "Shop/Business name" },
                { field: "shop_address", type: "string", required: true, description: "Shop address details" },
                { field: "shop_city", type: "string", required: true, description: "City name" },
                { field: "shop_district", type: "string", required: true, description: "District name" },
                { field: "state_id", type: "string", required: true, description: "State name / ID" },
                { field: "shop_pin_code", type: "string", required: true, description: "6-digit postal pincode" },
                { field: "full_name", type: "string", required: true, description: "Agent full name" },
                { field: "phone", type: "string", required: true, description: "10-digit mobile number" },
                { field: "email", type: "string", required: true, description: "Valid email address" },
                { field: "pan_no", type: "string", required: true, description: "10-character PAN number" },
                { field: "aadhaar_number", type: "string", required: true, description: "12-digit Aadhaar number" },
                { field: "account_number", type: "string", required: true, description: "Bank account number (9 to 18 digits)" },
                { field: "ifsc_code", type: "string", required: true, description: "11-character bank IFSC code" },
                { field: "bank_name", type: "string", required: true, description: "Bank name" },
                { field: "bank_branch", type: "string", required: true, description: "Bank branch name" }
            ]
        },
        {
            id: "aeps-3",
            category: "AEPS",
            name: "Get AEPS Draft Data",
            method: "POST",
            path: "/api/v2/aeps/draft-data",
            description: "Fetch current draft status and details for an outlet ID (MID).",
            request: {
                outletId: "BP100293"
            },
            response: {
                status: 1,
                data: {
                    id: 105,
                    mid: "BP100293",
                    full_name: "Rahul Verma",
                    phone: "9876543210",
                    email: "rahul@example.com",
                    pan_no: "ABCDE1234F",
                    aadhaar_number: "123456789012",
                    phone_verified_at: 1,
                    email_verified_at: 1,
                    aadhaar_verified_at: 1,
                    pan_verified_at: 1,
                    bank_verified_at: 1,
                    aeps_status: 1
                }
            },
            fieldDocs: [
                { field: "outletId", type: "string", required: true, description: "Merchant Outlet ID (MID)" }
            ]
        },
        {
            id: "aeps-4",
            category: "AEPS",
            name: "Send Mobile OTP for AEPS Draft",
            method: "POST",
            path: "/api/v2/aeps/send-mobile-otp",
            description: "Send verification OTP to agent registered mobile number using PAN number.",
            request: {
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "Verification OTP sent"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-5",
            category: "AEPS",
            name: "Verify Mobile OTP",
            method: "POST",
            path: "/api/v2/aeps/verify-mobile-otp",
            description: "Verify 6-digit OTP sent to agent mobile number.",
            request: {
                pan_no: "ABCDE1234F",
                otp: "123456"
            },
            response: {
                status: 1,
                message: "OTP verified successfully"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "otp", type: "string", required: true, description: "6-digit OTP received on mobile" }
            ]
        },
        {
            id: "aeps-6",
            category: "AEPS",
            name: "Send Email OTP for AEPS Draft",
            method: "POST",
            path: "/api/v2/aeps/send-email-otp",
            description: "Send verification OTP to agent email address using PAN number.",
            request: {
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "Verification OTP sent"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-7",
            category: "AEPS",
            name: "Verify Email OTP",
            method: "POST",
            path: "/api/v2/aeps/verify-email-otp",
            description: "Verify 6-digit OTP sent to agent email address.",
            request: {
                pan_no: "ABCDE1234F",
                otp: "123456"
            },
            response: {
                status: 1,
                message: "OTP verified successfully"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "otp", type: "string", required: true, description: "6-digit OTP received on email" }
            ]
        },
        {
            id: "aeps-8",
            category: "AEPS",
            name: "Send Aadhaar OTP for Onboarding",
            method: "POST",
            path: "/api/v2/aeps/send-aadhaar-otp",
            description: "Send UIDAI OTP to registered mobile number linked with Aadhaar.",
            request: {
                pan_no: "ABCDE1234F",
                aadhaar: "123456789012"
            },
            response: {
                status: 1,
                message: "OTP sent successfully",
                txnid: "REQ99182736"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "aadhaar", type: "string", required: false, description: "12-digit Aadhaar number (optional if available in draft)" }
            ]
        },
        {
            id: "aeps-9",
            category: "AEPS",
            name: "Verify Aadhaar OTP for Onboarding",
            method: "POST",
            path: "/api/v2/aeps/verify-aadhaar-otp",
            description: "Verify Aadhaar OTP for eKYC verification during onboarding.",
            request: {
                pan_no: "ABCDE1234F",
                txnid: "REQ99182736",
                otp: "123456"
            },
            response: {
                status: 1,
                message: "Aadhaar verified successfully"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "txnid", type: "string", required: true, description: "Aadhaar OTP request transaction/reference ID" },
                { field: "otp", type: "string", required: true, description: "6-digit OTP code received on mobile" }
            ]
        },
        {
            id: "aeps-10",
            category: "AEPS",
            name: "Verify Agent PAN Card",
            method: "POST",
            path: "/api/v2/aeps/verify-pan",
            description: "Verify PAN card against NSDL database and match name with draft.",
            request: {
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "PAN verified successfully"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-11",
            category: "AEPS",
            name: "Verify Agent Settlement Bank Account",
            method: "POST",
            path: "/api/v2/aeps/verify-bank-account",
            description: "Verify settlement bank account via penny drop and match account name.",
            request: {
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "Bank account verified successfully"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-12",
            category: "AEPS",
            name: "KYC Token Generate",
            method: "POST",
            path: "/api/v2/aeps/generate-upload-token",
            description: "Generate token for video upload.",
            request: {
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "Token generated successfully",
                data: "token_string"
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-13",
            category: "AEPS",
            name: "Upload Shop Image",
            method: "POST",
            path: "/api/v2/aeps/upload-shop-image",
            description: "Upload shop image.",
            request: {
                pan_no: "ABCDE1234F",
                image: "file",
                image_type: "shop_inner",
                latitude: "28.6139",
                longitude: "77.2090"
            },
            response: {
                status: 1,
                message: "Shop image uploaded successfully",
                data: {
                    image_url: 'https://example.com/image.jpg',
                    image_type: 'shop_inner'
                }
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "image", type: "file", required: true, description: "Image file (PNG/JPG, max 500KB)" },
                { field: "image_type", type: "string", required: true, description: "Image type (shop_inner/shop_outer)" },
                { field: "latitude", type: "string", required: true, description: "Latitude" },
                { field: "longitude", type: "string", required: true, description: "Longitude" }
            ]
        },
        {
            id: "aeps-14",
            category: "AEPS",
            name: "Upload Video KYC",
            method: "POST",
            path: "/api/v2/aeps/upload-video-kyc",
            description: "Upload video kyc.",
            request: {
                pan_no: "ABCDE1234F",
                video_url: "video.mp4",
                latitude: "28.6139",
                longitude: "77.2090"
            },
            response: {
                status: 1,
                message: "Video KYC uploaded successfully",
                data: {
                    video_url: 'https://example.com/video.mp4',
                }
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "video_url", type: "file", required: true, description: "Video file (MP4, max 20MB)" },
                { field: "latitude", type: "string", required: true, description: "Latitude" },
                { field: "longitude", type: "string", required: true, description: "Longitude" }
            ]
        },
        {
            id: "aeps-15",
            category: "AEPS",
            name: "Merchant Simple Onboarding",
            method: "POST",
            path: "/api/v2/aeps/onboard",
            description: "Submit verified merchant draft to Fingpay server for AEPS merchant creation.",
            request: {
                aeps_draft_id: 105,
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "AEPS Onboarding successful",
                data: {
                    mid: "BP100293",
                    primaryKeyId: "89172",
                    encodeFPTxnId: "ENC_FP_TXN_99182"
                }
            },
            fieldDocs: [
                { field: "aeps_draft_id", type: "number", required: true, description: "AEPS Draft ID" },
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-16",
            category: "AEPS",
            name: "Biometric eKYC Send OTP",
            method: "POST",
            path: "/api/v2/aeps/get-otp",
            description: "Initiate eKYC OTP verification request to UIDAI for merchant biometric eKYC.",
            request: {
                latitude: "28.6139",
                longitude: "77.2090",
                deviceIMEI: "MANTRA_MFST100_SERIAL123",
                pan_no: "ABCDE1234F"
            },
            response: {
                status: 1,
                message: "Success",
                data: {
                    status: true,
                    message: "OTP sent successfully",
                    primaryKeyId: "89172",
                    encodeFPTxnId: "ENC_FP_TXN_99182"
                }
            },
            fieldDocs: [
                { field: "latitude", type: "number", required: true, description: "Current GPS latitude" },
                { field: "longitude", type: "number", required: true, description: "Current GPS longitude" },
                { field: "deviceIMEI", type: "string", required: true, description: "Biometric Scanner Serial Number / IMEI" },
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" }
            ]
        },
        {
            id: "aeps-17",
            category: "AEPS",
            name: "Biometric eKYC Validate OTP",
            method: "POST",
            path: "/api/v2/aeps/verify-otp",
            description: "Validate eKYC OTP received on merchant registered mobile.",
            request: {
                pan_no: "ABCDE1234F",
                deviceIMEI: "MANTRA_MFST100_SERIAL123",
                otp: "123456",
                primaryKeyId: "89172",
                encodeFPTxnId: "ENC_FP_TXN_99182"
            },
            response: {
                status: 1,
                message: "Success",
                data: {
                    status: true,
                    message: "OTP validated successfully"
                }
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "deviceIMEI", type: "string", required: true, description: "Biometric Scanner Serial / IMEI" },
                { field: "otp", type: "number", required: true, description: "6-digit OTP code received" },
                { field: "primaryKeyId", type: "string", required: true, description: "Primary Key ID received from send-otp" },
                { field: "encodeFPTxnId", type: "string", required: true, description: "Encoded FP Transaction ID received from send-otp" }
            ]
        },
        {
            id: "aeps-18",
            category: "AEPS",
            name: "Biometric eKYC Authentication",
            method: "POST",
            path: "/api/v2/aeps/biometric-ekyc",
            description: "Perform merchant fingerprint biometric authentication for completing eKYC.",
            request: {
                pan_no: "ABCDE1234F",
                deviceIMEI: "MANTRA_MFST100_SERIAL123",
                xml: "<?xml version=\"1.0\"?><PidData><Resp errCode=\"0\" errInfo=\"Success\" fCount=\"1\" fType=\"2\" qScore=\"89\"/><DeviceInfo dpId=\"...\" rdsId=\"...\" rdsVer=\"...\" dc=\"...\" mi=\"...\" mc=\"...\"/><Skey ci=\"...\">SESSION_KEY_STRING</Skey><Hmac>HMAC_STRING</Hmac><Data type=\"X\">PID_DATA_STRING</Data></PidData>",
                primaryKeyId: "89172",
                encodeFPTxnId: "ENC_FP_TXN_99182"
            },
            response: {
                status: 1,
                message: "Success",
                data: {
                    status: true,
                    message: "Biometric eKYC completed successfully"
                }
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "deviceIMEI", type: "string", required: true, description: "Biometric Device Serial / IMEI" },
                { field: "xml", type: "string", required: true, description: "Captured RD Service PID XML data string" },
                { field: "primaryKeyId", type: "string", required: true, description: "Primary Key ID" },
                { field: "encodeFPTxnId", type: "string", required: true, description: "Encoded FP Transaction ID" }
            ]
        },
        {
            id: "aeps-19",
            category: "AEPS",
            name: "Change Registered Biometric Device",
            method: "POST",
            path: "/api/v2/aeps/change-device",
            description: "Update registered biometric scanner device name and IMEI / Serial Number for merchant.",
            request: {
                outletId: "BP100293",
                pan_no: "ABCDE1234F",
                deviceIMEI: "MANTRA_MFST100_SERIAL456",
                deviceName: "Mantra MFS100",
                mposSerialNumber: "MPOS991827"
            },
            response: {
                status: 1,
                message: "Device information updated successfully",
                data: {
                    outletId: "BP100293",
                    deviceName: "Mantra MFS100",
                    deviceIMEI: "MANTRA_MFST100_SERIAL456"
                }
            },
            fieldDocs: [
                { field: "outletId", type: "string", required: false, description: "Merchant Outlet ID (MID)" },
                { field: "pan_no", type: "string", required: false, description: "Agent PAN Number" },
                { field: "deviceIMEI", type: "string", required: true, description: "New Device IMEI / Serial Number" },
                { field: "deviceName", type: "string", required: true, description: "Device Model Name (e.g., Mantra MFS100, Morpho)" },
                { field: "mposSerialNumber", type: "string", required: false, description: "mPOS Serial Number (optional)" }
            ]
        },
        {
            id: "aeps-19",
            category: "AEPS",
            name: "Merchant 2FA Daily Authentication",
            method: "POST",
            path: "/api/v2/aeps/2fa",
            description: "Perform daily mandatory 2FA merchant fingerprint biometric authentication.",
            request: {
                pan_no: "ABCDE1234F",
                deviceIMEI: "MANTRA_MFST100_SERIAL123",
                xml: "<?xml version=\"1.0\"?><PidData><Resp errCode=\"0\" errInfo=\"Success\" fCount=\"1\" fType=\"2\" qScore=\"89\"/><DeviceInfo dpId=\"...\" rdsId=\"...\" rdsVer=\"...\" dc=\"...\" mi=\"...\" mc=\"...\"/><Skey ci=\"...\">SESSION_KEY_STRING</Skey><Hmac>HMAC_STRING</Hmac><Data type=\"X\">PID_DATA_STRING</Data></PidData>",
                serviceType: "AEPS"
            },
            response: {
                status: 1,
                message: "Success",
                data: {
                    status: true,
                    message: "2FA Authentication Successful"
                }
            },
            fieldDocs: [
                { field: "pan_no", type: "string", required: true, description: "Agent 10-character PAN number" },
                { field: "deviceIMEI", type: "string", required: true, description: "Biometric Device Serial / IMEI" },
                { field: "xml", type: "string", required: true, description: "Captured RD Service PID XML string" },
                { field: "serviceType", type: "string", required: false, description: "Service type: AEPS (default) or AP (Aadhaar Pay)" }
            ]
        },
        {
            id: "aeps-20",
            category: "AEPS",
            name: "Execute AEPS Transaction (CW, BE, MS, AP)",
            method: "POST",
            path: "/api/v2/aeps/doAeps",
            description: "Process AEPS transactions: Cash Withdrawal (CW), Balance Enquiry (BE), Mini Statement (MS), or Aadhaar Pay (M).",
            request: {
                outletId: "BP100293",
                customerMobile: "9876543210",
                aadhaarNumber: "123456789012",
                bankID: "607152",
                bankName: "State Bank of India",
                deviceType: "Mantra",
                aepsType: "CW",
                amount: 2000,
                xml: "<?xml version=\"1.0\"?><PidData><Resp errCode=\"0\" errInfo=\"Success\" fCount=\"1\" fType=\"2\" qScore=\"89\"/><DeviceInfo dpId=\"...\" rdsId=\"...\" rdsVer=\"...\" dc=\"...\" mi=\"...\" mc=\"...\"/><Skey ci=\"...\">SESSION_KEY_STRING</Skey><Hmac>HMAC_STRING</Hmac><Data type=\"X\">PID_DATA_STRING</Data></PidData>"
            },
            response: {
                status: 1,
                message: "Transaction successful",
                data: {
                    status: true,
                    statusCode: 10000,
                    message: "Transaction Successful",
                    fpTransactionId: "FP98172635",
                    bankRRN: "429102938172",
                    balanceAmount: "5420.50",
                    transactionAmount: 2000
                },
                shop_name: "Bharat Telecom",
                shop_phone: "9876543210"
            },
            fieldDocs: [
                { field: "outletId", type: "string", required: true, description: "Merchant Outlet ID (MID)" },
                { field: "customerMobile", type: "string", required: true, description: "10-digit customer mobile number" },
                { field: "aadhaarNumber", type: "string", required: true, description: "Customer 12-digit Aadhaar number" },
                { field: "bankID", type: "string", required: true, description: "Bank IIN / National Bank Identification Number" },
                { field: "bankName", type: "string", required: true, description: "Customer bank name" },
                { field: "deviceType", type: "string", required: true, description: "Biometric device manufacturer name" },
                { field: "aepsType", type: "string", required: true, description: "CW (Cash Withdrawal), BE (Balance Enquiry), MS (Mini Statement), M (Aadhaar Pay)" },
                { field: "amount", type: "number", required: false, description: "Transaction amount in INR (required for CW & M)" },
                { field: "xml", type: "string", required: true, description: "Biometric fingerprint PID XML string" }
            ]
        },
        {
            id: "aeps-21",
            category: "AEPS",
            name: "Send OTP for High-Amount AEPS / Aadhaar Pay",
            method: "POST",
            path: "/api/v2/aeps/send-aeps-otp",
            description: "Send transaction authorization OTP for high-amount Cash Withdrawal (CW >= 5000) or Aadhaar Pay (M).",
            request: {
                outletId: "BP100293",
                customerMobile: "9876543210",
                aadhaarNumber: "123456789012",
                bankID: "607152",
                aepsType: "CW",
                amount: 5000
            },
            response: {
                status: 1,
                message: "OTP sent successfully",
                fpTransactionId: "FPOTP981726",
                txnOtpRequestId: "FPOTP981726"
            },
            fieldDocs: [
                { field: "outletId", type: "string", required: true, description: "Merchant Outlet ID (MID)" },
                { field: "customerMobile", type: "string", required: true, description: "Customer 10-digit mobile number" },
                { field: "aadhaarNumber", type: "string", required: true, description: "Customer 12-digit Aadhaar number" },
                { field: "bankID", type: "string", required: true, description: "Bank IIN / ID" },
                { field: "aepsType", type: "string", required: true, description: "CW (Cash Withdrawal) or M (Aadhaar Pay)" },
                { field: "amount", type: "number", required: true, description: "Transaction amount in INR (min 5000 for CW)" }
            ]
        }
    ],

    "MATM": [
        {
            id: "matm-1",
            category: "MATM",
            name: "MATM Config / Init",
            method: "POST",
            path: "/api/v2/matm-config",
            description: "Fetch encrypted MATM SDK configuration parameters for merchant login or transaction initialization.",
            request: {
                outletId: "BP100293",
                type: "doTransaction"
            },
            response: {
                status: 1,
                message: "Data fetched successfully",
                data: "ENCRYPTED_AES256_BASE64_STRING"
            },
            fieldDocs: [
                { field: "outletId", type: "string", required: true, description: "Merchant Outlet ID (MID)" },
                { field: "type", type: "string", required: true, description: "Type of configuration ('login' or 'doTransaction')" },
            ]
        },
        {
            id: "matm-2",
            category: "MATM",
            name: "MATM Process Request / Settlement",
            method: "POST",
            path: "/api/v2/matm-request",
            description: "Submit Micro ATM (MATM) transaction result and update transaction status & wallet settlement.",
            request: {
                "outletId": "AGENT1397",
                "mobile": "9545449641",
                "data": {
                    "terminalId": "NSD60705",
                    "requestTransactionTime": "04\/09\/2026 13:26:36",
                    "transactionAmount": 1000,
                    "transactionStatus": "successful",
                    "balanceAmount": 613.07,
                    "bankRRN": "624713426597",
                    "transactionType": "WDLS",
                    "fpTransactionId": "MACB7916913040926132636021W",
                    "errorCode": "00",
                    "errorMessage": "Success",
                    "merchantTransactionId": "MATM17885085792689",
                    "arpc": "910A5FECDAD829CAFEED00108A0230309F36020055",
                    "cardType": "MasterCard",
                    "bankName": "State Bank of India",
                    "cardNumber": "************3808"
                }
            },
            response: {
                status: 1,
                message: "MATM Request processed successfully"
            },
            fieldDocs: [
                { field: "outletId", type: "string", required: true, description: "Merchant Outlet ID (MID)" },
                { field: "mobile", type: "string", required: true, description: "Customer 10-digit mobile number" },
                { field: "mposSerialNumber", type: "string", required: false, description: "mPOS Device Serial Number" },
                { field: "data", type: "object", required: true, description: "MATM SDK transaction result data object (if not same as example object you do same as example)" }
            ]
        }
    ],

    "Payment Gateway": [
        {
            id: "pg-1",
            category: "Payment Gateway",
            name: "Create Payment Order / Link",
            method: "POST",
            path: "/api/pg/request",
            description: "Create a checkout order or payment link to collect payments via UPI, Credit/Debit Card, NetBanking.",
            request: {
                reference_id: "ORD_PG_998172",
                amount: 5000,
                name: "Vikram Singh",
                email: "vikram@example.com",
                mobile_number: "9876543210",
                success_url: "https://mywebsite.com/checkout/callback",
                failure_url: "https://mywebsite.com/checkout/callback"
            },
            response: {
                status: 1,
                message: "Payment order created successfully",
                data: {
                    order_id: "ORD_PG_998172",
                    payment_url: "https://example.com/checkout/ORD_PG_998172",
                    amount: 5000,
                    status: "PENDING"
                }
            },
            fieldDocs: [
                { field: "reference_id", type: "string", required: true, description: "Unique reference ID for the order" },
                { field: "amount", type: "number", required: true, description: "Order amount in INR" },
                { field: "name", type: "string", required: true, description: "Payer full name" },
                { field: "email", type: "string", required: false, description: "Payer email address" },
                { field: "mobile_number", type: "string", required: true, description: "Payer mobile number" },
                { field: "success_url", type: "string", required: false, description: "Success redirect URL" },
                { field: "failure_url", type: "string", required: false, description: "Failure redirect URL" }
            ]
        },
        {
            id: "pg-2",
            category: "Payment Gateway",
            name: "Verify Payment",
            method: "POST",
            path: "/api/pg/verify",
            description: "Verify payment status with transaction hash and credit merchant wallet.",
            request: {
                txnid: "ORD_PG_998172"
            },
            response: {
                status: 1,
                message: "Payment Status fetched successfully",
                data: {
                    txnid: "ORD_PG_998172",
                    status: "success",
                    created_at: "2026-09-02 17:34:00"
                }
            },
            fieldDocs: [
                { field: "txnid", type: "string", required: true, description: "Payment Gateway Order ID" }
            ]
        },
    ],

    "QR/UPI Generate": [
        {
            id: "upi-1",
            category: "QR/UPI Generate",
            name: "Generate Dynamic UPI QR",
            method: "POST",
            path: "/api/v2/generate-qr",
            description: "Generate dynamic instant QR code for specific amount payment collection.",
            request: {
                name: 'RAM KUMAR',
                account_number: "5124587845215",
                account_ifsc: "IBKL0001855"
            },
            response: {
                status: "success",
                code: 200,
                data: {
                    virtual_account_id: "QR9981726",
                    virtual_upi_handle: "virtual_upi_handle",
                    qrcode_image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                    qrcode_pdf: "data:application/pdf;base64,JVBERi0xLjc...",
                }
            },
            fieldDocs: [
                { field: "name", type: "string", required: true, description: "Customer Name" },
                { field: "account_number", type: "string", required: false, description: "Customer Account Number" },
                { field: "account_ifsc", type: "string", required: false, description: "Customer IFSC Code" }
            ]
        }
    ],

    "Money Transfer & Beneficiaries": [
        {
            id: "dmt-1",
            category: "Money Transfer & Beneficiaries",
            name: "Create Beneficiary",
            method: "POST",
            path: "/api/v2/beneficiaries/create",
            description: "Check if money transfer sender mobile is registered; register new sender if not found.",
            request: {
                name: "RAM KUMAR",
                mobile: "8115859360",
                account: "5124587845215",
                confirmAccount: "5124587845215",
                ifsc: "IBKL0001855"
            },
            response: {
                status: 1,
                message: "Beneficiary added successfully",
                data: {
                    'id': 12,
                    'name': 'RAM KUMAR',
                    'mobile': '8115859360',
                    'account': '5124587845215',
                    'ifsc': 'IBKL0001855',
                    'bank': "ICICI Bank",
                    'branch': "Lucknow",
                    'status': "pending",
                    'created_by': '2023-12-21 12:00:00'
                }
            },
            fieldDocs: [
                { field: "mobile", type: "string", required: true, description: "Sender 10-digit mobile number" },
                { field: "name", type: "string", required: true, description: "Beneficiary Name" },
                { field: "account", type: "string", required: true, description: "Account Number" },
                { field: "confirmAccount", type: "string", required: true, description: "Confirm Account Number" },
                { field: "ifsc", type: "string", required: true, description: "IFSC Code" }
            ]
        },
        {
            id: "dmt-2",
            category: "Money Transfer & Beneficiaries",
            name: "Send Beneficiary Verification OTP",
            method: "POST",
            path: "/api/v2/beneficiaries/get-beneficiary-otp",
            description: "Send OTP to beneficiary mobile number for verification.",
            request: {
                beneficiary_id: "12"
            },
            response: {
                status: 1,
                message: "OTP sent to registered sender mobile"
            },
            fieldDocs: [
                { field: "beneficiary_id", type: "string", required: true, description: "Beneficiary ID" }
            ]
        },
        {
            id: "dmt-3",
            category: "Money Transfer & Beneficiaries",
            name: "Verify Beneficiary with OTP",
            method: "POST",
            path: "/api/v2/beneficiaries/otp-verify-beneficiary",
            description: "Verify OTP for confirming newly added beneficiary.",
            request: {
                beneficiary_id: "12",
                otp: "123456"
            },
            response: {
                status: 1,
                message: "Beneficiary verified and activated"
            },
            fieldDocs: [
                { field: "beneficiary_id", type: "string", required: true, description: "Beneficiary ID" },
                { field: "otp", type: "string", required: true, description: "6-digit OTP code" }
            ]
        },
        {
            id: "dmt-4",
            category: "Money Transfer & Beneficiaries",
            name: "Transfer Funds (IMPS/NEFT)",
            method: "POST",
            path: "/api/v2/beneficiaries/beneficiary-payout",
            description: "Instant money transfer (IMPS / NEFT) to verified beneficiary account.",
            request: {
                beneficiary_id: 12,
                amount: 4000,
                transfer_mode: "IMPS",
                transaction_id: "DMT_TXN_99182",
                details: "PAY FOR RENT"
            },
            response: {
                status: 1,
                message: "Transaction Accepted",
                data: {
                    txnid: "DMT98172635",
                    client_ref_id: "DMT_TXN_99182",
                    beneficiary_name: "Anil Kumar",
                    account_no: "918273645012",
                    amount: 4000,
                    rrn: "429910293817",
                    status: "Pending",
                    created_at: "2026-09-02 17:35:00"
                }
            },
            fieldDocs: [
                { field: "beneficiary_id", type: "string", required: true, description: "Beneficiary ID" },
                { field: "amount", type: "number", required: true, description: "Transfer amount in INR" },
                { field: "transfer_mode", type: "string", required: true, description: "IMPS or NEFT" },
                { field: "transaction_id", type: "string", required: true, description: "Unique client transaction ID" },
                { field: "details", type: "string", required: true, description: "Payment description" }
            ]
        },

    ],

    "Pan Card": [
        {
            id: "pan-1",
            category: "Pan Card",
            name: "Register UTI PSA Agent",
            method: "POST",
            path: "/api/pan-card/agent-register",
            description: "Register new agent for UTI PSA PAN Card application center.",
            request: {
                name: 'Rajesh Kumar',
                contact_person: 'Rajesh Kumar',
                email: "rajesh@example.com",
                mobile_no: '9876543210',
                pin: '110001',
                location: 'Delhi',
                state: 'Delhi',
                district: 'New Delhi',
                pan_no: 'ABCDE1234F',
                address_1: '123 Main Street Market',
                address_2: '',
                address_3: '',
                address_4: '',
            },
            response: {
                "status": 1,
                "message": "PSA Agent Registration submitted successfully!",
                "data": {
                    "name": "Rajesh Kumar",
                    "contact_person": "Rajesh Kumar",
                    "email": "rajesh@example.com",
                    "mobile_no": "9876543210",
                    "pin": "110001",
                    "location": "Delhi",
                    "state": "Delhi",
                    "district": "New Delhi",
                    "pan_no": "ABCDE1234F",
                    "address_1": "123 Main Street Market",
                    "address_2": null,
                    "address_3": null,
                    "address_4": null,
                    "user_id": 1,
                    "admin_id": 1,
                    "agent_id": "ANNECHM-793",
                    "status": 0,
                    "updated_at": "2026-09-04T13:40:06.000000Z",
                    "created_at": "2026-09-04T13:40:06.000000Z",
                    "id": 3
                }
            },
            fieldDocs: [
                { field: "name", type: "string", required: true, description: "Agent Full Name" },
                { field: "contact_person", type: "string", required: true, description: "Contact Person" },
                { field: "email", type: "string", required: true, description: "Agent Email" },
                { field: "mobile_no", type: "string", required: true, description: "10-digit Mobile Number" },
                { field: "pin", type: "string", required: true, description: "Pincode" },
                { field: "location", type: "string", required: true, description: "Location" },
                { field: "state", type: "string", required: true, description: "State" },
                { field: "district", type: "string", required: true, description: "District" },
                { field: "pan_no", type: "string", required: true, description: "Agent PAN Card Number" },
                { field: "address_1", type: "string", required: true, description: "Address Line 1" },
                { field: "address_2", type: "string", required: true, description: "Address Line 2" },
                { field: "address_3", type: "string", required: true, description: "Address Line 3" },
                { field: "address_4", type: "string", required: true, description: "Address Line 4" },
            ]
        },
        {
            id: "pan-2",
            category: "Pan Card",
            name: "Check Agent Status & UTI ID",
            method: "GET",
            path: "/api/pan-card/agent-status",
            description: "Fetch UTI PSA Agent status, coupon balance & credentials.",
            request: {
                agent_id: "ANNECHM-793"
            },
            response: {
                "status": 1,
                "message": "PSA Agent Registration submitted successfully!",
                "data": {
                    "name": "Rajesh Kumar",
                    "contact_person": "Rajesh Kumar",
                    "email": "rajesh@example.com",
                    "mobile_no": "9876543210",
                    "pin": "110001",
                    "location": "Delhi",
                    "state": "Delhi",
                    "district": "New Delhi",
                    "pan_no": "ABCDE1234F",
                    "address_1": "123 Main Street Market",
                    "address_2": null,
                    "address_3": null,
                    "address_4": null,
                    "user_id": 1,
                    "admin_id": 1,
                    "agent_id": "ANNECHM-793",
                    "status": 1,
                    "updated_at": "2026-09-04T13:40:06.000000Z",
                    "created_at": "2026-09-04T13:40:06.000000Z",
                    "id": 3
                }
            },
            fieldDocs: [
                { field: "agent_id", type: "string", required: true, description: "Agent ID" },
            ]
        },
        {
            id: "pan-3",
            category: "Pan Card",
            name: "Fund Request",
            method: "POST",
            path: "/api/pan-card/fund-request/create",
            description: "Purchase UTI PAN Credits.",
            request: {
                agent_id: "ANNECHM-793",
                amount: 535
            },
            response: {
                "status": 1,
                "message": "Pan Fund Request submitted successfully. Wallet debited.",
                "data": {
                    "coupon_qty": 0,
                    "amount": "100.00",
                    "status": 0,
                    "created_at": "2026-09-04T14:46:47.000000Z",
                    "id": 4
                }
            },
            fieldDocs: [
                { field: "agent_id", type: "string", required: true, description: "PSA AGENT ID" },
                { field: "amount", type: "number", required: true, description: "Total coupon price in INR" }
            ]
        },
        {
            id: "pan-4",
            category: "Pan Card",
            name: "Fund Request Status Check",
            method: "POST",
            path: "/api/pan-card/fund-request-status",
            description: "Check status of PAN card coupon purchases.",
            request: {
                id: "5"
            },
            response: {
                "status": 1,
                "message": "Pan Fund Request status fetched successfully.",
                "data": {
                    "id": 4,
                    "status": "PENDING",
                    "created_at": "2026-09-04T14:46:47.000000Z"
                }
            },
            fieldDocs: [
                { field: "id", type: "number", required: true, description: "Fund Request ID" }
            ]
        },
        {
            id: "pan-5",
            category: "Pan Card",
            name: "PAN Application Reports",
            method: "GET",
            path: "/api/pan-card/application-reports",
            description: "Fetch status of submitted Form 49A PAN card applications.",
            request: {},
            response: {
                status: 1,
                data: [
                    { application_no: "N0981726", pan_name: "SURESH SHARMA", vle_id: "PSA10089", form_type: "49A", application_status: "PROCESSED_DISPATCHED" }
                ]
            },
            fieldDocs: []
        }
    ],

    "Verification API": [
        {
            id: "verif-1",
            category: "Verification API",
            name: "Aadhaar Send OTP",
            method: "POST",
            path: "/api/v2/verify/aadhar-send-otp",
            description: "Send OTP to UIDAI linked mobile number for Aadhaar eKYC verification.",
            request: {
                aadhaar_number: "123456789012"
            },
            response: {
                "status": 1,
                "message": "Success",
                "data": {
                    "txnid": "90329317",
                    "status": "SUCCESS",
                    "refid": "85474050",
                    "aadhaarno": "718765912522",
                    "message": "OTP sent successfully"
                }
            },
            fieldDocs: [
                { field: "aadhaar_number", type: "string", required: true, description: "12-digit Aadhaar number" }
            ]
        },
        {
            id: "verif-2",
            category: "Verification API",
            name: "Aadhaar Verify OTP",
            method: "POST",
            path: "/api/v2/verify/aadhaar-verify-otp",
            description: "Verify OTP for Aadhaar eKYC and fetch full demographic data & photo.",
            request: {
                refid: "85474050",
                otp: "123456"
            },
            response: {
                status: "success",
                code: 200,
                data: {
                    "status": 1,
                    "message": "Aadhar Validated Successfully",
                    "data":
                    {
                        "txnid": "40358820",
                        "status": "SUCCESS",
                        "refid": "85390730",
                        "name": "Shxxxm Kumar",
                        "care_of": "S\/O: xxxxxx xxxxxx",
                        "dob": "01-01-1998",
                        "year_of_birth": "1998",
                        "gender": "M",
                        "email": "",
                        "mobile_hash": "af6c049fb4b8eb68555f044627b96258d792e5f939c2764ede7e80144f91caaf",
                        "address": "xxxxx, xxxxx, xxxxx, xxxxx, xxxxx, India, 123456",
                        "split_address": {
                            "country": "xxxxx", "dist": "xxxxx", "house": "", "landmark": "", "pincode": "123456", "po": "xxxxx", "state": "xxxxx", "street": "", "subdist": "xxxxx", "vtc": "xxxxx", "locality": ""
                        },
                        "photo_link": "",
                        "message": "Aadhaar Card Exists"
                    }
                }
            },
            fieldDocs: [
                { field: "refid ", type: "string", required: true, description: "Aadhaar OTP request reference ID" },
                { field: "otp", type: "string", required: true, description: "6-digit OTP code received on mobile" }
            ]
        },
        {
            id: "verif-3",
            category: "Verification API",
            name: "PAN Card Verification",
            method: "POST",
            path: "/api/v2/verify/verify-pan",
            description: "Verify 10-character PAN number with NSDL database to confirm holder name & validity.",
            request: {
                pan_number: "ABCDE1234F"
            },
            response: {
                "status": 1,
                "message": "Success",
                "data": {
                    "txnid": "29483491",
                    "status": "SUCCESS",
                    "pan": "GHXXXXX9B",
                    "RegisteredName": "SHXXXXXM KUMAR",
                    "FatherName": "",
                    "type": "Individual",
                    "message": "PAN verified successfully"
                }
            },
            fieldDocs: [
                { field: "pan_number", type: "string", required: true, description: "10-character PAN number" }
            ]
        },
        {
            id: "verif-4",
            category: "Verification API",
            name: "Bank Account Verification (Penny Drop)",
            method: "POST",
            path: "/api/v2/verify/bank-account",
            description: "Instantly verify beneficiary bank account number and fetch account holder name via Re 1 penny drop.",
            request: {
                accountno: "918273645012",
                ifsccode: "SBIN0001234"
            },
            response: {
                "status": 1,
                "message": "Success",
                "data":
                {
                    "txnid": "92211675",
                    "status": "SUCCESS",
                    "AccountName": "SXXXXM KUMAR",
                    "AccountNumber": "50100645303389",
                    "accountStatus": "VALID",
                    "bank_name": "HDFC BANK",
                    "utr": "624609226823",
                    "city": "SIXXXXXI",
                    "branch": "SIXXXXXI",
                    "micr": "53454646",
                    "message": "Beneficiary Verification Success"
                }
            },
            fieldDocs: [
                { field: "accountno", type: "string", required: true, description: "Bank Account Number" },
                { field: "ifsccode", type: "string", required: true, description: "11-character bank IFSC code" }
            ]
        },
        {
            id: "verif-5",
            category: "Verification API",
            name: "IFSC Code Lookup",
            method: "GET",
            path: "/api/v2/verify/ifsc",
            description: "Fetch bank branch details, address, MICR, contact info by IFSC code.",
            request: {
                ifsccode: 'SBIN0001234'
            },
            response: {
                "IMPS": true,
                "RTGS": true,
                "CITY": "XXXXXX",
                "UPI": true,
                "STATE": "XXXXXX",
                "DISTRICT": "XXXXXX",
                "ADDRESS": "XXXXX SXXXXX MARKET XXXXX,XXXXXXXXFARPUR,XXXXXX,XXXXXX,PIN-XXXXXX",
                "BRANCH": "XXXXXX",
                "ISO3166": "IN-XX",
                "SWIFT": null,
                "MICR": "6786787686",
                "NEFT": true,
                "CONTACT": "+91545646894",
                "CENTRE": "XXXXXX",
                "BANK": "XXXXXX",
                "BANKCODE": "XXXXXX",
                "IFSC": "XXXXXX"
            },
            fieldDocs: [
                { field: "ifsccode", type: "string", required: true, description: "11-character bank IFSC code" }
            ]
        }
    ]
};

export default apiDocs;