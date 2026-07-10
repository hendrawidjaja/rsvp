use sqlx::PgPool;
use crate::models::{User, CreateUserRequest};
use uuid::Uuid;
use chrono::{Utc, Duration};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rand::Rng;

pub async fn create_user(pool: &PgPool, req: &CreateUserRequest) -> Result<User, sqlx::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(req.password.as_bytes(), &salt)
        .expect("Failed to hash password")
        .to_string();

    sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash, name, theme) VALUES ($1, $2, $3, 'light') RETURNING *"
    )
    .bind(&req.email)
    .bind(&password_hash)
    .bind(&req.name)
    .fetch_one(pool)
    .await
}

pub async fn get_user_by_email(pool: &PgPool, email: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(email)
        .fetch_one(pool)
        .await
}

pub async fn get_user_by_id(pool: &PgPool, id: Uuid) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await
}

pub async fn get_user_by_reset_token(pool: &PgPool, token: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()"
    )
    .bind(token)
    .fetch_one(pool)
    .await
}

pub async fn verify_password(password: &str, hash: &str) -> bool {
    if let Ok(parsed_hash) = PasswordHash::new(hash) {
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    } else {
        false
    }
}

pub async fn generate_reset_token(pool: &PgPool, email: &str) -> Result<String, sqlx::Error> {
    let token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(64)
        .map(char::from)
        .collect();
    
    let expires_at = Utc::now() + Duration::hours(1);

    sqlx::query(
        "UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE email = $3"
    )
    .bind(&token)
    .bind(expires_at)
    .bind(email)
    .execute(pool)
    .await?;

    Ok(token)
}

pub async fn reset_password(pool: &PgPool, token: &str, password: &str) -> Result<(), sqlx::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .expect("Failed to hash password")
        .to_string();

    sqlx::query(
        "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE reset_token = $2"
    )
    .bind(&password_hash)
    .bind(token)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn update_theme(pool: &PgPool, user_id: Uuid, theme: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        "UPDATE users SET theme = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
    )
    .bind(theme)
    .bind(user_id)
    .fetch_one(pool)
    .await
}
