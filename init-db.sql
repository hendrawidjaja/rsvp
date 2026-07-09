-- Initialize RSVP database
CREATE ROLE rsvp_user WITH LOGIN PASSWORD 'rsvp_password' CREATEDB;
CREATE DATABASE rsvp_db OWNER rsvp_user;

\c rsvp_db

-- Grant permissions
GRANT ALL ON SCHEMA public TO rsvp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rsvp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rsvp_user;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(50) DEFAULT 'light' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Grant permissions on the new table
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rsvp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rsvp_user;
