# QR Code Caching Implementation

## Overview
Modified the QR code generation system to cache generated QR codes in `public/uploads/qr-codes/` directory. This improves performance by generating QR codes only once and serving them from disk on subsequent requests.

## Changes Made

### 1. Modified `qrGenerate()` Method
**Location:** `app/Http/Controllers/AccountController.php`

**Changes:**
- Added directory creation for `public/uploads/qr-codes/` if it doesn't exist
- Generate filename using MD5 hash of UPI ID (e.g., `abc123def456.png`)
- Check if QR code file already exists before generating
- If exists, serve the cached file directly
- If not, generate new QR code and save it to disk
- Increased cache control to 1 year for existing files

### 2. Updated `generateQrWithLogo()` Method
**Changes:**
- Added optional `$savePath` parameter
- Save generated PNG image to disk when path is provided
- Still returns the image response as before

### 3. Updated `generateQrSvg()` Method
**Changes:**
- Added optional `$savePath` parameter
- Save generated SVG content to disk when path is provided
- Automatically changes extension from `.png` to `.svg` for SVG files

### 4. Directory Structure
Created directory: `public/uploads/qr-codes/`
Added `.gitignore` to prevent tracking QR code files in git

## How It Works

### First Time Request
1. User requests QR code via: `api/accounts/qr-generate/{upi_id}`
2. System generates MD5 hash of UPI ID as filename
3. Checks if file exists in `public/uploads/qr-codes/`
4. File not found → Generate QR code with logo and borders
5. Save to `public/uploads/qr-codes/{hash}.png`
6. Return image response to user

### Second Time Request (and subsequent)
1. User requests same QR code
2. System generates same MD5 hash
3. Checks if file exists in `public/uploads/qr-codes/`
4. File found → Read from disk
5. Return cached image immediately (no generation needed)
6. Response includes cache header: `max-age=31536000` (1 year)

## Benefits

1. **Performance**: QR codes generated only once, served from disk afterwards
2. **Server Load**: Reduced CPU usage for QR code generation
3. **Consistency**: Same QR code always returned for same UPI ID
4. **Bandwidth**: Browser caching reduces repeated requests
5. **Storage**: Efficient storage using MD5 hashing prevents duplicates

## File Naming
- Format: `{md5_hash_of_upi_id}.png`
- Example: For UPI ID `test@cashbez`, filename would be `098f6bcd4621d373cade4e832627b4f6.png`
- SVG fallback: Same hash with `.svg` extension

## Cache Headers
- **New QR Codes**: `Cache-Control: public, max-age=3600` (1 hour)
- **Existing QR Codes**: `Cache-Control: public, max-age=31536000` (1 year)

## Directory Permissions
Ensure the directory has write permissions:
```bash
chmod 777 public/uploads/qr-codes/
```

## Cleanup (Optional)
To clear old QR codes, simply delete files from:
```
public/uploads/qr-codes/
```
They will be regenerated on next request.

## Testing
1. First request: Check server generates and saves file
2. Check file exists in `public/uploads/qr-codes/`
3. Second request: Verify faster response (file served from disk)
4. Multiple UPI IDs: Each gets unique filename based on hash

## Example Usage

### Via API
```
GET /api/accounts/qr-generate/test@cashbez
```

### Via upiList Response
```json
{
  "status": 1,
  "message": "UPI Providers retrieved successfully.",
  "data": [
    {
      "upi_id": "test@cashbez",
      "wallet_name": "My Wallet",
      "qr_url": "https://yourdomain.com/api/accounts/qr-generate/test@cashbez",
      "is_primary": true
    }
  ]
}
```

## Notes
- QR codes are generated with logo and borders as before
- No changes to QR code visual appearance
- Backward compatible with existing API endpoints
- `.gitignore` added to prevent tracking QR code files in version control
