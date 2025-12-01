#!/bin/bash
# Quick diagnostic script for backend service

echo "=== Backend Service Status ==="
sudo systemctl status bytepath-backend --no-pager -l

echo ""
echo "=== Recent Logs ==="
sudo journalctl -u bytepath-backend -n 50 --no-pager

echo ""
echo "=== Testing Gunicorn Directly ==="
cd ~/Deborah-Marena-Matt-Vicente/backend
source .venv/bin/activate
export FLASK_ENV=production
python -c "from backend.app import application; print('App loaded successfully')" 2>&1

echo ""
echo "=== Testing Gunicorn Command ==="
cd ~/Deborah-Marena-Matt-Vicente/backend
source .venv/bin/activate
.venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 1 --timeout 120 backend.app:application --check-config 2>&1 || echo "Config check failed"


