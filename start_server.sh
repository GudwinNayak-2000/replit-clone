#!/bin/bash

# Change to the script's directory
cd "$(dirname "$0")"

# Print a nice header
echo "================================"
echo "   Starting Local Web Server    "
echo "================================"
echo
echo "Server will start at: http://localhost:8000"
echo "To stop the server: Press Ctrl+C"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "Error: Python is not installed!"
        echo "Please install Python from python.org"
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

# Start the server in background
echo "Starting server..."
$PYTHON_CMD -m http.server 8000 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Open in default browser (trying different commands for compatibility)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:8000/app/app.html"
else
    # Linux
    xdg-open "http://localhost:8000/app/app.html" || sensible-browser "http://localhost:8000/app/app.html" || \
    firefox "http://localhost:8000/app/app.html" || google-chrome "http://localhost:8000/app/app.html"
fi

# Keep script running and show instructions
echo
echo "Server is running. Press Ctrl+C to stop."
echo

# Wait for Ctrl+C
wait $SERVER_PID 