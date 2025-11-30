#!/bin/bash
set -e

# BytePath Update Script
# Use this to update the application after pulling new changes

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"

echo "=========================================="
echo "BytePath Update Script"
echo "=========================================="

# Step 1: Update backend
echo ""
echo "Step 1: Updating backend..."
cd "$BACKEND_DIR"

if [ -d ".venv" ]; then
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    echo "Backend dependencies updated"
else
    echo "ERROR: Virtual environment not found. Run deploy.sh first."
    exit 1
fi

# Step 2: Update frontend
echo ""
echo "Step 2: Updating frontend..."
cd "$FRONTEND_DIR"

npm install
npm run build
echo "Frontend built successfully"

# Step 3: Restart services
echo ""
echo "Step 3: Restarting services..."
if systemctl is-active --quiet bytepath-backend; then
    sudo systemctl restart bytepath-backend
    echo "Backend service restarted"
else
    echo "WARNING: Backend service is not running"
fi

if systemctl is-active --quiet bytepath-frontend; then
    sudo systemctl restart bytepath-frontend
    echo "Frontend service restarted"
else
    echo "WARNING: Frontend service is not running"
fi

echo ""
echo "Update complete!"

