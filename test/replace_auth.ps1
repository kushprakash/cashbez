# PowerShell script to replace authentication blocks in all controllers
$authPattern = @"
        // Get token from header
        if (`$request->hasHeader('Token')) {
            `$authHeader = `$request->header('Token');
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'No token provided',
            ], 400);
        }

        // Find user by token
        `$user = User::where('remember_token', `$authHeader)->first();
        if (!`$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }
"@

$replacement = "        `$user=`$request->get('user');"

# Get all controller files
$controllerFiles = Get-ChildItem -Path "e:\xampp\htdocs\project\app\Http\Controllers\" -Filter "*.php" -Recurse

foreach ($file in $controllerFiles) {
    if ($file.Name -ne "Controller.php") {  # Skip base Controller class
        $content = Get-Content -Path $file.FullName -Raw
        
        # Count occurrences of the pattern
        $matches = [regex]::Matches($content, [regex]::Escape($authPattern))
        
        if ($matches.Count -gt 0) {
            Write-Host "Processing $($file.Name) - Found $($matches.Count) authentication blocks"
            
            # Replace all occurrences
            $newContent = $content -replace [regex]::Escape($authPattern), $replacement
            
            # Write back to file
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            
            Write-Host "Updated $($file.Name)"
        }
    }
}

Write-Host "Authentication block replacement completed!"
