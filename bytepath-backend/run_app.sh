#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"
REQUIREMENTS_FILE="$BACKEND_DIR/requirements.txt"
PORT="5000"
BACKEND_PID=""
CLEANED="no"

start_backend() {
  cd "$ROOT_DIR"

  if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
  fi

  # shellcheck disable=SC1090
  . "$VENV_DIR/bin/activate"

  echo "Installing backend dependencies..."
  pip install --upgrade pip >/dev/null
  pip install -r "$REQUIREMENTS_FILE" >/dev/null

  echo "Starting Flask API on http://127.0.0.1:$PORT ..."
  python -m backend.app &
  BACKEND_PID=$!
}

cleanup() {
  if [ "$CLEANED" = "yes" ]; then
    return
  fi
  CLEANED="yes"
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1  true
    wait "$BACKEND_PID" 2>/dev/null  true
  fi
}

handle_exit() {
  echo "\nStopping development servers..."
  cleanup
  exit 130
}

trap handle_exit INT TERM
trap cleanup EXIT

start_backend

cd "$ROOT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting Vite dev server on http://localhost:5173/ ..."
npm run dev

cleanup
﻿