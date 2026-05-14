#![allow(dead_code)]

use sea_orm::{Database, DatabaseConnection, DbErr, ConnectOptions};
use std::sync::Arc;

use sea_orm::{Statement, ConnectionTrait};

/// Create an in-memory SQLite database for testing.
pub async fn setup_fake_db() -> Result<Arc<DatabaseConnection>, DbErr> {
    let mut opt = ConnectOptions::new("sqlite::memory:");
    opt.sqlx_logging(false);
    let db = Database::connect(opt).await?;
    Ok(Arc::new(db))
}

/// Create the cranksets table and insert fake data.
pub async fn setup_cranksets_table(db: &DatabaseConnection) {
    db.execute(Statement::from_string(
        db.get_database_backend(),
        "CREATE TABLE cranksets (
            id INTEGER PRIMARY KEY,
            name TEXT,
            rings TEXT
        );"
            .to_owned(),
    ))
    .await
    .expect("Failed to create cranksets table");
    db.execute(Statement::from_string(
        db.get_database_backend(),
        "INSERT INTO cranksets (id, name, rings) VALUES (1, 'TestCrank', '50,34'), (2, 'AnotherCrank', '53,39');"
            .to_owned(),
    ))
    .await
    .expect("Failed to insert fake cranksets");
}

/// Create the cassettes table and insert fake data.
pub async fn setup_cassettes_table(db: &DatabaseConnection) {
    db.execute(Statement::from_string(
        db.get_database_backend(),
        "CREATE TABLE cassettes (
            id INTEGER PRIMARY KEY,
            name TEXT,
            sprockets TEXT
        );"
            .to_owned(),
    ))
    .await
    .expect("Failed to create cassettes table");
    db.execute(Statement::from_string(
        db.get_database_backend(),
        "INSERT INTO cassettes (id, name, sprockets) VALUES (1, 'TestCassette', '11,12,13,14,15'), (2, 'AnotherCassette', '12,13,14,15,16');"
            .to_owned(),
    ))
    .await
    .expect("Failed to insert fake cassettes");
}

/// Create the tyres table and insert fake data.
pub async fn setup_tyres_table(db: &DatabaseConnection) {
    db.execute(Statement::from_string(
        db.get_database_backend(),
        "CREATE TABLE tyres (
            id INTEGER PRIMARY KEY,
            circumference INTEGER NOT NULL,
            name TEXT
        );"
            .to_owned(),
    ))
    .await
    .expect("Failed to create tyres table");
    db.execute(Statement::from_string(
        db.get_database_backend(),
        "INSERT INTO tyres (id, circumference, name) VALUES (1, 2100, 'TestTyre'), (2, 2150, 'AnotherTyre');"
            .to_owned(),
    ))
    .await
    .expect("Failed to insert fake tyres");
}

/// Wrapper for above 4 functions in a single call.
pub async fn complete_fake_db() -> Result<Arc<DatabaseConnection>, DbErr> {
    let db = setup_fake_db().await.expect("Failed to create fake db");
    setup_cranksets_table(db.as_ref()).await;
    setup_cassettes_table(db.as_ref()).await;
    setup_tyres_table(db.as_ref()).await;
    Ok(db)
}