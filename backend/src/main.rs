use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware};
use sqlx::postgres::PgPoolOptions;

mod handlers;
mod models;
mod auth;
mod errors;
mod db;
mod config;

pub struct AppState {
    db: sqlx::PgPool,
    config: config::AppConfig,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    let app_config = config::AppConfig::from_env();
    
    log::info!("Connecting to database...");
    
    let pool = PgPoolOptions::new()
        .max_connections(app_config.max_db_connections)
        .connect(&app_config.database_url)
        .await
        .expect("Failed to create database pool");

    log::info!("Running database migrations...");
    
    let _ = sqlx::migrate!("./migrations")
        .run(&pool)
        .await;

    let app_state = web::Data::new(AppState {
        db: pool,
        config: app_config.clone(),
    });

    log::info!("Starting server at {}:{}", app_config.server_host, app_config.server_port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin(&app_config.cors_origin)
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(app_state.clone())
            .configure(handlers::config)
    })
    .bind((app_config.server_host.as_str(), app_config.server_port))?
    .run()
    .await
}
