use axum::{Router, routing::get};
use tower_http::cors::{Any, CorsLayer};
use http::{HeaderValue, Method};
use std::sync::Arc;
use crate::controllers::{*};
use crate::AppState;

pub fn build_app(state: AppState, cors: Option<CorsLayer>) -> Router {
    let mut app = Router::new()
        .route("/api/cassettes", get(get_cassettes))
        .route("/api/cranksets", get(get_cranksets))
        .route("/api/tyres", get(get_tyres))
        .route("/api/calculate/ratio", get(get_calculate_ratio))
        .route("/api/calculate/rollout", get(get_calculate_rollout))
        .route("/api/calculate/speed", get(get_calculate_speed))
        .with_state(state);
    if let Some(cors_layer) = cors {
        app = app.layer(cors_layer);
    }
    app
}
