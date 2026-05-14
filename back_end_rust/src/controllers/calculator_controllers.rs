use crate::entities::prelude::*;
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
    min_cadence: Option<String>,
    max_cadence: Option<String>,
    cadence_increment: Option<String>
}

pub async fn get_cassettes(State(state): State<AppState>) -> impl IntoResponse {
    match Cassettes::get_all(&state.db).await {
        Ok(c) => Json(c).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_cranksets(State(state): State<AppState>) -> impl IntoResponse {
    match Cranksets::get_all(&state.db).await {
        Ok(c) => Json(c).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_tyres(State(state): State<AppState>) -> impl IntoResponse {
    match Tyres::get_all(&state.db).await {
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
        match Cranksets::get_by_id(db, id).await {
            Ok(Some(m)) => match m.rings_vec() {
                Ok(v) => Ok(v),
                Err(e) => Err((StatusCode::BAD_REQUEST, e.to_string())),
            },
            Ok(None) => Err((StatusCode::NOT_FOUND, "Crankset not found".to_string())),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        let manual = params.manual_chainring.clone().unwrap_or_default();
        match parse_gear_string(&manual) {
            Ok(v) => Ok(v),
            Err(_) => Err((StatusCode::BAD_REQUEST, format!("Invalid Manual Crankset"))),
        }
    }
}

async fn find_cassette_sprockets(db: &Arc<DatabaseConnection>, params: &Params,) -> Result<Vec<u16>, (StatusCode, String)> {
    if let Some(id) = params.cassette_id.filter(|&id| id != 0) {
        match Cassettes::get_by_id(db, id).await {
            Ok(Some(m)) => match m.sprockets_vec() {
                Ok(v) => Ok(v),
                Err(e) => Err((StatusCode::BAD_REQUEST, e.to_string())),
            },
            Ok(None) => Err((StatusCode::NOT_FOUND, "Cassette not found".to_string())),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        let manual = params.manual_cassette.clone().unwrap_or_default();
        match parse_gear_string(&manual) {
            Ok(v) => Ok(v),
            Err(_) => Err((StatusCode::BAD_REQUEST, format!("Invalid Manual Cassette"))),
        }
    }
}

async fn find_tyre_circumference(db: &Arc<DatabaseConnection>, params: &Params) -> Result<u16, (StatusCode, String)> {
    if let Some(id) = params.tyre_id.filter(|&id| id != 0) {
        match Tyres::get_by_id(db, id).await {
            Ok(Some(m)) => Ok(m.circumference as u16),
            Ok(None) => Err((StatusCode::NOT_FOUND, "Tyre not found".to_string())),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        Err((StatusCode::BAD_REQUEST, "Tyre ID not provided".to_string()))
    }
}

async fn get_cadence_list(params: &Params) -> Result<Vec<u16>, (StatusCode, String)> {
    let min_cadence: u16 = match params.min_cadence.as_deref() {
        Some(s) if !s.is_empty() => match s.parse::<u16>() {
            Ok(n) => n,
            Err(_) => return Err((StatusCode::BAD_REQUEST, "Invalid minimum cadence".to_string())),
        },
        _ => 60,
    };

    let max_cadence: u16 = match params.max_cadence.as_deref() {
        Some(s) if !s.is_empty() => match s.parse::<u16>() {
            Ok(n) => n,
            Err(_) => return Err((StatusCode::BAD_REQUEST, "Invalid maximum cadence".to_string())),
        },
        _ => 120,
    };

    let cadence_increment: u16 = match params.cadence_increment.as_deref() {
        Some(s) if !s.is_empty() => match s.parse::<u16>() {
            Ok(n) => n,
            Err(_) => return Err((StatusCode::BAD_REQUEST, "Invalid cadence increment".to_string())),
        },
        _ => 10,
    };
    if cadence_increment == 0 {
        return Err((StatusCode::BAD_REQUEST, "cadence_increment must be greater than 0".to_string()));
    }
    if min_cadence > max_cadence {
        return Err((StatusCode::BAD_REQUEST, "min_cadence cannot be greater than max_cadence".to_string()));
    }
    let cadence_list: Vec<u16> = (min_cadence..=max_cadence).step_by(cadence_increment as usize).collect();

    if cadence_list.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "No cadence values produced with given parameters".to_string()));
    }

    Ok(cadence_list)
}

pub async fn get_calculate_ratio(State(state): State<AppState>, Query(params): Query<Params>) -> impl IntoResponse {
    let crankset_rings = match find_crankset_rings(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };
    let cassette_sprockets = match find_cassette_sprockets(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
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
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };
    let cassette_sprockets = match find_cassette_sprockets(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };
    let tyre_circumference = match find_tyre_circumference(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
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

pub async fn get_calculate_speed(State(state): State<AppState>, Query(params): Query<Params>) -> impl IntoResponse {
    let crankset_rings = match find_crankset_rings(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };
    let cassette_sprockets = match find_cassette_sprockets(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };
    let tyre_circumference = match find_tyre_circumference(&state.db, &params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };

    let cadence_list = match get_cadence_list(&params).await {
        Ok(v) => v,
        Err((status, msg)) => return (status, Json(json!({"error": msg}))).into_response(),
    };

    let speeds = calculate_speed(&crankset_rings, &cassette_sprockets, &tyre_circumference, &cadence_list);

    Json(json!({
        "chainrings": crankset_rings,
        "sprockets": cassette_sprockets,
        "tyre_circumference": tyre_circumference,
        "cadences": cadence_list,
        "results": speeds
    }))
    .into_response()
}