use back_end_rust::entities::cranksets;
mod fake_db;
use fake_db::setup_fake_db;

#[tokio::test]
async fn test_cranksets_get_all_with_fake_data() {
    let db = setup_fake_db().await.expect("Failed to create fake db");

    // Create table and insert fake data using helper
    fake_db::setup_cranksets_table(db.as_ref()).await;

    // Test get_all
    let result = cranksets::Entity::get_all(&db).await.expect("Query failed");
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].id, 1);
    assert_eq!(result[0].name.as_deref(), Some("TestCrank"));
    assert_eq!(result[0].rings.as_deref(), Some("50/34"));
    assert_eq!(result[1].id, 2);
    assert_eq!(result[1].name.as_deref(), Some("AnotherCrank"));
    assert_eq!(result[1].rings.as_deref(), Some("53/39"));

    // Test get by ID 
    let singular_result = cranksets::Entity::get_by_id(&db, 2).await.expect("Query Failed").expect("Cassette not found");
    assert_eq!(result[1], singular_result);
}
