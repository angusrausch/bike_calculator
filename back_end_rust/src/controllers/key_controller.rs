use axum::{extract::{State, Query}, response::Json, http::StatusCode, response::IntoResponse};
use serde_json::json;

pub async fn get_google_maps_key() -> impl IntoResponse {
    Json(json!({
        "google_maps_key": std::env::var("GOOGLE_MAPS_KEY").expect("Google Maps Key must be set")
    }))
}

pub async fn get_strava_client_id() -> impl IntoResponse {
    Json(json!({
        "strava_client_id": std::env::var("STRAVA_CLIENT_ID").expect("Strava Client ID must be set")
    }))
}