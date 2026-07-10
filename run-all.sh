#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo "✅ All services stopped"
}
trap cleanup SIGINT SIGTERM

# Ensure Docker is running
echo "Checking Docker services..."
if ! $DOCKER_COMPOSE ps 2>/dev/null | grep postgres | grep -q Up; then
    echo "Starting Docker services..."
    $DOCKER_COMPOSE up -d
    sleep 5
fi

# Start backend (skip migration errors)
echo "Starting backend..."
cd backend
export $(cat .env | grep -v '^#' | xargs)
cargo run &
BACKEND_PID=$!
cd ..

# Wait for backend
echo "Waiting for backend..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/health &> /dev/null; then
        echo "✅ Backend is ready"
        break
    fi
    sleep 1
done

# Start frontend
echo "Starting frontend..."
bun dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "✅ RSVP App is running!"
echo "========================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

wait
