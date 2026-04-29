
from dotenv import load_dotenv
from os import getenv

load_dotenv()

# Configuration
FRONTEND_URL = getenv("FRONTEND_URL")
SQL_DB_URI = getenv("DATABASE_CONNECTION_STRING")

# Keys
GOOGLE_MAPS_KEY = getenv("GOOGLE_MAPS_KEY")
STRAVA_CLIENT_ID = getenv("STRAVA_CLIENT_ID")
STRAVA_SECRET = getenv("STRAVA_SECRET")