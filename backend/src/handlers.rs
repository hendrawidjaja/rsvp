use actix_web::{web, HttpResponse, HttpRequest};
use crate::{
    AppState,
    models::*,
    auth,
    db,
    errors::AppError,
};
use validator::Validate;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/auth/register", web::post().to(register))
            .route("/auth/login", web::post().to(login))
            .route("/auth/me", web::get().to(get_current_user))
            .route("/auth/theme", web::put().to(update_theme))
            .route("/health", web::get().to(health_check))
            .route("/config", web::get().to(get_config))
    );
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Server is running"))
}

async fn get_config(state: web::Data<AppState>) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "app": {
            "name": "RSVP App",
            "version": "1.0.0"
        },
        "server_port": state.config.server_port,
        "database_host": "localhost",
        "redis_host": "localhost"
    }))
}

async fn register(
    state: web::Data<AppState>,
    body: web::Json<CreateUserRequest>,
) -> Result<HttpResponse, AppError> {
    body.validate()?;

    match db::get_user_by_email(&state.db, &body.email).await {
        Ok(_) => return Err(AppError::Conflict("Email already registered".to_string())),
        Err(sqlx::Error::RowNotFound) => {},
        Err(e) => return Err(e.into()),
    }

    let user = db::create_user(&state.db, &body).await?;
    let token = auth::create_token(user.id, &state.config)
        .map_err(|_| AppError::InternalError)?;

    Ok(HttpResponse::Created().json(ApiResponse::success(AuthResponse {
        token,
        user: UserResponse::from(user),
    })))
}

async fn login(
    state: web::Data<AppState>,
    body: web::Json<LoginRequest>,
) -> Result<HttpResponse, AppError> {
    let user = db::get_user_by_email(&state.db, &body.email).await?;

    if !db::verify_password(&body.password, &user.password_hash).await {
        return Err(AppError::Unauthorized);
    }

    let token = auth::create_token(user.id, &state.config)
        .map_err(|_| AppError::InternalError)?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(AuthResponse {
        token,
        user: UserResponse::from(user),
    })))
}

async fn get_current_user(
    state: web::Data<AppState>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let user_id = auth::extract_user_id(&req, &state.config)?;
    let user = db::get_user_by_id(&state.db, user_id).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(UserResponse::from(user))))
}

async fn update_theme(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<UpdateThemeRequest>,
) -> Result<HttpResponse, AppError> {
    body.validate()?;

    let valid_themes = vec!["light", "dark", "blue", "green", "purple", "high-contrast"];
    if !valid_themes.contains(&body.theme.as_str()) {
        return Err(AppError::BadRequest(format!(
            "Invalid theme. Valid themes: {}",
            valid_themes.join(", ")
        )));
    }

    let user_id = auth::extract_user_id(&req, &state.config)?;
    let user = db::update_theme(&state.db, user_id, &body.theme).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(UserResponse::from(user))))
}
