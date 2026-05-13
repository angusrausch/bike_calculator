use axum::{Router, routing::{get, post}};
use tower_http::cors::CorsLayer;
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
        .route("/api/get-google-maps-key", get(get_google_maps_key))
        .route("/api/get-strava-client-id", get(get_strava_client_id))
        .route("/api/strava-login", post(post_strava_login))
        .route("/api/strava-refresh", post(post_strava_refresh))
        .route("/api/strava-logout", post(post_strava_logout))
        .with_state(state);
    if let Some(cors_layer) = cors {
        app = app.layer(cors_layer);
    }
    app
}
