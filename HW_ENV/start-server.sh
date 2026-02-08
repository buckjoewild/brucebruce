#!/bin/bash
# Start the MUD server

cd "$(dirname "$0")"
export PYTHONPATH="$(pwd):$PYTHONPATH"

echo "Starting HW_ENV MUD Server..."
python mud_server.py
