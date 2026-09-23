<?php
// Secret Tokens to secure deployment url (supports both cashbez and enexa tokens)
$valid_tokens = [
    'cashbez_secure_token_9835',
    'enexa_secure_token_9835'
];

$provided_token = $_GET['token'] ?? '';

if (!in_array($provided_token, $valid_tokens, true)) {
    header('HTTP/1.1 403 Forbidden');
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Deployment Authentication Required</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }
            .card { max-width: 650px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h2 { color: #f87171; margin-top: 0; }
            p { color: #cbd5e1; line-height: 1.6; }
            code { background: #334155; color: #38bdf8; padding: 4px 8px; border-radius: 6px; font-size: 14px; word-break: break-all; }
            .btn { display: inline-block; margin-top: 20px; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
            .btn:hover { background: #1d4ed8; }
            .info-box { background: #0f172a; border-left: 4px solid #38bdf8; padding: 15px; margin-top: 20px; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>⚠️ Access Denied: Invalid or Missing Token</h2>
            <p>You must pass a valid security token in the URL to trigger deployment.</p>
            
            <p><strong>Click below or use this URL:</strong></p>
            <p><code>https://<?php echo htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'enexaerp.com'); ?>/deploy.php?token=cashbez_secure_token_9835</code></p>
            
            <a class="btn" href="deploy.php?token=cashbez_secure_token_9835">Run Deployment Now</a>

            <div class="info-box">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;"><strong>Optional parameters:</strong></p>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
                    • Add <code>&migrate=1</code> to run database migrations automatically.<br>
                    • Add <code>&git_token=ghp_...</code> if fetching from a private repository.
                </p>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Optional GitHub Access Token passed via URL e.g. &git_token=ghp_...
$git_token = $_GET['git_token'] ?? $_GET['github_token'] ?? null;
$run_migrate = isset($_GET['migrate']) && ($_GET['migrate'] === '1' || $_GET['migrate'] === 'true');

// Project path on server (Auto-detected based on deploy.php location in public folder)
$project_path = dirname(__DIR__);

// Auto-detect writable home directory
$possible_homes = [
    dirname($project_path), // parent of project directory (e.g. /home/user)
    dirname(dirname($project_path)),
    getenv('HOME'),
    '/home/cashbez-banking',
    sys_get_temp_dir()
];

$home_dir = sys_get_temp_dir();
foreach ($possible_homes as $h) {
    if (!empty($h) && is_dir($h) && is_writable($h)) {
        $home_dir = $h;
        break;
    }
}

// Common binary directories on cPanel/Linux servers
$extra_paths = [
    '/usr/local/sbin',
    '/usr/local/bin',
    '/usr/sbin',
    '/usr/bin',
    '/sbin',
    '/bin',
    '/opt/cpanel/ea-php83/root/usr/bin',
    '/opt/cpanel/ea-php82/root/usr/bin',
    '/opt/cpanel/ea-php81/root/usr/bin',
    '/opt/cpanel/ea-php80/root/usr/bin',
    $home_dir . '/.nvm/versions/node/v20.0.0/bin',
    $home_dir . '/.nvm/versions/node/v18.0.0/bin',
    $home_dir . '/bin',
];

putenv("HOME={$home_dir}");
putenv("PATH=" . implode(':', $extra_paths) . ':' . (getenv("PATH") ?: ''));

// Update remote URL with token if git_token is provided in URL
$remote_repo = !empty($git_token) 
    ? "https://{$git_token}@github.com/kushprakash/cashbez.git" 
    : "https://github.com/kushprakash/cashbez.git";

// List of commands to run (incorporating force flags and direct vite path)
$commands = [
    'Git Safe Directory' => 'HOME=' . escapeshellarg($home_dir) . ' git config --global --add safe.directory "*" || true',
    'Remove Git Lock File' => 'rm -f .git/index.lock',
    'Git Init & Remote Setup' => 'if [ ! -d .git ]; then git -c safe.directory="*" init && git -c safe.directory="*" remote add origin ' . escapeshellarg($remote_repo) . '; else git -c safe.directory="*" remote set-url origin ' . escapeshellarg($remote_repo) . '; fi',
    'Git Fetch & Force Reset' => 'rm -f .git/index.lock && (git -c safe.directory="*" fetch origin main || git -c safe.directory="*" fetch --all) && git -c safe.directory="*" reset --hard origin/main',
    'Composer Install' => 'composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist',
    'NPM Build' => 'if [ -f node_modules/vite/bin/vite.js ] || [ -f node_modules/.bin/vite ]; then npm run build; else echo "Using pre-built assets from Git repository (public/build)"; fi',
    'Storage Link' => 'php artisan storage:link || true',
    'Clear Caches' => 'php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear',
    'Optimize Caches' => 'php artisan config:cache && php artisan route:cache && php artisan view:cache'
];

if ($run_migrate) {
    $commands['Database Migrations'] = 'php artisan migrate --force';
}

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Deployment Console</title>";
echo "<style>body{font-family:monospace;background:#0d1117;color:#c9d1d9;padding:24px;} pre{background:#161b22;padding:12px;border-radius:6px;border:1px solid #30363d;white-space:pre-wrap;} hr{border-color:#30363d;}</style></head><body>";
echo "<h2 style='color:#58a6ff;'>🚀 Live Deployment System - EnexaERP / Cashbez</h2>";
echo "<p style='color:#8b949e;'>Project Directory: <code>" . htmlspecialchars($project_path) . "</code> | Home: <code>" . htmlspecialchars($home_dir) . "</code></p>";
echo "<hr>";

$has_error = false;

foreach ($commands as $name => $cmd) {
    echo "<h3 style='color:#79c0ff;'>Executing: " . htmlspecialchars($name) . "</h3>";
    $output = [];
    $return_var = 0;
    
    // Run command wrapped in parentheses to capture all output/errors
    exec("cd {$project_path} && ({$cmd}) 2>&1", $output, $return_var);
    
    echo "<pre>" . htmlspecialchars(implode("\n", $output)) . "</pre>";
    
    if ($return_var !== 0) {
        echo "<strong style='color:#f85149;'>❌ Failed with exit code: $return_var</strong><br><br>";
        $has_error = true;
        break; // Stop execution on error
    } else {
        echo "<strong style='color:#3fb950;'>✓ Success</strong><br><br>";
    }
}

echo "<hr>";
if (!$has_error) {
    echo "<h2 style='color:#3fb950;'>🎉 Status: DEPLOYMENT SUCCESSFUL</h2>";
} else {
    echo "<h2 style='color:#f85149;'>⚠️ Status: DEPLOYMENT FAILED</h2>";
}
echo "</body></html>";


