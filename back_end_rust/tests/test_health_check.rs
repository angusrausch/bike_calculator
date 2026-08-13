use axum_test::TestServer;
use bike_calculator_backend::app_state::AppState;
use bike_calculator_backend::app_builder::build_app;
mod fake_db;

#[tokio::test]
async fn test_health_returns_ok() {
	let db = fake_db::complete_fake_db().await.expect("Failed to create fake db");
	let state = AppState { db };
	let app = build_app(state, None);
	let server = TestServer::new(app);


	let response = server.get("/health").await;
	assert_eq!(response.status_code(), 200);
}
