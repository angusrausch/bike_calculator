use crate::entities::{cassettes, cranksets, tyres};
use crate::calculator::{calculate_ratios, calculate_rollout, calculate_speed};
use crate::AppState;
use std::sync::Arc;
use sea_orm::DatabaseConnection;
use axum::{extract::{State, Query}, response::Json, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use serde_json::json;


#[derive(Deserialize)]
pub struct Params {
    crankset_id: Option<u16>,
    cassette_id: Option<u16>,
    manual_chainring: Option<String>,
    manual_cassette: Option<String>,
    tyre_id: Option<u16>,
}

pub async fn get_cassettes(State(state): State<AppState>) -> impl IntoResponse {
    match cassettes::Entity::get_all(&state.db).await {
        Ok(c) => Json(c).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_cranksets(State(state): State<AppState>) -> impl IntoResponse {
    match cranksets::Entity::get_all(&state.db).await {
        Ok(c) => Json(c).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_tyres(State(state): State<AppState>) -> impl IntoResponse {
    match tyres::Entity::get_all(&state.db).await {
        Ok(t) => Json(t).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

fn parse_gear_string(input: &str) -> Result<Vec<u16>, String> {
    let gears: Vec<u16> = input
        .split(',')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.parse::<u16>().map_err(|_| format!("'{}' is not a valid number", s)))
        .collect::<Result<Vec<_>, _>>()?;

    if gears.is_empty() {
        return Err("No gear values provided".to_string());
    }
    Ok(gears)
}

async fn find_crankset_rings(db: &Arc<DatabaseConnection>, params: &Params,) -> Result<Vec<u16>, (StatusCode, String)> {
    if let Some(id) = params.crankset_id.filter(|&id| id != 0) {
        match cranksets::Entity::get_by_id(db, id).await {
            Ok(Some(m)) => match m.rings_vec() {
                Ok(v) => Ok(v),
                Err(e) => Err((StatusCode::BAD_REQUEST, e.to_string())),
            },
            Ok(None) => Err((StatusCode::NOT_FOUND, "Crankset ID not found".to_string())),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        let manual = params.manual_chainring.clone().unwrap_or_default();
        match parse_gear_string(&manual) {
            Ok(v) => Ok(v),
            Err(e) => Err((StatusCode::BAD_REQUEST, format!("Manual crankset: {}", e))),
        }
    }
}

async fn find_cassette_sprockets(db: &Arc<DatabaseConnection>, params: &Params,) -> Result<Vec<u16>, (StatusCode, String)> {
    if let Some(id) = params.cassette_id.filter(|&id| id != 0) {
        match cassettes::Entity::get_by_id(db, id).await {
            Ok(Some(m)) => match m.sprockets_vec() {
                Ok(v) => Ok(v),
                Err(e) => Err((StatusCode::BAD_REQUEST, e.to_string())),
            },
            Ok(None) => Err((StatusCode::NOT_FOUND, "Crankset ID not found".to_string())),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        let manual = params.manual_cassette.clone().unwrap_or_default();
        match parse_gear_string(&manual) {
            Ok(v) => Ok(v),
            Err(e) => Err((StatusCode::BAD_REQUEST, format!("Manual crankset: {}", e))),
        }
    }
}

async fn find_tyre_circumference(db: &Arc<DatabaseConnection>, params: &Params) -> Result<u16, (StatusCode, String)> {
    if let Some(id) = params.tyre_id.filter(|&id| id != 0) {
        match tyres::Entity::get_by_id(db, id).await {
            Ok(Some(m)) => Ok(m.circumference),
            Ok(None) => Err((StatusCode::NOT_FOUND, "Tyre ID not found".to_string())),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        Err((StatusCode::BAD_REQUEST, "Tyre ID not provided".to_string()))
    }
}

pub async fn get_calculate_ratio(State(state): State<AppState>, Query(params): Query<Params>) -> impl IntoResponse {
    let crankset_rings = match find_crankset_rings(&state.db, &params).await {
        Ok(v) => v,
        Err(e) => return e.into_response(),
    };
    let cassette_sprockets = match find_cassette_sprockets(&state.db, &params).await {
        Ok(v) => v,
        Err(e) => return e.into_response(),
    };

    let ratios = calculate_ratios(&crankset_rings, &cassette_sprockets);

    Json(json!({
        "chainrings": crankset_rings,
        "sprockets": cassette_sprockets,
        "results": ratios
    }))
    .into_response()
}

pub async fn get_calculate_rollout(State(state): State<AppState>, Query(params): Query<Params>) -> impl IntoResponse {
    let crankset_rings = match find_crankset_rings(&state.db, &params).await {
        Ok(v) => v,
        Err(e) => return e.into_response(),
    };
    let cassette_sprockets = match find_cassette_sprockets(&state.db, &params).await {
        Ok(v) => v,
        Err(e) => return e.into_response(),
    };
    let tyre_circumference = match find_tyre_circumference(&state.db, &params).await {
        Ok(v) => v,
        Err(e) => return e.into_response(),
    };

    let rollouts = calculate_rollout(&crankset_rings, &cassette_sprockets, &tyre_circumference);

    Json(json!({
        "chainrings": crankset_rings,
        "sprockets": cassette_sprockets,
        "tyre_circumference": tyre_circumference,
        "results": rollouts
    }))
    .into_response()
}
