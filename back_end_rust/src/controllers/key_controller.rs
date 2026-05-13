use axum::{extract::Query, response::Json, http::StatusCode, response::IntoResponse};
use axum::body::{Body, to_bytes};
use serde_json::json;
use serde::Deserialize;
use serde_json::Value as JsonValue;
use reqwest::Error;
use std::collections::HashMap;
use http::{HeaderMap, HeaderValue};
use http::header::SET_COOKIE;

fn encode_form(data: &HashMap<&str, String>) -> String {
    data.iter()
        .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
        .collect::<Vec<_>>()
        .join("&")
}

#[derive(Deserialize)]
pub struct Params {
    pub code: Option<String>,
}

pub async fn get_google_maps_key() -> impl IntoResponse {
    Json(json!({
        "google_maps_key": std::env::var("GOOGLE_MAPS_KEY").expect("Google Maps Key must be set")
    }))
}

async fn strava_client_id() -> String {
    std::env::var("STRAVA_CLIENT_ID").expect("Strava Client ID must be set")
}

async fn strava_secret() -> String {
    std::env::var("STRAVA_SECRET").expect("Strava Secret must be set")
}

async fn frontend_url() -> String {
    std::env::var("FRONTEND_URL").expect("Frontend URL must be set")
}

pub async fn secure_frontend() -> bool {
    std::env::var("FRONTEND_SECURE").expect("Frontend Secure must be set").to_lowercase() == "true"
}

pub async fn get_strava_client_id() -> impl IntoResponse {
    Json(json!({
        "strava_client_id": strava_client_id().await
    }))
}

pub async fn post_strava_login(Query(params): Query<Params>) -> impl IntoResponse {
    let code = match params.code.as_ref().filter(|s| !s.trim().is_empty()) {
        Some(c) => c.clone(),
        None => return (StatusCode::BAD_REQUEST, Json(json!({"error": "Missing code parameter"}))).into_response(),
    };

    let client = reqwest::Client::new();
    let url = "https://www.strava.com/oauth/token";

    let mut data: HashMap<&str, String> = HashMap::new();
    data.insert("client_id", strava_client_id().await);
    data.insert("client_secret", strava_secret().await);
    data.insert("code", code);
    data.insert("grant_type", "authorization_code".to_string());
    data.insert("redirect_uri", frontend_url().await);

    let form_body = encode_form(&data);
    let response = match client.post(url).header("Content-Type", "application/x-www-form-urlencoded").body(form_body).send().await {
        Ok(r) => r,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({"error": "Failed to exchange token with Strava"}))).into_response(),
    };

    if !response.status().is_success() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Failed to exchange token with Strava"}))).into_response();
    }

    let text = match response.text().await {
        Ok(t) => t,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Invalid response from Strava"}))).into_response(),
    };
    let data_json: serde_json::Value = match serde_json::from_str(&text) {
        Ok(j) => j,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Invalid JSON from Strava"}))).into_response(),
    };

    let refresh_token = match data_json.get("refresh_token").and_then(|v| v.as_str()) {
        Some(t) if !t.is_empty() => t.to_string(),
        _ => return (StatusCode::BAD_REQUEST, Json(json!({"error": "No refresh token returned from Strava"}))).into_response(),
    };

    let max_age = 30 * 24 * 60 * 60; // 30 days
    let secure = secure_frontend().await;
    let cookie = if secure {
        format!("strava_refresh_token={}; HttpOnly; Path=/; Max-Age={}; SameSite=None; Secure", refresh_token, max_age)
    } else {
        format!("strava_refresh_token={}; HttpOnly; Path=/; Max-Age={}; SameSite=None;", refresh_token, max_age)
    };

    let mut headers = HeaderMap::new();
    headers.insert(SET_COOKIE, HeaderValue::from_str(&cookie).unwrap());
    let origin = frontend_url().await;
    headers.insert("Access-Control-Allow-Credentials", HeaderValue::from_static("true"));
    headers.insert("Access-Control-Allow-Origin", HeaderValue::from_str(&origin).unwrap());

    return (StatusCode::OK, headers, Json(data_json)).into_response();
}

