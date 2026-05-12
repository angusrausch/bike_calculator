
use crate::entities::{cassettes, cranksets, tyres};
use crate::calculator::calculate_ratios;
use crate::AppState;
use axum::{extract::{State, Query}, response::Json, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use serde_json::json;


#[derive(Deserialize)]
pub struct Params {
    crankset_id: Option<u16>,
    cassette_id: Option<u16>,
    tyre_id: Option<u16>,
}

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

pub async fn get_calculate_ratio(State(state): State<AppState>, Query(params): Query<Params>) -> impl IntoResponse {
    let crankset_id = params.crankset_id.unwrap_or(0);
    let cassette_id = params.cassette_id.unwrap_or(0);
    let db = &state.db;

    let crankset = cranksets::Entity::get_by_id(&db, crankset_id).await.expect("Query Failed").expect("Crankset not found");
    let cassette = cassettes::Entity::get_by_id(&db, cassette_id).await.expect("Query Failed").expect("Cassette not found");

    let crankset_rings_vec = match crankset.rings_vec() {
        Ok(v) => v,
        Err(e) => return (StatusCode::BAD_REQUEST, e).into_response(),
    };
    let cassette_sprockets_vec = match cassette.sprockets_vec() {
        Ok(v) => v,
        Err(e) => return (StatusCode::BAD_REQUEST, e).into_response(),
    };

    let ratios = calculate_ratios(&crankset_rings_vec, &cassette_sprockets_vec);

    Json(json!({
        "chainrings": crankset_rings_vec,
        "sprockets": cassette_sprockets_vec,
        "results": ratios
    }))
    .into_response()
}