use sqlx::PgPool;
use crate::models::{User, CreateUserRequest};
use uuid::Uuid;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

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

pub async fn verify_password(password: &str, hash: &str) -> bool {
    if let Ok(parsed_hash) = PasswordHash::new(hash) {
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    } else {
        false
    }
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
