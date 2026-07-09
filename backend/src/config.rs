use std::env;
use dotenv::dotenv;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expiration: u32,
    pub server_host: String,
    pub server_port: u16,
    pub cors_origin: String,
    pub rust_log: String,
    pub max_db_connections: u32,
}

impl AppConfig {
    pub fn from_env() -> Self {
        dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://rsvp_user:rsvp_password@localhost:5432/rsvp_db".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-super-secret-jwt-key-change-in-production".to_string()),
            jwt_expiration: env::var("JWT_EXPIRATION")
                .unwrap_or_else(|_| "24".to_string())
                .parse()
                .unwrap_or(24),
            server_host: env::var("SERVER_HOST")
                .unwrap_or_else(|_| "0.0.0.0".to_string()),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .unwrap_or(8080),
            cors_origin: env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            rust_log: env::var("RUST_LOG")
                .unwrap_or_else(|_| "info".to_string()),
            max_db_connections: env::var("MAX_DB_CONNECTIONS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()
                .unwrap_or(5),
        }
    }
}
