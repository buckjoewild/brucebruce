#!/bin/bash
# BruceOps MCP Server - Mac/Linux Setup Script

echo ""
echo "========================================"
echo "BruceOps MCP Server Setup"
echo "========================================"
echo ""

# Check if UV is installed
if ! command -v uv &> /dev/null; then
    echo "ERROR: UV not found!"
    echo "Please install UV first: https://docs.astral.sh/uv/"
    exit 1
fi

echo "[1/4] Creating virtual environment..."
uv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo "[2/4] Activating virtual environment..."
source .venv/bin/activate

echo "[3/4] Installing dependencies..."
uv pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "[4/4] Testing server..."
echo ""
echo "Starting test run (press Ctrl+C to stop)..."
python bruceops_mcp_server.py
if [ $? -ne 0 ]; then
    echo ""
    echo "WARNING: Server test failed"
    echo "This might be normal if BruceOps isn't running yet"
    echo ""
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Make sure BruceOps is running at localhost:5000"
echo "2. Configure Claude Desktop (see SETUP_INSTRUCTIONS.md)"
echo "3. Restart Claude Desktop"
echo ""
echo "Current directory: $(pwd)"
echo "Use this path in your Claude Desktop config!"
echo ""
