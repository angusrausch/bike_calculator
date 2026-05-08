
use crate::entities::{cassettes, cranksets, tyres};
use crate::AppState;
use axum::{extract::State, response::Json, http::StatusCode, response::IntoResponse};

pub async fn get_cassettes(State(state): State<AppState>) -> impl IntoResponse {
    let db = &state.db;
    match cassettes::Entity::get_all(db).await {
        Ok(cassettes) => Json(cassettes).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_cranksets(State(state): State<AppState>) -> impl IntoResponse {
    let db = &state.db;
    match cranksets::Entity::get_all(db).await {
        Ok(cranksets) => Json(cranksets).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_tyres(State(state): State<AppState>) -> impl IntoResponse {
    let db = &state.db;
    match tyres::Entity::get_all(db).await {
        Ok(tyres) => Json(tyres).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}
