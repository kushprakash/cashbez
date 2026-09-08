#!/bin/bash
#===============================================================================
# Rollback Script - Switch to a previous release
#
# Usage: 
#   bash rollback.sh           # Shows available releases
#   bash rollback.sh 20240105_1030  # Rollback to specific release
#===============================================================================

set -e

DEPLOY_PATH="/var/www/test.cashbez.com"
RELEASES_PATH="$DEPLOY_PATH/releases"

# List available releases
list_releases() {
    echo "📦 Available releases:"
    echo "========================"
    ls -lt $RELEASES_PATH | grep -v total | head -10 | while read line; do
        release=$(echo $line | awk '{print $NF}')
        current=""
        if [ -L "$DEPLOY_PATH/current" ] && [ "$(readlink $DEPLOY_PATH/current)" = "$RELEASES_PATH/$release" ]; then
            current=" ← CURRENT"
        fi
        echo "  $release$current"
    done
    echo ""
}

# Rollback to specific release
rollback_to() {
    local target_release=$1
    local target_path="$RELEASES_PATH/$target_release"
    
    if [ ! -d "$target_path" ]; then
        echo "❌ Release '$target_release' not found!"
        list_releases
        exit 1
    fi
    
    echo "🔄 Rolling back to: $target_release"
    
    # Switch symlink
    ln -sfn $target_path $DEPLOY_PATH/current
    
    # Clear Laravel caches
    cd $DEPLOY_PATH/current
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    echo "✅ Rollback complete!"
    echo ""
    echo "Current release: $(basename $(readlink $DEPLOY_PATH/current))"
}

# Main
if [ -z "$1" ]; then
    list_releases
    echo "Usage: bash rollback.sh <release_name>"
    echo ""
    echo "Example: bash rollback.sh 20240105_103045"
else
    rollback_to $1
fi
