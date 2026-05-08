use dotenvy::dotenv;
use axum::{routing::get,Router,};
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use http::{HeaderValue, Method};

use crate::entities::{cranksets, cassettes, tyres};
use crate::controllers::{get_cassettes, get_cranksets, get_tyres};

mod calculator;
mod entities;
mod controllers;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let server_port = std::env::var("SERVER_PORT").expect("Server port must be set");
    let db_url = std::env::var("DATABASE_CONNECTION_STRING").expect("DB URL must be set");

    let frontend_url = std::env::var("FRONTEND_URL")
        .expect("FRONTEND_URL must be set")
        .parse::<HeaderValue>()
        .expect("Invalid FRONTEND_URL format");

    let cors = CorsLayer::new()
        .allow_origin(frontend_url)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    let db = sea_orm::Database::connect(&db_url).await?;
    let state = AppState { db: Arc::new(db) };

    let app = Router::new()
        .route("/api/cassettes", get(get_cassettes))
        .route("/api/cranksets", get(get_cranksets))
        .route("/api/tyres", get(get_tyres))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", server_port))
        .await
        .unwrap();
        
    
    axum::serve(listener, app.into_make_service()).await.unwrap();

    Ok(())
}

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
}
