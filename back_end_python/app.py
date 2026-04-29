from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from os import getenv

from database import db
from controllers import bp

load_dotenv()

# Load app
app = Flask(__name__)
CORS(app, origins=[getenv("FRONTEND_URL")])

# Load DB
app.config['SQLALCHEMY_DATABASE_URI'] = getenv("DATABASE_CONNECTION_STRING")
db.init_app(app)

# Register blueprint
app.register_blueprint(bp)

if __name__ == '__main__':
    app.run()