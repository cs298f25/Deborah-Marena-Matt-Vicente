#!/bin/bash
# Quick script to update CORS_ORIGINS in backend/.env and restart the service
# Usage: sudo bash deploy/update_cors.sh <EC2_IP>

set -e

if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: sudo bash deploy/update_cors.sh <EC2_IP>"
    echo "Example: sudo bash deploy/update_cors.sh 3.236.101.205"
    exit 1
fi

EC2_IP="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: .env file not found at $ENV_FILE"
    echo "Please run the full deploy script first: sudo bash deploy/deploy.sh"
    exit 1
fi

echo "Updating CORS_ORIGINS in $ENV_FILE..."
echo "New IP: $EC2_IP"

# Update or add CORS_ORIGINS
if grep -q "CORS_ORIGINS=" "$ENV_FILE"; then
    sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:5173,http://$EC2_IP:5173,http://$EC2_IP:5173|" "$ENV_FILE"
    echo "Updated existing CORS_ORIGINS"
else
    echo "CORS_ORIGINS=http://localhost:5173,http://$EC2_IP:5173,http://$EC2_IP:5173" >> "$ENV_FILE"
    echo "Added CORS_ORIGINS"
fi

echo ""
echo "Restarting backend service..."
systemctl restart bytepath-backend

sleep 2

if systemctl is-active --quiet bytepath-backend; then
    echo "✓ Backend service restarted successfully"
    echo ""
    echo "CORS configuration updated. The new CORS_ORIGINS is:"
    grep "CORS_ORIGINS=" "$ENV_FILE"
else
    echo "ERROR: Backend service failed to start"
    echo "Check logs with: sudo journalctl -u bytepath-backend -n 50"
    exit 1
fi

