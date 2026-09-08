# Laravel + Vite CI/CD Deployment

Professional zero-downtime deployment for Laravel + Vite on Amazon Linux 2023.

## 🎯 Features

- ✅ No `node_modules` on server
- ✅ Atomic zero-downtime deployments
- ✅ Instant rollback capability  
- ✅ Automatic old release cleanup
- ✅ SSL + security headers configured

## 📁 Server Directory Structure

```
/var/www/test.cashbez.com/
├── current/      → symlink to active release
├── releases/     → timestamped releases
├── shared/
│   ├── .env      → production environment
│   └── storage/  → persistent storage
└── logs/         → nginx logs
```

## 🚀 Quick Start

### 1. Add GitHub Secrets

Go to **Repository → Settings → Secrets → Actions** and add:

| Secret | Value |
|--------|-------|
| `SERVER_IP` | Your EC2 IP (e.g., `13.204.167.211`) |
| `SSH_USER` | `ec2-user` |
| `SSH_PRIVATE_KEY` | Full `.pem` file content |

### 2. Run Server Setup (One-time)

```bash
# SSH to your server
ssh -i your-key.pem ec2-user@YOUR_SERVER_IP

# Upload and run setup script
# (or copy-paste the content of deployment/server-setup.sh)
bash server-setup.sh

# Edit .env with your values
sudo nano /var/www/test.cashbez.com/shared/.env

# Generate APP_KEY locally and add to .env
php artisan key:generate --show
```

### 3. Deploy

Just push to `main` branch:

```bash
git add .
git commit -m "feat: add CI/CD deployment"
git push origin main
```

## 🔄 Rollback

SSH to server and run:

```bash
# List releases
bash /var/www/test.cashbez.com/deployment/rollback.sh

# Rollback to specific release
bash /var/www/test.cashbez.com/deployment/rollback.sh 20240105_103045
```

## 📋 Deployment Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   npm ci    │ ──▶ │ npm build   │ ──▶ │  composer   │
│             │     │  (Vite)     │     │  install    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Switch    │ ◀── │   rsync     │ ◀── │   Upload    │
│  symlink    │     │  to server  │     │  artifact   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🔧 Troubleshooting

### Check deployment logs
```bash
# Laravel logs
tail -f /var/www/test.cashbez.com/shared/storage/logs/laravel.log

# Nginx logs
tail -f /var/www/test.cashbez.com/logs/error.log
```

### Verify current release
```bash
ls -la /var/www/test.cashbez.com/current
```

### Restart PHP-FPM
```bash
sudo systemctl restart php-fpm
```

## 📁 Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `deployment/server-setup.sh` | One-time server setup |
| `deployment/rollback.sh` | Rollback script |
