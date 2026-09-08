<?php
// Secret Token to secure deployment url
$secret_token = 'bharatpay_secure_token_9835';

if (!isset($_GET['token']) || $_GET['token'] !== $secret_token) {
    header('HTTP/1.1 403 Forbidden');
    echo 'Access Denied: Invalid Token';
    exit;
}

// Optional GitHub Access Token passed via URL e.g. &git_token=ghp_...
$git_token = $_GET['git_token'] ?? $_GET['github_token'] ?? null;

// Project path on server (Auto-detected based on deploy.php location in public folder)
$project_path = dirname(__DIR__);
putenv("HOME=/home/icchhamatidataservice");
putenv("PATH=" . getenv("PATH") . ":/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/icchhamatidataservice/.nvm/versions/node/v20.0.0/bin:/home/icchhamatidataservice/.nvm/versions/node/v18.0.0/bin");

// Update remote URL with token if git_token is provided in URL
if (!empty($git_token)) {
    $remoteUrl = "https://{$git_token}@github.com/kushprakash/bharat-pay.git";
    exec("cd {$project_path} && git remote set-url origin {$remoteUrl} 2>&1");
}

// List of commands to run (incorporating force flags and direct vite path)
$commands = [
    'Git Safe Directory' => 'git config --global --add safe.directory "*"',
    'Remove Git Lock File' => 'rm -f .git/index.lock',
    'Git Fetch & Force Reset' => 'rm -f .git/index.lock && (git fetch origin main || git fetch --all) && git reset --hard origin/main',
    'Composer Install' => 'composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist',
    'NPM Build' => 'export PATH=$PATH:/usr/local/bin:/usr/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin; if command -v npm >/dev/null 2>&1; then npm run build; else echo "NPM command not available on server, using pre-built assets"; fi',
    'Clear Caches' => 'php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear',
    'Optimize Caches' => 'php artisan config:cache && php artisan route:cache && php artisan view:cache'
];

echo "<h2>Bharat-Pay Live Deployment System (Force Mode)</h2>";
echo "<hr>";

$has_error = false;

foreach ($commands as $name => $cmd) {
    echo "<h3>Executing: $name</h3>";
    $output = [];
    $return_var = 0;
    
    // Run command wrapped in parentheses to capture all output/errors
    exec("cd {$project_path} && ({$cmd}) 2>&1", $output, $return_var);
    
    echo "<pre style='background: #f4f4f4; padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars(implode("\n", $output)) . "</pre>";
    
    if ($return_var !== 0) {
        echo "<strong style='color:red;'>Failed with exit code: $return_var</strong><br>";
        $has_error = true;
        break; // Stop execution on error
    } else {
        echo "<strong style='color:green;'>Success</strong><br>";
    }
}

echo "<hr>";
if (!$has_error) {
    echo "<h2 style='color:green;'>Status: DEPLOYMENT SUCCESSFUL</h2>";
} else {
    echo "<h2 style='color:red;'>Status: DEPLOYMENT FAILED</h2>";
}

