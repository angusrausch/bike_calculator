pub mod calculator_controllers;
pub mod key_controller;

pub use calculator_controllers::{get_cranksets, get_cassettes, get_tyres, get_calculate_ratio, get_calculate_rollout, get_calculate_speed};
pub use key_controller::{get_google_maps_key, get_strava_client_id, post_strava_login, post_strava_refresh, post_strava_logout};