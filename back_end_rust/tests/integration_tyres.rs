use bike_calculator_backend::entities::tyres;
mod fake_db;
use fake_db::setup_fake_db;

#[tokio::test]
async fn test_tyres_get_all_with_fake_data() {
    let db = setup_fake_db().await.expect("Failed to create fake db");

    // Create table and insert fake data using helper
    fake_db::setup_tyres_table(db.as_ref()).await;

    // Test get_all
    let result = tyres::Entity::get_all(&db).await.expect("Query failed");
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].id, 1);
    assert_eq!(result[0].circumference, 2100);
    assert_eq!(result[0].name.as_deref(), Some("TestTyre"));
    assert_eq!(result[1].id, 2);
    assert_eq!(result[1].circumference, 2150);
    assert_eq!(result[1].name.as_deref(), Some("AnotherTyre"));

    // Test get by ID 
    let singular_result = tyres::Entity::get_by_id(&db, 2).await.expect("Query Failed").expect("Cassette not found");
    assert_eq!(result[1], singular_result);
}
