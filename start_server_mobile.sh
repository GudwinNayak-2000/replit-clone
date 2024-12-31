#!/bin/bash

# Print header
echo "================================"
echo "   Mobile Server Setup Guide    "
echo "================================"
echo

# Check if running in Termux or iSH
if [ -d "/data/data/com.termux" ]; then
    echo "Detected: Termux (Android)"
    
    # Check for Python
    if ! command -v python &> /dev/null; then
        echo "Python not found. Installing..."
        pkg update
        pkg install python
    fi
    
elif [ -d "/usr/local/ish" ]; then
    echo "Detected: iSH (iOS)"
    
    # Check for Python
    if ! command -v python &> /dev/null; then
        echo "Python not found. Installing..."
        apk update
        apk add python3
    fi
else
    echo "Please install Termux (Android) or iSH (iOS)"
    exit 1
fi

# Start server
echo
echo "Starting server..."
echo "Access at: http://localhost:8000/app/replit.html"
echo "Or try: http://YOUR_IP_ADDRESS:8000/app/replit.html"
echo
echo "To find your IP, type 'ifconfig' in another terminal"
echo "To stop server: Press Ctrl+C"
echo

python -m http.server 8000 