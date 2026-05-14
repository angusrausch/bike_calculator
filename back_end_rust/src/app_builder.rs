use axum::{Router, routing::{get, post}};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use crate::controllers::{*};
use crate::AppState;
use std::net::SocketAddr;
use http::Request as HttpRequest;
use axum::middleware::Next;
use axum::body::Body;
use std::time::Instant;

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

    // global middleware to log each request start and completion (method, uri, remote, status, latency)
    app = app.layer(axum::middleware::from_fn(|req: HttpRequest<Body>, next: Next| async move {
        let method = req.method().clone();
        let uri = req.uri().clone();
        let remote = req
            .extensions()
            .get::<SocketAddr>()
            .map(|a| a.to_string())
            .unwrap_or_else(|| "-".to_string());
        tracing::info!(%method, %uri, %remote, "request start");
        let start = Instant::now();
        let res = next.run(req).await;
        let latency = start.elapsed();
        tracing::info!(status = %res.status().as_u16(), latency_ms = %latency.as_millis(), %method, %uri, %remote, "request complete");
        res
    }));

    // keep a default TraceLayer for additional details
    app = app.layer(TraceLayer::new_for_http());
    app
}
