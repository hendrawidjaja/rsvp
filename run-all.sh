#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Detect Docker Compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Cleanup function
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
    echo "Waiting for PostgreSQL..."
    sleep 10
    
    # Verify database setup
    $DOCKER_COMPOSE exec -T postgres psql -U postgres -c "ALTER ROLE rsvp_user WITH LOGIN PASSWORD 'rsvp_password';" 2>/dev/null || true
    $DOCKER_COMPOSE exec -T postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE rsvp_db TO rsvp_user;" 2>/dev/null || true
fi

# Start backend
echo "Starting backend..."
cd backend
export $(cat .env | grep -v '^#' | xargs)
sqlx migrate run --database-url "$DATABASE_URL" 2>/dev/null || true
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
echo "Health:   http://localhost:8080/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

wait
