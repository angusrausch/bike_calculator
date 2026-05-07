
from dotenv import load_dotenv
import os

load_dotenv()

# Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL")
SQL_DB_URI = os.getenv("DATABASE_CONNECTION_STRING")
SECURE_FRONTEND = os.getenv("FRONTEND_SECURE").lower() == "true"

# Keys (fetch dynamically for testability)
def get_google_maps_key():
	return os.getenv("GOOGLE_MAPS_KEY")

def get_strava_client_id():
	return os.getenv("STRAVA_CLIENT_ID")

def get_strava_secret():
	return os.getenv("STRAVA_SECRET")