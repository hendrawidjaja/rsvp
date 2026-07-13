use crate::models::Claims;
use crate::config::AppConfig;
use actix_web::HttpRequest;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use uuid::Uuid;

pub fn create_token(user_id: Uuid, config: &AppConfig) -> Result<String, jsonwebtoken::errors::Error> {
    let now = chrono::Utc::now();
    let claims = Claims {
        sub: user_id.to_string(),
        exp: (now + chrono::Duration::hours(config.jwt_expiration as i64)).timestamp() as usize,
        iat: now.timestamp() as usize,
    };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(config.jwt_secret.as_bytes()))
}

pub fn validate_token(token: &str, config: &AppConfig) -> Result<Claims, jsonwebtoken::errors::Error> {
    decode::<Claims>(token, &DecodingKey::from_secret(config.jwt_secret.as_bytes()), &Validation::default()).map(|d| d.claims)
}

pub fn extract_user_id(req: &HttpRequest, config: &AppConfig) -> Result<Uuid, actix_web::Error> {
    let header = req.headers().get("Authorization").and_then(|h| h.to_str().ok()).and_then(|h| h.strip_prefix("Bearer "))
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing header"))?;
    let claims = validate_token(header, config).map_err(|_| actix_web::error::ErrorUnauthorized("Invalid token"))?;
    Uuid::parse_str(&claims.sub).map_err(|_| actix_web::error::ErrorInternalServerError("Invalid ID"))
}
