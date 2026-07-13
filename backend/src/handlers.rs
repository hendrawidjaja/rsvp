use actix_web::{web, HttpResponse, HttpRequest};
use crate::{AppState, models::*, auth, db, errors::AppError};
use validator::Validate;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/auth/register", web::post().to(register))
            .route("/auth/login", web::post().to(login))
            .route("/auth/me", web::get().to(get_current_user))
            .route("/auth/theme", web::put().to(update_theme))
            .route("/auth/forgot-password", web::post().to(forgot_password))
            .route("/auth/reset-password", web::post().to(reset_password))
            .route("/health", web::get().to(health_check))
    );
}

async fn health_check() -> HttpResponse { HttpResponse::Ok().json(ApiResponse::success("ok")) }

async fn register(state: web::Data<AppState>, body: web::Json<CreateUserRequest>) -> Result<HttpResponse, AppError> {
    body.validate()?;
    match db::get_user_by_email(&state.db, &body.email).await {
        Ok(existing) => {
            if body.tenant_type.is_some() && !existing.is_tenant {
                let upgraded = db::upgrade_to_tenant(&state.db, existing.id, &body.tenant_type, &body.phone).await?;
                let token = auth::create_token(upgraded.id, &state.config).map_err(|_| AppError::InternalError)?;
                return Ok(HttpResponse::Ok().json(ApiResponse::success(AuthResponse { token, user: UserResponse::from(upgraded) })));
            }
            return Err(AppError::Conflict("Email already registered".into()));
        }
        Err(sqlx::Error::RowNotFound) => {}
        Err(e) => return Err(e.into()),
    }
    let user = db::create_user(&state.db, &body).await?;
    let token = auth::create_token(user.id, &state.config).map_err(|_| AppError::InternalError)?;
    Ok(HttpResponse::Created().json(ApiResponse::success(AuthResponse { token, user: UserResponse::from(user) })))
}

async fn login(state: web::Data<AppState>, body: web::Json<LoginRequest>) -> Result<HttpResponse, AppError> {
    let user = db::get_user_by_email(&state.db, &body.email).await?;
    if !db::verify_password(&body.password, &user.password_hash).await { return Err(AppError::Unauthorized); }
    let token = auth::create_token(user.id, &state.config).map_err(|_| AppError::InternalError)?;
    Ok(HttpResponse::Ok().json(ApiResponse::success(AuthResponse { token, user: UserResponse::from(user) })))
}

async fn forgot_password(state: web::Data<AppState>, body: web::Json<ForgotPasswordRequest>) -> Result<HttpResponse, AppError> {
    body.validate()?;
    if let Ok(_) = db::get_user_by_email(&state.db, &body.email).await { let _ = db::generate_reset_token(&state.db, &body.email).await?; }
    Ok(HttpResponse::Ok().json(ApiResponse::success("If email exists, link sent")))
}

async fn reset_password(state: web::Data<AppState>, body: web::Json<ResetPasswordRequest>) -> Result<HttpResponse, AppError> {
    body.validate()?;
    db::get_user_by_reset_token(&state.db, &body.token).await.map_err(|_| AppError::BadRequest("Invalid token".into()))?;
    db::reset_password(&state.db, &body.token, &body.password).await?;
    Ok(HttpResponse::Ok().json(ApiResponse::success("Password reset")))
}

async fn get_current_user(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse, AppError> {
    let user_id = auth::extract_user_id(&req, &state.config)?;
    Ok(HttpResponse::Ok().json(ApiResponse::success(UserResponse::from(db::get_user_by_id(&state.db, user_id).await?))))
}

async fn update_theme(state: web::Data<AppState>, req: HttpRequest, body: web::Json<UpdateThemeRequest>) -> Result<HttpResponse, AppError> {
    body.validate()?;
    if !["light", "dark"].contains(&body.theme.as_str()) { return Err(AppError::BadRequest("Invalid theme".into())); }
    let user_id = auth::extract_user_id(&req, &state.config)?;
    Ok(HttpResponse::Ok().json(ApiResponse::success(UserResponse::from(db::update_theme(&state.db, user_id, &body.theme).await?))))
}
