#!/bin/bash
set -e

# BytePath Local Development Deployment Script
# This script starts both the backend and frontend servers for local development

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"

echo "=========================================="
echo "BytePath Local Development Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "Frontend server stopped"
    fi
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Step 1: Check Python
echo "Step 1: Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 is not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}Found Python: $PYTHON_VERSION${NC}"

# Step 2: Setup Backend
echo ""
echo "Step 2: Setting up backend..."
cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies if needed
if [ ! -f ".deps_installed" ] || [ "requirements.txt" -nt ".deps_installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt --quiet
    touch .deps_installed
    echo -e "${GREEN}Dependencies installed${NC}"
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi

# Check if database exists, if not initialize it
cd "$PROJECT_ROOT"  # Need to be in project root for module imports
if [ ! -f "$BACKEND_DIR/bytepath.db" ]; then
    echo "Initializing database..."
    export PYTHONPATH="$PROJECT_ROOT"
    python3 -m backend.init_db || echo -e "${YELLOW}Warning: Database initialization may have failed${NC}"
fi

# Step 3: Start Backend Server
echo ""
echo "Step 3: Starting backend server..."
cd "$PROJECT_ROOT"  # Run from project root, not backend directory

# Activate venv (using absolute path)
source "$BACKEND_DIR/.venv/bin/activate"

# Set environment variables
export FLASK_ENV=development
export BYTEPATH_SECRET_KEY=${BYTEPATH_SECRET_KEY:-"dev-secret-key-change-me"}
export CORS_ORIGINS="http://localhost:5173"
export PYTHONPATH="$PROJECT_ROOT"  # Add project root to Python path

# Start backend in background
python3 -m backend.app > /tmp/bytepath-backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}Backend server started (PID: $BACKEND_PID)${NC}"
    echo "  Backend API: http://localhost:5000"
    echo "  Logs: /tmp/bytepath-backend.log"
else
    echo -e "${RED}ERROR: Backend server failed to start${NC}"
    echo "Check logs: /tmp/bytepath-backend.log"
    cat /tmp/bytepath-backend.log
    exit 1
fi

# Step 4: Check Node.js
echo ""
echo "Step 4: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    cleanup
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}Found Node.js: $NODE_VERSION${NC}"

# Step 5: Setup Frontend
echo ""
echo "Step 5: Setting up frontend..."
cd "$FRONTEND_DIR"

# Install npm dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.install_time" ]; then
    echo "Installing npm dependencies..."
    npm install
    touch node_modules/.install_time
    echo -e "${GREEN}Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}Frontend dependencies already installed${NC}"
fi

# Step 6: Start Frontend Server
echo ""
echo "Step 6: Starting frontend server..."
cd "$FRONTEND_DIR"

# Start frontend in background
npm run dev > /tmp/bytepath-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}Frontend server started (PID: $FRONTEND_PID)${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Logs: /tmp/bytepath-frontend.log"
else
    echo -e "${RED}ERROR: Frontend server failed to start${NC}"
    echo "Check logs: /tmp/bytepath-frontend.log"
    cat /tmp/bytepath-frontend.log
    cleanup
    exit 1
fi

# Step 7: Display status
echo ""
echo "=========================================="
echo -e "${GREEN}BytePath is running!${NC}"
echo "=========================================="
echo ""
echo "Services:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo "  API:      http://localhost:5000/api"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/bytepath-backend.log"
echo "  Frontend: tail -f /tmp/bytepath-frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for user interrupt
wait

