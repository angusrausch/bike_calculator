use back_end_rust::entities::cassettes;
mod fake_db;
use fake_db::setup_fake_db;

#[tokio::test]
async fn test_cassettes_get_all_with_fake_data() {
    let db = setup_fake_db().await.expect("Failed to create fake db");

    // Create table and insert fake data using helper
    fake_db::setup_cassettes_table(db.as_ref()).await;

    // Test get_all
    let result = cassettes::Entity::get_all(&db).await.expect("Query failed");
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].id, 1);
    assert_eq!(result[0].name.as_deref(), Some("TestCassette"));
    assert_eq!(result[0].sprockets.as_deref(), Some("11,12,13,14,15"));
    assert_eq!(result[1].id, 2);
    assert_eq!(result[1].name.as_deref(), Some("AnotherCassette"));
    assert_eq!(result[1].sprockets.as_deref(), Some("12,13,14,15,16"));
    
    // Test get by ID 
    let singular_result = cassettes::Entity::get_by_id(&db, 2).await.expect("Query Failed").expect("Cassette not found");
    assert_eq!(result[1], singular_result);
}
