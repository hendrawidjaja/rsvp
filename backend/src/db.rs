use sqlx::PgPool;
use crate::models::{User, TenantProfile, CreateUserRequest};
use uuid::Uuid;
use chrono::{Utc, Duration};
use argon2::{password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString}, Argon2};
use rand::Rng;

pub async fn create_user(pool: &PgPool, req: &CreateUserRequest) -> Result<User, sqlx::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default().hash_password(req.password.as_bytes(), &salt).expect("hash").to_string();
    sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash, name, theme) VALUES ($1, $2, $3, 'light') RETURNING *"
    )
    .bind(&req.email).bind(&hash).bind(&req.name)
    .fetch_one(pool).await
}

pub async fn get_user_by_email(pool: &PgPool, email: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1").bind(email).fetch_one(pool).await
}

pub async fn get_user_by_id(pool: &PgPool, id: Uuid) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1").bind(id).fetch_one(pool).await
}

pub async fn verify_password(password: &str, hash: &str) -> bool {
    PasswordHash::new(hash).map(|h| Argon2::default().verify_password(password.as_bytes(), &h).is_ok()).unwrap_or(false)
}

pub async fn generate_reset_token(pool: &PgPool, email: &str) -> Result<String, sqlx::Error> {
    let token: String = rand::thread_rng().sample_iter(&rand::distributions::Alphanumeric).take(64).map(char::from).collect();
    sqlx::query("UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE email = $3")
        .bind(&token).bind(Utc::now() + Duration::hours(1)).bind(email).execute(pool).await?;
    Ok(token)
}

pub async fn reset_password(pool: &PgPool, token: &str, password: &str) -> Result<(), sqlx::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default().hash_password(password.as_bytes(), &salt).expect("hash").to_string();
    sqlx::query("UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE reset_token = $2")
        .bind(&hash).bind(token).execute(pool).await?;
    Ok(())
}

pub async fn update_theme(pool: &PgPool, user_id: Uuid, theme: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("UPDATE users SET theme = $1 WHERE id = $2 RETURNING *").bind(theme).bind(user_id).fetch_one(pool).await
}

pub async fn get_user_by_reset_token(pool: &PgPool, token: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()")
        .bind(token).fetch_one(pool).await
}

pub async fn update_login_meta(pool: &PgPool, user_id: Uuid, browser: &str, device: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET last_login_at = NOW(), browser = $1, device = $2 WHERE id = $3")
        .bind(browser).bind(device).bind(user_id).execute(pool).await?;
    Ok(())
}

pub async fn add_report(pool: &PgPool, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET report_count = report_count + 1 WHERE id = $1").bind(user_id).execute(pool).await?;
    sqlx::query("UPDATE users SET flag = CASE WHEN report_count > 250 THEN 'red' WHEN report_count > 50 THEN 'yellow' ELSE flag END WHERE id = $1")
        .bind(user_id).execute(pool).await?;
    Ok(())
}

pub async fn create_tenant_profile(pool: &PgPool, user_id: Uuid, tenant_type: &str, phone: Option<&str>, category: Option<&str>) -> Result<TenantProfile, sqlx::Error> {
    let slug = format!("tenant-{}", &user_id.to_string()[..8]);
    let account_type = category.map(|_| "place").unwrap_or("individual");
    sqlx::query_as::<_, TenantProfile>(
        "INSERT INTO tenant_profiles (user_id, tenant_type, phone, slug, category, account_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
    )
    .bind(user_id).bind(tenant_type).bind(phone).bind(&slug).bind(category).bind(account_type)
    .fetch_one(pool).await
}

pub async fn get_tenant_by_user_id(pool: &PgPool, user_id: Uuid) -> Result<TenantProfile, sqlx::Error> {
    sqlx::query_as::<_, TenantProfile>("SELECT * FROM tenant_profiles WHERE user_id = $1").bind(user_id).fetch_one(pool).await
}

pub async fn get_tenant_by_slug(pool: &PgPool, slug: &str) -> Result<TenantProfile, sqlx::Error> {
    sqlx::query_as::<_, TenantProfile>("SELECT * FROM tenant_profiles WHERE slug = $1").bind(slug).fetch_one(pool).await
}

pub async fn record_login_attempt(pool: &PgPool, email: &str, ip: Option<String>, user_agent: Option<String>, success: bool, failure_reason: Option<&str>) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason) VALUES ($1, $2::INET, $3, $4, $5)")
    .bind(email).bind(ip).bind(user_agent).bind(success).bind(failure_reason)
    .execute(pool).await?;
    Ok(())
}

pub async fn count_recent_failed_attempts(pool: &PgPool, email: &str) -> Result<i32, sqlx::Error> {
    let count: (i32,) = sqlx::query_as("SELECT count_recent_failed_attempts($1)")
    .bind(email).fetch_one(pool).await?;
    Ok(count.0)
}
