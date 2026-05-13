use axum_test::TestServer;
mod fake_db;
use back_end_rust::entities::{cassettes, cranksets, tyres};
use back_end_rust::calculator::{calculate_ratios, calculate_rollout};
use urlencoding::encode;
use back_end_rust::app_builder::build_app;
use back_end_rust::app_state::AppState;


use crate::fake_db::complete_fake_db;

#[tokio::test]
async fn test_get_cranksets() {
    let db = complete_fake_db().await.expect("Failed to create fake db");
    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);
    let response = server.get("/api/cranksets").await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");
    // Check that the response is an array and has the expected fake data
    assert!(json.is_array());
    assert_eq!(json[0]["id"], 1);
    assert_eq!(json[0]["name"], "TestCrank");
    assert_eq!(json[0]["rings"], "50,34");
    assert_eq!(json[1]["id"], 2);
    assert_eq!(json[1]["name"], "AnotherCrank");
    assert_eq!(json[1]["rings"], "53,39");
}

#[tokio::test]
async fn test_get_cassette() {
    let db = complete_fake_db().await.expect("Failed to create fake db");
    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);
    let response = server.get("/api/cassettes").await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");
    // Check that the response is an array and has the expected fake data
    assert!(json.is_array());
    assert_eq!(json[0]["id"], 1);
    assert_eq!(json[0]["name"], "TestCassette");
    assert_eq!(json[0]["sprockets"], "11,12,13,14,15");
    assert_eq!(json[1]["id"], 2);
    assert_eq!(json[1]["name"], "AnotherCassette");
    assert_eq!(json[1]["sprockets"], "12,13,14,15,16");
}

#[tokio::test]
async fn test_get_tyre() {
    let db = complete_fake_db().await.expect("Failed to create fake db");
    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);
    let response = server.get("/api/tyres").await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");
    // Check that the response is an array and has the expected fake data
    assert!(json.is_array());
    assert_eq!(json[0]["id"], 1);
    assert_eq!(json[0]["name"], "TestTyre");
    assert_eq!(json[0]["circumference"], 2100);
    assert_eq!(json[1]["id"], 2);
    assert_eq!(json[1]["name"], "AnotherTyre");
    assert_eq!(json[1]["circumference"], 2150);
}

#[tokio::test]
async fn test_calculate_ratio() {
    let db = complete_fake_db().await.expect("Failed to create fake db");
    let crankset_id = 2;
    let cassette_id = 2;

    let crankset = cranksets::Entity::get_by_id(&db, crankset_id).await.expect("Query Failed").expect("Crankset not found");
    let cassette = cassettes::Entity::get_by_id(&db, cassette_id).await.expect("Query Failed").expect("Cassette not found");

    let crankset_rings_vec = match crankset.rings_vec() {
        Ok(v) => v,
        Err(e) => panic!("Invalid Crankset"),
    };
    let cassette_sprockets_vec = match cassette.sprockets_vec() {
        Ok(v) => v,
        Err(e) => panic!("Invalid Cassette")
    };

    let url = format!("/api/calculate/ratio?crankset_id={}&cassette_id={}", crankset_id, cassette_id);
    
    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);

    let response = server.get(&url).await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");

    let expected = calculate_ratios(&crankset_rings_vec, &cassette_sprockets_vec);

    let api_result: Vec<Vec<f32>> = serde_json::from_value(json["results"].clone()).expect("Invalid result format");
    assert_eq!(api_result, expected);

    let api_chainrings: Vec<u16> = serde_json::from_value(json["chainrings"].clone()).expect("Invalid result format");
    assert_eq!(api_chainrings, crankset_rings_vec);
    let api_sprockets: Vec<u16> = serde_json::from_value(json["sprockets"].clone()).expect("Invalid result format");
    assert_eq!(api_sprockets, cassette_sprockets_vec);
}

