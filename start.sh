#!/bin/bash

set -e

echo "========================================="
echo "Starting RSVP App - Fresh Start"
echo "========================================="

# Kill any processes using required ports
echo "Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Force remove old containers
echo "Removing old containers..."
docker stop rsvp-postgres rsvp-postgres-db rsvp-redis rsvp-redis-cache 2>/dev/null || true
docker rm rsvp-postgres rsvp-postgres-db rsvp-redis rsvp-redis-cache 2>/dev/null || true

# Start fresh containers
echo "Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose down --remove-orphans 2>/dev/null || true
    docker-compose up -d
elif command -v docker &> /dev/null; then
    docker compose down --remove-orphans 2>/dev/null || true
    docker compose up -d
fi

# Setup and start backend
echo "Setting up backend..."
cd backend
./setup.sh
echo "Starting backend server..."
cargo run &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting frontend..."
if command -v pnpm &> /dev/null; then
    pnpm dev &
elif command -v bun &> /dev/null; then
    bun dev &
else
    npm run dev &
fi
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "✅ App is starting!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8080"
echo "Health: http://localhost:8080/api/health"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down 2>/dev/null; exit" SIGINT SIGTERM

wait
