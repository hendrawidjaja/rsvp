#!/bin/bash

set -e

echo "========================================="
echo "Setting up RSVP Backend"
echo "========================================="

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Install sqlx-cli
if ! command -v sqlx &> /dev/null; then
    echo "Installing sqlx-cli..."
    cargo install sqlx-cli --no-default-features --features postgres
fi

# Source .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "❌ .env file not found!"
    exit 1
fi

# Detect Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "⚠️  Docker Compose not found. Please install Docker."
    DOCKER_COMPOSE=""
fi

echo ""
echo "1. Cleaning up old containers..."
# Remove old containers if they exist
docker stop rsvp-postgres rsvp-postgres-db rsvp-redis rsvp-redis-cache 2>/dev/null || true
docker rm rsvp-postgres rsvp-postgres-db rsvp-redis rsvp-redis-cache 2>/dev/null || true

if [ -n "$DOCKER_COMPOSE" ] && [ -f ../docker-compose.yml ]; then
    cd ..
    $DOCKER_COMPOSE down --remove-orphans 2>/dev/null || true
    cd backend
fi

echo ""
echo "2. Starting Docker services..."
if [ -n "$DOCKER_COMPOSE" ] && [ -f ../docker-compose.yml ]; then
    cd ..
    $DOCKER_COMPOSE up -d
    
    echo "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if $DOCKER_COMPOSE exec -T postgres pg_isready -U postgres &> /dev/null; then
            echo "✅ PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ PostgreSQL failed to start"
            $DOCKER_COMPOSE logs postgres
            exit 1
        fi
        sleep 1
    done
    cd backend
else
    echo "⚠️  Checking if PostgreSQL is running locally..."
    if command -v pg_isready &> /dev/null; then
        if ! pg_isready -h localhost -p 5432 &> /dev/null; then
            echo "❌ PostgreSQL is not running. Please start it manually."
            exit 1
        fi
    fi
fi

echo ""
echo "3. Setting up database..."

if [ -n "$DOCKER_COMPOSE" ] && [ -f ../docker-compose.yml ]; then
    echo "Using Docker to setup database..."
    cd ..
    
    # Create user if not exists
    echo "Creating database user..."
    $DOCKER_COMPOSE exec -T postgres psql -U postgres -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rsvp_user') THEN CREATE USER rsvp_user WITH PASSWORD 'rsvp_password'; END IF; END \$\$;" 2>/dev/null || true
    
    # Create database if not exists
    echo "Creating database..."
    $DOCKER_COMPOSE exec -T postgres psql -U postgres -c "CREATE DATABASE rsvp_db OWNER rsvp_user;" 2>/dev/null || echo "Database might already exist"
    
    # Grant privileges
    echo "Granting privileges..."
    $DOCKER_COMPOSE exec -T postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE rsvp_db TO rsvp_user;" 2>/dev/null || true
    
    cd backend
    echo "✅ Database setup complete"
else
    echo "Please create the database manually:"
    echo "  CREATE USER rsvp_user WITH PASSWORD 'rsvp_password';"
    echo "  CREATE DATABASE rsvp_db OWNER rsvp_user;"
    echo "  GRANT ALL PRIVILEGES ON DATABASE rsvp_db TO rsvp_user;"
fi

echo ""
echo "4. Running database migrations..."
sqlx migrate run --database-url "$DATABASE_URL"

echo ""
echo "========================================="
echo "✅ Setup completed successfully!"
echo "========================================="
echo ""
echo "Start the backend with: cargo run"
echo "Start the frontend with: cd .. && pnpm dev"
echo ""
