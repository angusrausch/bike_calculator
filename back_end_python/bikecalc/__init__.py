from flask import Flask, jsonify  # 1. Import jsonify
from flask_cors import CORS

from .database import db
from .key_controllers import create_key_blueprint
from .calculator_controllers import create_calculator_blueprint
from .environment import FRONTEND_URL, SQL_DB_URI

def create_app(test_config=None):
	app = Flask(__name__)
	CORS(app, origins=[FRONTEND_URL], supports_credentials=True)

	app.config['SQLALCHEMY_DATABASE_URI'] = SQL_DB_URI
	app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
	app.config['TESTING'] = bool(test_config)
	if test_config:
		app.config.update(test_config)

	db.init_app(app)
	app.register_blueprint(create_key_blueprint())
	app.register_blueprint(create_calculator_blueprint())

	@app.route('/health', methods=['GET'])
	def health_check():
		return "", 200

	return app