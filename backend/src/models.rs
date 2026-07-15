use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub name: String,
    pub theme: String,
    pub registered_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub browser: Option<String>,
    pub device: Option<String>,
    pub is_premium: bool,
    pub flag: String,
    pub report_count: i32,
    pub reset_token: Option<String>,
    pub reset_token_expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 1))]
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ForgotPasswordRequest {
    #[validate(email)]
    pub email: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ResetPasswordRequest {
    pub token: String,
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub theme: String,
}

impl From<User> for UserResponse {
    fn from(u: User) -> Self {
        Self { id: u.id, email: u.email, name: u.name, theme: u.theme }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self { success: true, data: Some(data), message: None }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateThemeRequest {
    #[validate(length(min = 1))]
    pub theme: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TenantProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub tenant_type: String,
    pub phone: Option<String>,
    pub slug: String,
    pub category: Option<String>,
    pub account_type: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTenantRequest {
    #[validate(length(min = 1))]
    pub tenant_type: String,
    pub phone: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ProviderAuthResponse {
    pub token: String,
    pub user: UserResponse,
    pub tenant: TenantProfile,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LoginAttempt {
    pub id: Uuid,
    pub email: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub success: bool,
    pub failure_reason: Option<String>,
    pub created_at: DateTime<Utc>,
}
