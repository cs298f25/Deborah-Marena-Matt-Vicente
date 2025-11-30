#!/bin/bash
set -e

# BytePath EC2 Deployment Script
# This script sets up the backend and frontend services on an EC2 instance

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"
SERVICE_USER="ec2-user"
BACKEND_PORT=5000
FRONTEND_PORT=5173

echo "=========================================="
echo "BytePath EC2 Deployment Script"
echo "=========================================="

# Check if running as root (needed for systemd)
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Step 1: Install system dependencies
echo ""
echo "Step 1: Installing system dependencies..."
yum update -y
yum install -y python3 python3-pip nodejs npm git

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
echo "Detected Python version: $PYTHON_VERSION"

# Step 2: Setup backend
echo ""
echo "Step 2: Setting up backend..."
cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate venv and install dependencies
source .venv/bin/activate
pip install --upgrade pip
echo "Installing Python dependencies (this may take a minute)..."
pip install -r requirements.txt
# Ensure gunicorn is installed (in case it's not in requirements.txt)
pip install gunicorn || true

# Ensure database directory exists
mkdir -p "$BACKEND_DIR"
touch "$BACKEND_DIR/bytepath.db"
chown -R $SERVICE_USER:$SERVICE_USER "$BACKEND_DIR"

# Step 3: Setup frontend
echo ""
echo "Step 3: Setting up frontend..."
cd "$FRONTEND_DIR"

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Install serve globally for serving built frontend
if ! command -v serve &> /dev/null; then
    echo "Installing serve package..."
    npm install -g serve
fi

# Build frontend
echo "Building frontend..."
# Use EC2 public IP for API base URL
EC2_IP="44.200.81.23"
export VITE_API_BASE="http://$EC2_IP:$BACKEND_PORT/api"
echo "Setting VITE_API_BASE to http://$EC2_IP:$BACKEND_PORT/api"
npm run build

# Create frontend service directory
FRONTEND_SERVE_DIR="$FRONTEND_DIR/dist"
chown -R $SERVICE_USER:$SERVICE_USER "$FRONTEND_DIR"

# Step 4: Create environment file
echo ""
echo "Step 4: Setting up environment variables..."
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    cat > "$ENV_FILE" << EOF
# BytePath Production Environment Variables
FLASK_ENV=production
BYTEPATH_SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=http://localhost:5173,http://44.200.81.23:5173
EOF
    chown $SERVICE_USER:$SERVICE_USER "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo "Created .env file at $ENV_FILE"
    echo "IMPORTANT: Review and update BYTEPATH_SECRET_KEY if needed"
else
    echo ".env file already exists, skipping..."
fi

# Step 5: Create systemd service files
echo ""
echo "Step 5: Creating systemd service files..."

# Backend service
cat > /etc/systemd/system/bytepath-backend.service << EOF
[Unit]
Description=BytePath Backend API (Gunicorn)
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$PROJECT_ROOT
Environment="PATH=$BACKEND_DIR/.venv/bin"
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=$BACKEND_DIR/.venv/bin/gunicorn \
    --bind 0.0.0.0:$BACKEND_PORT \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --pythonpath $PROJECT_ROOT \
    backend.app:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
cat > /etc/systemd/system/bytepath-frontend.service << EOF
[Unit]
Description=BytePath Frontend (Static Server)
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$FRONTEND_SERVE_DIR
ExecStart=/usr/bin/serve -s . -l $FRONTEND_PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Step 6: Update CORS configuration for production
echo ""
echo "Step 6: Updating CORS configuration..."
# Note: This will be handled by environment variable or config update
# We'll update the config to read from environment

# Step 7: Configure firewall (if firewalld is running)
echo ""
echo "Step 7: Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    echo "Opening ports $BACKEND_PORT and $FRONTEND_PORT..."
    firewall-cmd --permanent --add-port=$BACKEND_PORT/tcp
    firewall-cmd --permanent --add-port=$FRONTEND_PORT/tcp
    firewall-cmd --reload
    echo "Firewall configured"
else
    echo "Firewalld not running, skipping firewall configuration"
fi

# Step 8: Reload systemd and enable services
echo ""
echo "Step 8: Enabling and starting services..."
systemctl daemon-reload
systemctl enable bytepath-backend
systemctl enable bytepath-frontend
systemctl start bytepath-backend
systemctl start bytepath-frontend

# Step 9: Show status
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Service Status:"
systemctl status bytepath-backend --no-pager -l || true
echo ""
systemctl status bytepath-frontend --no-pager -l || true
echo ""
echo "Services are running on:"
echo "  Backend:  http://44.200.81.23:$BACKEND_PORT"
echo "  Frontend: http://44.200.81.23:$FRONTEND_PORT"
echo ""
echo "Useful commands:"
echo "  Check backend logs:  sudo journalctl -u bytepath-backend -f"
echo "  Check frontend logs: sudo journalctl -u bytepath-frontend -f"
echo "  Restart backend:     sudo systemctl restart bytepath-backend"
echo "  Restart frontend:    sudo systemctl restart bytepath-frontend"
echo "  Stop services:       sudo systemctl stop bytepath-backend bytepath-frontend"
echo ""

