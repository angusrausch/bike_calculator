use axum_test::TestServer;
use serde_json::Value;
use std::env;
use bike_calculator_backend::app_state::AppState;
use bike_calculator_backend::app_builder::build_app;
mod fake_db;

#[tokio::test]
async fn test_get_google_maps_key() {
	unsafe { env::set_var("GOOGLE_MAPS_KEY", "fake_maps_key"); }

	let db = fake_db::complete_fake_db().await.expect("Failed to create fake db");
	let state = AppState { db };
	let app = build_app(state, None);
	let server = TestServer::new(app);


	let response = server.get("/api/get-google-maps-key").await;
	assert_eq!(response.status_code(), 200);
	let body = response.text();
	let json: Value = serde_json::from_str(&body).expect("Invalid JSON");
	assert_eq!(json["google_maps_key"], "fake_maps_key");

	unsafe { env::remove_var("GOOGLE_MAPS_KEY"); }
}

#[tokio::test]
async fn test_get_strava_client_id() {
	unsafe { env::set_var("STRAVA_CLIENT_ID", "fake_strava_client_id"); }

    let db = fake_db::complete_fake_db().await.expect("Failed to create fake db");
	let state = AppState { db };
	let app = build_app(state, None);
	let server = TestServer::new(app);

	let response = server.get("/api/get-strava-client-id").await;
	assert_eq!(response.status_code(), 200);
	let body = response.text();
	let json: Value = serde_json::from_str(&body).expect("Invalid JSON");
	assert_eq!(json["strava_client_id"], "fake_strava_client_id");

	unsafe { env::remove_var("STRAVA_CLIENT_ID"); }
}