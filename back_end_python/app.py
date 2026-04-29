from flask import Flask
from flask_cors import CORS

from database import db
from controllers import bp
from environment import FRONTEND_URL, SQL_DB_URI

# Load app
app = Flask(__name__)
CORS(app, origins=[FRONTEND_URL])

# Load DB
app.config['SQLALCHEMY_DATABASE_URI'] = SQL_DB_URI
db.init_app(app)

# Register blueprint
app.register_blueprint(bp)

if __name__ == '__main__':
    app.run()