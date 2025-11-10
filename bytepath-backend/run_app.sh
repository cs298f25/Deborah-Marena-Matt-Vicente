#!/bin/sh
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$PROJECT_ROOT/venv"
REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.txt"
PORT="5001"

if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi

. "$VENV_DIR/bin/activate"

pip install --upgrade pip >/dev/null
pip install -r "$REQUIREMENTS_FILE"

export FLASK_APP=app
export FLASK_ENV=development
export FLASK_RUN_PORT="$PORT"

flask run
