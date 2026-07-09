use actix_web::{HttpResponse, ResponseError};
use derive_more::Display;
use validator::ValidationErrors;

#[derive(Debug, Display)]
pub enum AppError {
    #[display(fmt = "Internal server error")]
    InternalError,
    
    #[display(fmt = "Bad request: {}", _0)]
    BadRequest(String),
    
    #[display(fmt = "Not found")]
    NotFound,
    
    #[display(fmt = "Unauthorized")]
    Unauthorized,
    
    #[display(fmt = "Conflict: {}", _0)]
    Conflict(String),
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::InternalError => {
                HttpResponse::InternalServerError().json(serde_json::json!({
                    "success": false,
                    "message": "Internal server error"
                }))
            }
            AppError::BadRequest(message) => {
                HttpResponse::BadRequest().json(serde_json::json!({
                    "success": false,
                    "message": message
                }))
            }
            AppError::NotFound => {
                HttpResponse::NotFound().json(serde_json::json!({
                    "success": false,
                    "message": "Resource not found"
                }))
            }
            AppError::Unauthorized => {
                HttpResponse::Unauthorized().json(serde_json::json!({
                    "success": false,
                    "message": "Unauthorized"
                }))
            }
            AppError::Conflict(message) => {
                HttpResponse::Conflict().json(serde_json::json!({
                    "success": false,
                    "message": message
                }))
            }
        }
    }
}

// Implement From traits for error conversion
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound,
            _ => {
                log::error!("Database error: {:?}", err);
                AppError::InternalError
            }
        }
    }
}

impl From<ValidationErrors> for AppError {
    fn from(err: ValidationErrors) -> Self {
        AppError::BadRequest(err.to_string())
    }
}

impl From<actix_web::Error> for AppError {
    fn from(err: actix_web::Error) -> Self {
        log::error!("Actix error: {:?}", err);
        AppError::InternalError
    }
}
