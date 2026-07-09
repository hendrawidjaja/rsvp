#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Source env
export $(cat .env | grep -v '^#' | xargs)

# Run migrations (ignore if already run)
sqlx migrate run --database-url "$DATABASE_URL" 2>/dev/null || true

echo "🚀 Starting backend at http://localhost:8080"
cargo run
