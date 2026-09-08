<?php
// Secret Token to secure deployment url
$secret_token = 'cashbez_secure_token_9835';

if (!isset($_GET['token']) || $_GET['token'] !== $secret_token) {
    header('HTTP/1.1 403 Forbidden');
    echo 'Access Denied: Invalid Token';
    exit;
}

// Optional GitHub Access Token passed via URL e.g. &git_token=ghp_...
$git_token = $_GET['git_token'] ?? $_GET['github_token'] ?? null;

// Project path on server (Auto-detected based on deploy.php location in public folder)
$project_path = dirname(__DIR__);

// Set HOME to writable directory (fallback to sys_get_temp_dir if user home is not writable)
$home_dir = '/home/cashbez-banking';
if (!is_dir($home_dir) || !is_writable($home_dir)) {
    $home_dir = sys_get_temp_dir();
}
putenv("HOME={$home_dir}");
putenv("PATH=" . getenv("PATH") . ":/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/cashbez-banking/.nvm/versions/node/v20.0.0/bin:/home/cashbez-banking/.nvm/versions/node/v18.0.0/bin");

// Update remote URL with token if git_token is provided in URL
$remote_repo = !empty($git_token) 
    ? "https://{$git_token}@github.com/kushprakash/cashbez.git" 
    : "https://github.com/kushprakash/cashbez.git";

// List of commands to run (incorporating force flags and direct vite path)
$commands = [
    'Git Safe Directory' => 'HOME=/tmp git config --global --add safe.directory "*" || true',
    'Remove Git Lock File' => 'rm -f .git/index.lock',
    'Git Init & Remote Setup' => 'if [ ! -d .git ]; then git -c safe.directory="*" init && git -c safe.directory="*" remote add origin ' . $remote_repo . '; else git -c safe.directory="*" remote set-url origin ' . $remote_repo . '; fi',
    'Git Fetch & Force Reset' => 'rm -f .git/index.lock && (git -c safe.directory="*" fetch origin main || git -c safe.directory="*" fetch --all) && git -c safe.directory="*" reset --hard origin/main',
    'Composer Install' => 'composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist',
    'NPM Build' => 'if [ -f node_modules/vite/bin/vite.js ] || [ -f node_modules/.bin/vite ]; then npm run build; else echo "Using pre-built assets from Git repository (public/build)"; fi',
    'Clear Caches' => 'php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear',
    'Optimize Caches' => 'php artisan config:cache && php artisan route:cache && php artisan view:cache'
];

echo "<h2>Cashbez Live Deployment System (Force Mode)</h2>";
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

