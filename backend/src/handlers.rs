use actix_web::{web, HttpResponse, HttpRequest};
use crate::{AppState, models::*, auth, db, errors::AppError};
use validator::Validate;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/auth/register", web::post().to(register))
            .route("/auth/login", web::post().to(login))
            .route("/auth/login/provider", web::post().to(login_as_provider))
            .route("/auth/me", web::get().to(get_current_user))
            .route("/auth/theme", web::put().to(update_theme))
            .route("/auth/forgot-password", web::post().to(forgot_password))
            .route("/auth/reset-password", web::post().to(reset_password))
            .route("/tenant/create", web::post().to(create_tenant))
            .route("/tenant/me", web::get().to(get_my_tenant))
            .route("/tenant/dashboard", web::get().to(get_provider_dashboard))
            .route("/health", web::get().to(health_check))
    );
}

async fn health_check() -> HttpResponse { HttpResponse::Ok().json(ApiResponse::success("ok")) }

async fn register(state: web::Data<AppState>, body: web::Json<CreateUserRequest>) -> Result<HttpResponse, AppError> {
    body.validate()?;
    match db::get_user_by_email(&state.db, &body.email).await {
        Ok(_) => return Err(AppError::Conflict("An account with this email already exists. Please log in instead.".into())),
        Err(sqlx::Error::RowNotFound) => {}
        Err(e) => return Err(e.into()),
    }
    let user = db::create_user(&state.db, &body).await?;
    let token = auth::create_token(user.id, &state.config).map_err(|_| AppError::InternalError)?;
    Ok(HttpResponse::Created().json(ApiResponse::success(AuthResponse { token, user: UserResponse::from(user) })))
}

async fn login(state: web::Data<AppState>, req: HttpRequest, body: web::Json<LoginRequest>) -> Result<HttpResponse, AppError> {
    let failed_count = db::count_recent_failed_attempts(&state.db, &body.email).await?;
    if failed_count >= 5 {
        return Err(AppError::BadRequest("Too many failed attempts. Try again in 15 minutes.".into()));
    }
    let ip = req.peer_addr().map(|addr| addr.ip().to_string());
    let user_agent = req.headers().get("User-Agent").and_then(|h| h.to_str().ok()).map(|s| s.to_string());
    let user_result = db::get_user_by_email(&state.db, &body.email).await;
    match user_result {
        Ok(user) => {
            if !db::verify_password(&body.password, &user.password_hash).await {
                let _ = db::record_login_attempt(&state.db, &body.email, ip, user_agent, false, Some("invalid_password")).await;
                return Err(AppError::Unauthorized);
            }
            let _ = db::record_login_attempt(&state.db, &body.email, ip, user_agent, true, None).await;
            let token = auth::create_token(user.id, &state.config).map_err(|_| AppError::InternalError)?;
            Ok(HttpResponse::Ok().json(ApiResponse::success(AuthResponse { token, user: UserResponse::from(user) })))
        }
        Err(sqlx::Error::RowNotFound) => {
            let _ = db::record_login_attempt(&state.db, &body.email, ip, user_agent, false, Some("user_not_found")).await;
            Err(AppError::Unauthorized)
        }
        Err(e) => Err(e.into()),
    }
}

async fn login_as_provider(state: web::Data<AppState>, req: HttpRequest, body: web::Json<LoginRequest>) -> Result<HttpResponse, AppError> {
    let failed_count = db::count_recent_failed_attempts(&state.db, &body.email).await?;
    if failed_count >= 5 {
        return Err(AppError::BadRequest("Too many failed attempts. Try again in 15 minutes.".into()));
    }
    let ip = req.peer_addr().map(|addr| addr.ip().to_string());
    let user_agent = req.headers().get("User-Agent").and_then(|h| h.to_str().ok()).map(|s| s.to_string());
    
    log::info!("Provider login attempt for: {}", body.email);
    
    let user_result = db::get_user_by_email(&state.db, &body.email).await;
    match user_result {
        Ok(user) => {
            log::info!("User found: {}", user.id);
            if !db::verify_password(&body.password, &user.password_hash).await {
                log::warn!("Invalid password for provider login: {}", body.email);
                let _ = db::record_login_attempt(&state.db, &body.email, ip, user_agent, false, Some("invalid_password")).await;
                return Err(AppError::Unauthorized);
            }
            log::info!("Password verified, checking tenant profile");
            let tenant = match db::get_tenant_by_user_id(&state.db, user.id).await {
                Ok(t) => {
                    log::info!("Tenant profile found: {}", t.id);
                    Some(t)
                },
                Err(sqlx::Error::RowNotFound) => {
                    log::warn!("No tenant profile for user: {}", user.id);
                    None
                },
                Err(e) => {
                    log::error!("DB error getting tenant: {:?}", e);
                    return Err(e.into());
                }
            };
            if tenant.is_none() {
                return Err(AppError::BadRequest("You don't have a provider account. Please register as a provider first.".into()));
            }
            let _ = db::record_login_attempt(&state.db, &body.email, ip, user_agent, true, None).await;
            let token = auth::create_token(user.id, &state.config).map_err(|_| AppError::InternalError)?;
            Ok(HttpResponse::Ok().json(ApiResponse::success(ProviderAuthResponse {
                token,
                user: UserResponse::from(user),
                tenant: tenant.unwrap(),
            })))
        }
        Err(sqlx::Error::RowNotFound) => {
            log::warn!("User not found for provider login: {}", body.email);
            let _ = db::record_login_attempt(&state.db, &body.email, ip, user_agent, false, Some("user_not_found")).await;
            Err(AppError::Unauthorized)
        }
        Err(e) => {
            log::error!("DB error in provider login: {:?}", e);
            Err(e.into())
        }
    }
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

async fn create_tenant(state: web::Data<AppState>, req: HttpRequest, body: web::Json<CreateTenantRequest>) -> Result<HttpResponse, AppError> {
    body.validate()?;
    let user_id = auth::extract_user_id(&req, &state.config)?;
    match db::get_tenant_by_user_id(&state.db, user_id).await {
        Ok(_) => return Err(AppError::Conflict("You already have a provider profile".into())),
        Err(sqlx::Error::RowNotFound) => {}
        Err(e) => return Err(e.into()),
    }
    let tenant: TenantProfile = db::create_tenant_profile(&state.db, user_id, &body.tenant_type, body.phone.as_deref(), body.category.as_deref()).await?;
    Ok(HttpResponse::Created().json(ApiResponse::success(tenant)))
}

async fn get_my_tenant(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse, AppError> {
    let user_id = auth::extract_user_id(&req, &state.config)?;
    let tenant: TenantProfile = db::get_tenant_by_user_id(&state.db, user_id).await?;
    Ok(HttpResponse::Ok().json(ApiResponse::success(tenant)))
}

async fn get_provider_dashboard(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse, AppError> {
    let user_id = auth::extract_user_id(&req, &state.config)?;
    let tenant: TenantProfile = db::get_tenant_by_user_id(&state.db, user_id).await?;
    let service_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM services WHERE account_id = $1")
        .bind(tenant.id)
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);
    let booking_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM bookings WHERE account_id = $1")
        .bind(tenant.id)
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);
    Ok(HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "tenant": tenant,
        "stats": { "services": service_count, "bookings": booking_count }
    }))))
}
