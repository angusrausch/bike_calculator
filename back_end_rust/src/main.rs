use std::env;
use dotenvy::dotenv;
use tracing_subscriber::{fmt, EnvFilter};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use http::{HeaderValue, Method};
use http::header::{CONTENT_TYPE, AUTHORIZATION};

mod app_builder;
use app_builder::build_app;
use bike_calculator_backend::AppState;

mod calculator;
mod entities;
mod controllers;

#[tokio::main]
#[cfg(not(tarpaulin_include))]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // set default to trace so the TraceLayer emits request start/response/failure logs
    fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("trace")))
        .init();

    dotenv().ok();

    let args: Vec<String> = env::args().collect();

    let server_port: String;
    if args.len() > 1 && args[1] == "--port" {
        server_port = args[2].clone();
    } else {
        server_port = std::env::var("SERVER_PORT").expect("Server port must be set");
    }

    let db_url = std::env::var("DATABASE_CONNECTION_STRING").expect("DB URL must be set");

    let frontend_url = std::env::var("FRONTEND_URL")
        .expect("FRONTEND_URL must be set")
        .parse::<HeaderValue>()
        .expect("Invalid FRONTEND_URL format");

    let cors = CorsLayer::new()
        .allow_origin(frontend_url)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION])
        .allow_credentials(true);

    let db = sea_orm::Database::connect(&db_url).await?;
    let state = AppState { db: Arc::new(db) };

    let app = build_app(state, Some(cors));

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", server_port))
        .await
        .unwrap();

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .unwrap();

    Ok(())
}

