<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Backup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
        }
        .value {
            color: #111827;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .success-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Database Backup Complete</h1>
        <div class="success-badge">✓ Successful</div>
    </div>
    
    <div class="content">
        <p>Hello,</p>
        <p>Your scheduled database backup has been completed successfully. Please find the backup file attached to this email.</p>
        
        <div class="info-box">
            <h3 style="margin-top: 0; color: #111827;">Backup Details</h3>
            
            <div class="info-row">
                <span class="label">Database Name:</span>
                <span class="value">{{ $dbName }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Backup File:</span>
                <span class="value">{{ $filename }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">File Size:</span>
                <span class="value">{{ $fileSize }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Created At:</span>
                <span class="value">{{ $date }}</span>
            </div>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>⚠️ Important:</strong> Please store this backup securely and ensure it's accessible only to authorized personnel.
        </div>
        
        <p style="margin-top: 20px;">
            <strong>What's included:</strong>
        </p>
        <ul style="color: #6b7280;">
            <li>All database tables and data</li>
            <li>Stored procedures and functions</li>
            <li>Database triggers</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>This is an automated backup email.</p>
        <p>{{ env('APP_NAME', 'ERP System') }} © {{ date('Y') }}</p>
    </div>
</body>
</html>
