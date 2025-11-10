#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
REQUIREMENTS_FILE="$SCRIPT_DIR/requirements.txt"
PORT="5001"
BACKEND_PID=""
CLEANED="no"

start_backend() {
  cd "$SCRIPT_DIR"

  if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
  fi

  # shellcheck disable=SC1090
  . "$VENV_DIR/bin/activate"

  echo "Installing backend dependencies..."
  pip install --upgrade pip >/dev/null
  pip install -r "$REQUIREMENTS_FILE" >/dev/null

  export FLASK_APP=app
  export FLASK_ENV=development
  export FLASK_RUN_PORT="$PORT"

  echo "Starting Flask API on http://127.0.0.1:$PORT ..."
  flask run
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

start_backend &
BACKEND_PID=$!

cd "$ROOT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting Vite dev server on http://localhost:5173/ ..."
npm run dev

cleanup
﻿