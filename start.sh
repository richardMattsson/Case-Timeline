#!/bin/bash

# Start Docker containers
echo "Starting Docker containers..."
docker compose start

# Start backend with nodemon in background
echo "Starting backend..."
cd backend
npx nodemon index.js &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "All services started."
echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services."

# Wait and clean up both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