pub async fn post_strava_refresh(headers: HeaderMap) -> impl IntoResponse {
    // Parse cookie header to extract refresh token
    let cookie_header = headers.get("cookie");
    let refresh_token = cookie_header.and_then(|hv| hv.to_str().ok()).and_then(|s| {
        s.split(';')
            .map(|p| p.trim())
            .find(|p| p.starts_with("strava_refresh_token="))
            .and_then(|kv| kv.splitn(2, '=').nth(1))
            .map(|v| v.to_string())
    });

    let refresh_token = match refresh_token {
        Some(t) if !t.is_empty() => t,
        _ => return (StatusCode::UNAUTHORIZED, Json(json!({"error": "No active session (missing cookie)"}))).into_response(),
    };

    let client = reqwest::Client::new();
    let url = "https://www.strava.com/oauth/token";
    let mut data: HashMap<&str, String> = HashMap::new();
    data.insert("client_id", strava_client_id().await);
    data.insert("client_secret", strava_secret().await);
    data.insert("refresh_token", refresh_token);
    data.insert("grant_type", "refresh_token".to_string());

    let form_body = encode_form(&data);
    let response = match client.post(url).header("Content-Type", "application/x-www-form-urlencoded").body(form_body).send().await {
        Ok(r) => r,
        Err(_) => return (StatusCode::UNAUTHORIZED, Json(json!({"error": "Failed to refresh token"}))).into_response(),
    };

    if !response.status().is_success() {
        return (StatusCode::UNAUTHORIZED, Json(json!({"error": "Failed to refresh token"}))).into_response();
    }

    let text = match response.text().await {
        Ok(t) => t,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Invalid response from Strava"}))).into_response(),
    };
    let data_json: JsonValue = match serde_json::from_str(&text) {
        Ok(j) => j,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Invalid JSON from Strava"}))).into_response(),
    };

    let new_refresh_token = match data_json.get("refresh_token").and_then(|v| v.as_str()) {
        Some(t) if !t.is_empty() => t.to_string(),
        _ => return (StatusCode::UNAUTHORIZED, Json(json!({"error": "No refresh token returned from Strava"}))).into_response(),
    };

    let max_age = 30 * 24 * 60 * 60; // 30 days
    let secure = secure_frontend().await;
    let cookie = if secure {
        format!("strava_refresh_token={}; HttpOnly; Path=/; Max-Age={}; SameSite=None; Secure", new_refresh_token, max_age)
    } else {
        format!("strava_refresh_token={}; HttpOnly; Path=/; Max-Age={}; SameSite=None;", new_refresh_token, max_age)
    };

    let mut resp_headers = HeaderMap::new();
    resp_headers.insert(SET_COOKIE, HeaderValue::from_str(&cookie).unwrap());
    let origin = frontend_url().await;
    resp_headers.insert("Access-Control-Allow-Credentials", HeaderValue::from_static("true"));
    resp_headers.insert("Access-Control-Allow-Origin", HeaderValue::from_str(&origin).unwrap());

    return (StatusCode::OK, resp_headers, Json(data_json)).into_response();
}

pub async fn post_strava_logout(Query(params): Query<HashMap<String, String>>, req: axum::http::Request<Body>) -> impl IntoResponse {
    // Read entire body (could be form-encoded or JSON) and parse for accessToken
    let whole = match to_bytes(req.into_body(), 65536).await {
        Ok(b) => b,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({"error": "Failed to read request body"}))).into_response(),
    };
    let body_str = String::from_utf8_lossy(&whole).to_string();

    // Try form-encoded parsing: key1=val1&key2=val2
    let mut form_map: HashMap<String, String> = HashMap::new();
    if !body_str.is_empty() && !body_str.trim_start().starts_with('{') {
        for pair in body_str.split('&') {
            let mut kv = pair.splitn(2, '=');
            if let Some(k) = kv.next() {
                if let Some(v) = kv.next() {
                    let k = urlencoding::decode(k).ok().map(|s| s.to_string()).unwrap_or_else(|| k.to_string());
                    let v = urlencoding::decode(v).ok().map(|s| s.to_string()).unwrap_or_else(|| v.to_string());
                    form_map.insert(k, v);
                }
            }
        }
    }

    let json_body: Option<JsonValue> = if body_str.trim_start().starts_with('{') {
        serde_json::from_str(&body_str).ok()
    } else { None };

    let access_token = form_map.get("accessToken").cloned()
        .or_else(|| params.get("accessToken").cloned())
        .or_else(|| json_body.as_ref().and_then(|b| b.get("accessToken")).and_then(|v| v.as_str()).map(|s| s.to_string()));

    let access_token = match access_token {
        Some(t) if !t.is_empty() => t,
        _ => return (StatusCode::BAD_REQUEST, Json(json!({"error": "Missing accessToken"}))).into_response(),
    };

    let deauth_url = "https://www.strava.com/oauth/deauthorize";
    let client = reqwest::Client::new();
    let _ = client.post(deauth_url).header("Authorization", format!("Bearer {}", access_token)).send().await;

    // Clear cookie regardless of Strava response
    let secure = secure_frontend().await;
    let cookie = if secure {
        format!("strava_refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure")
    } else {
        format!("strava_refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=None;")
    };

    let mut resp_headers = HeaderMap::new();
    resp_headers.insert(SET_COOKIE, HeaderValue::from_str(&cookie).unwrap());
    let origin = frontend_url().await;
    resp_headers.insert("Access-Control-Allow-Credentials", HeaderValue::from_static("true"));
    resp_headers.insert("Access-Control-Allow-Origin", HeaderValue::from_str(&origin).unwrap());

    return (StatusCode::OK, resp_headers, Json(json!({"message": "Logged out"}))).into_response();
}