#[tokio::test]
async fn test_calculate_manual_ratio() {
    let db = complete_fake_db().await.expect("Failed to create fake db");

    let crankset = vec![52, 36];
    let cassette = vec![11, 12, 13];

    let manual_chainring = crankset.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(", ");
    let manual_cassette = cassette.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(", ");

    let url = format!("/api/calculate/ratio?manual_chainring={}&manual_cassette={}", encode(&manual_chainring), encode(&manual_cassette));

    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);

    let response = server.get(&url).await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");

    let expected = calculate_ratios(&crankset, &cassette);

    let api_result: Vec<Vec<f32>> = serde_json::from_value(json["results"].clone()).expect("Invalid result format");
    assert_eq!(api_result, expected);

    let api_chainrings: Vec<u16> = serde_json::from_value(json["chainrings"].clone()).expect("Invalid result format");
    assert_eq!(api_chainrings, crankset);
    let api_sprockets: Vec<u16> = serde_json::from_value(json["sprockets"].clone()).expect("Invalid result format");
    assert_eq!(api_sprockets, cassette);
}


#[tokio::test]
async fn test_calculate_rollout() {
    let db = complete_fake_db().await.expect("Failed to create fake db");
    let crankset_id = 2;
    let cassette_id = 2;
    let tyre_id = 1;

    let crankset = cranksets::Entity::get_by_id(&db, crankset_id).await.expect("Query Failed").expect("Crankset not found");
    let cassette = cassettes::Entity::get_by_id(&db, cassette_id).await.expect("Query Failed").expect("Cassette not found");
    let tyre = tyres::Entity::get_by_id(&db, tyre_id).await.expect("Query Failed").expect("Tyre not found");

    let crankset_rings_vec = match crankset.rings_vec() {
        Ok(v) => v,
        Err(e) => panic!("Invalid Crankset"),
    };
    let cassette_sprockets_vec = match cassette.sprockets_vec() {
        Ok(v) => v,
        Err(e) => panic!("Invalid Cassette")
    };
    let tyre_circumference: u16 = tyre.circumference;

    let url = format!("/api/calculate/rollout?crankset_id={}&cassette_id={}&tyre_id={}", crankset_id, cassette_id, tyre_id);
    
    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);

    let response = server.get(&url).await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");

    let expected = calculate_rollout(&crankset_rings_vec, &cassette_sprockets_vec, &tyre_circumference);

    let api_result: Vec<Vec<f32>> = serde_json::from_value(json["results"].clone()).expect("Invalid result format");
    assert_eq!(api_result, expected);

    let api_chainrings: Vec<u16> = serde_json::from_value(json["chainrings"].clone()).expect("Invalid result format");
    assert_eq!(api_chainrings, crankset_rings_vec);
    let api_sprockets: Vec<u16> = serde_json::from_value(json["sprockets"].clone()).expect("Invalid result format");
    assert_eq!(api_sprockets, cassette_sprockets_vec);
    assert_eq!(tyre_circumference, json["tyre_circumference"]);
}

#[tokio::test]
async fn test_calculate_manual_rollout() {
    let db = complete_fake_db().await.expect("Failed to create fake db");

    let crankset = vec![52, 36];
    let cassette = vec![11, 12, 13];
    let tyre_id = 1;
    let tyre = tyres::Entity::get_by_id(&db, tyre_id).await.expect("Query Failed").expect("Tyre not found");
    
    let manual_chainring = crankset.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(", ");
    let manual_cassette = cassette.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(", ");
    let tyre_circumference: u16 = tyre.circumference;

    let url = format!("/api/calculate/rollout?manual_chainring={}&manual_cassette={}&tyre_id={}", encode(&manual_chainring), encode(&manual_cassette), tyre_id);

    let state = AppState { db };
    let app = build_app(state, None);
    let server = TestServer::new(app);

    let response = server.get(&url).await;
    assert_eq!(response.status_code(), 200);
    let body = response.text();
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON");

    let expected = calculate_rollout(&crankset, &cassette, &tyre_circumference);

    let api_result: Vec<Vec<f32>> = serde_json::from_value(json["results"].clone()).expect("Invalid result format");
    assert_eq!(api_result, expected);

    let api_chainrings: Vec<u16> = serde_json::from_value(json["chainrings"].clone()).expect("Invalid result format");
    assert_eq!(api_chainrings, crankset);
    let api_sprockets: Vec<u16> = serde_json::from_value(json["sprockets"].clone()).expect("Invalid result format");
    assert_eq!(api_sprockets, cassette);
    assert_eq!(tyre_circumference, json["tyre_circumference"]);
}