#!/bin/bash

echo "========================================"
echo "PLASMA CONNECT - Ngrok Startup Script"
echo "========================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ERROR: ngrok is not installed!"
    echo "Install it from: https://ngrok.com/download"
    exit 1
fi

echo "Step 1: Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "Step 2: Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

sleep 5

echo "Step 3: Starting Ngrok tunnels..."
echo ""
echo "Starting ngrok for both services..."
echo "Frontend: http://localhost:3033"
echo "Backend:  http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

ngrok start --all --config=ngrok.yml

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
