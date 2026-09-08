#!/bin/bash
#===============================================================================
# Server Setup Script for Laravel + Vite (Amazon Linux 2023)
# Run once on your EC2 instance to prepare for CI/CD deployments
#
# Usage: bash server-setup.sh
#===============================================================================

set -e

# Configuration
DEPLOY_PATH="/var/www/test.cashbez.com"
DOMAIN="test.cashbez.com"
USER="ec2-user"
PHP_SOCKET="/run/php-fpm/www.sock"

echo "🚀 Setting up deployment environment for $DOMAIN"
echo "=================================================="

#-------------------------------------------------------------------------------
# 1. Create directory structure
#-------------------------------------------------------------------------------
echo "📁 Creating directory structure..."

sudo mkdir -p $DEPLOY_PATH/{releases,shared,logs}
sudo mkdir -p $DEPLOY_PATH/shared/storage/{app/public,framework/{cache,sessions,views},logs}

# Set ownership
sudo chown -R $USER:nginx $DEPLOY_PATH
sudo chmod -R 775 $DEPLOY_PATH/shared/storage

echo "✅ Directories created"

#-------------------------------------------------------------------------------
# 2. Create initial .env file
#-------------------------------------------------------------------------------
if [ ! -f "$DEPLOY_PATH/shared/.env" ]; then
    echo "📝 Creating .env file template..."
    cat > /tmp/.env.template << 'EOF'
APP_NAME="CashBez ERP"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://test.cashbez.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database
EOF
    
    sudo mv /tmp/.env.template $DEPLOY_PATH/shared/.env
    sudo chown $USER:nginx $DEPLOY_PATH/shared/.env
    sudo chmod 640 $DEPLOY_PATH/shared/.env
    
    echo "⚠️  IMPORTANT: Edit $DEPLOY_PATH/shared/.env with your actual values!"
    echo "   Run: sudo nano $DEPLOY_PATH/shared/.env"
fi

#-------------------------------------------------------------------------------
# 3. Nginx configuration
#-------------------------------------------------------------------------------
echo "🌐 Setting up Nginx configuration..."

sudo tee /etc/nginx/conf.d/$DOMAIN.conf > /dev/null << 'NGINX'
server {
    listen 80;
    server_name test.cashbez.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name test.cashbez.com;
    
    root /var/www/test.cashbez.com/current/public;
    index index.php index.html;
    
    # SSL Configuration (Certbot)
    ssl_certificate /etc/letsencrypt/live/test.cashbez.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test.cashbez.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml 
               application/rss+xml image/svg+xml;
    
    # Vite build assets (aggressive caching - files are hashed)
    location /build/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Static assets
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|woff|woff2|ttf|svg|eot)$ {
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }
    
    # Laravel application
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/run/php-fpm/www.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Deny access to sensitive files
    location ~* (\.env|artisan|composer\.json|composer\.lock|package\.json)$ {
        deny all;
    }
    
    # Logs
    access_log /var/www/test.cashbez.com/logs/access.log;
    error_log /var/www/test.cashbez.com/logs/error.log;
}
NGINX

echo "✅ Nginx configuration created"

#-------------------------------------------------------------------------------
# 4. Test Nginx configuration
#-------------------------------------------------------------------------------
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

#-------------------------------------------------------------------------------
# 5. Create authorized_keys for GitHub Actions
#-------------------------------------------------------------------------------
echo "🔑 Setting up SSH access..."

if [ ! -d ~/.ssh ]; then
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
fi

if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
fi

echo ""
echo "=================================================="
echo "🎉 Server setup complete!"
echo "=================================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Edit the .env file with actual values:"
echo "   sudo nano $DEPLOY_PATH/shared/.env"
echo ""
echo "2. Generate Laravel APP_KEY locally and add to .env:"
echo "   php artisan key:generate --show"
echo ""
echo "3. Add your GitHub Actions SSH public key:"
echo "   echo 'your-public-key' >> ~/.ssh/authorized_keys"
echo ""
echo "4. Reload Nginx:"
echo "   sudo systemctl reload nginx"
echo ""
echo "5. Add these secrets to your GitHub repository:"
echo "   - SERVER_IP: $(curl -s ifconfig.me)"
echo "   - SSH_USER: $USER"
echo "   - SSH_PRIVATE_KEY: (your private key content)"
echo ""
