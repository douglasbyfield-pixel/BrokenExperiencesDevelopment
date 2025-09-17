#!/bin/bash

# Easy Tunneling Setup Script

echo "Setting up tunnel for BrokenExp app..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install ngrok/ngrok/ngrok
    else
        # Linux/Other
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    fi
fi

# Start Metro bundler in background
echo "Starting Metro bundler..."
npx expo start --tunnel &
METRO_PID=$!

# Wait for Metro to start
sleep 5

echo ""
echo "==================================="
echo "Your app is now accessible via tunnel!"
echo "==================================="
echo ""
echo "Share this QR code or URL with anyone to test your app:"
echo ""
echo "To stop the tunnel, press Ctrl+C"
echo ""

# Wait for user to stop
wait $METRO_PID