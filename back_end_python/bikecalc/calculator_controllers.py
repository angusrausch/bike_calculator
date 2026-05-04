from flask import Blueprint, request, jsonify
import json
from .database import db
from .models import Cassette, Crankset, Tyre
from .calculator import calculate_ratios, calculate_rollouts, calculate_speeds

def create_calculator_blueprint():
    bp = Blueprint('calculator_api', __name__)

    def jsonify_db(data):
        return jsonify([
            {column.name: getattr(row, column.name) for column in row.__table__.columns}
            for row in data
        ])

    @bp.route("/api/cassettes")
    def get_cassettes():
        results = db.session.query(Cassette).all()
        return jsonify_db(results)

    @bp.route("/api/cranksets")
    def get_cranksets():
        results = db.session.query(Crankset).all()
        return jsonify_db(results)

    @bp.route("/api/tyres")
    def get_tyres():
        results = db.session.query(Tyre).all()
        return jsonify_db(results)

    @bp.route("/api/calculate/ratio")
    def get_calculate_ratios():
        cassette_id = request.args.get('cassette_id', '0')
        crankset_id = request.args.get('crankset_id', '0')
        manual_cassette = request.args.get('manual_cassette', "")
        manual_chainring = request.args.get('manual_chainring', "")
        
        if cassette_id == "0":
            try:
                cassette_sprockets = [int(sprocket) for sprocket in manual_cassette.split(',')]
            except ValueError:
                return jsonify({"error": "Invalid Manual Cassette"}), 400
        else:
            cassette = db.session.get(Cassette, cassette_id)
            if not cassette:
                return jsonify({"error": "Cassette not found"}), 404
            cassette_sprockets = cassette.sprockets

        if crankset_id == "0":
            try:
                chainrings = [int(ring) for ring in manual_chainring.split(',')]
            except ValueError:
                return jsonify({"error": "Invalid Manual Crankset"}), 400
        else:
            crankset = db.session.get(Crankset, crankset_id)
            if not crankset:
                return jsonify({"error": "Crankset not found"}), 404
            chainrings = crankset.rings
        
        ratios = calculate_ratios(chainrings, cassette_sprockets)
        return jsonify({
            "chainrings": chainrings,
            "sprockets": cassette_sprockets,
            "results": ratios
        })

    @bp.route("/api/calculate/rollout")
    def get_calculate_rollout():
        cassette_id = request.args.get('cassette_id', '0')
        crankset_id = request.args.get('crankset_id', '0')
        tyre_id = request.args.get('tyre_id', '0')
        manual_cassette = request.args.get('manual_cassette', "")
        manual_chainring = request.args.get('manual_chainring', "")
        
        if cassette_id == "0":
            try:
                cassette_sprockets = [int(sprocket) for sprocket in manual_cassette.split(',')]
            except ValueError:
                return jsonify({"error": "Invalid Manual Cassette"}), 400
        else:
            cassette = db.session.get(Cassette, cassette_id)
            if not cassette:
                return jsonify({"error": "Cassette not found"}), 404
            cassette_sprockets = cassette.sprockets

        if crankset_id == "0":
            try:
                chainrings = [int(ring) for ring in manual_chainring.split(',')]
            except ValueError:
                return jsonify({"error": "Invalid Manual Crankset"}), 400
        else:
            crankset = db.session.get(Crankset, crankset_id)
            if not crankset:
                return jsonify({"error": "Crankset not found"}), 404
            chainrings = crankset.rings

        tyre = db.session.get(Tyre, tyre_id)
        if not tyre:
            return jsonify({"error": "Tyre not found"}), 404
        tyre_circumference = tyre.circumference
        
        ratios = calculate_rollouts(chainrings, cassette_sprockets, tyre_circumference)
        return jsonify({
            "chainrings": chainrings,
            "sprockets": cassette_sprockets,
            "results": ratios
        })

    @bp.route("/api/calculate/speed")
    def get_calculate_speed():
        cassette_id = request.args.get('cassette_id', '0')
        crankset_id = request.args.get('crankset_id', '0')
        tyre_id = request.args.get('tyre_id', '0')
        min_cadence = int(request.args.get('min_cadence', 60))
        max_cadence = int(request.args.get('max_cadence', 120))
        cadence_increment = int(request.args.get('cadence_increment', 10))
        manual_cassette = request.args.get('manual_cassette', "")
        manual_chainring = request.args.get('manual_chainring', "")
        
        if cassette_id == "0":
            try:
                cassette_sprockets = [int(sprocket) for sprocket in manual_cassette.split(',')]
            except ValueError:
                return jsonify({"error": "Invalid Manual Cassette"}), 400
        else:
            cassette = db.session.get(Cassette, cassette_id)
            if not cassette:
                return jsonify({"error": "Cassette not found"}), 404
            cassette_sprockets = cassette.sprockets

        if crankset_id == "0":
            try:
                chainrings = [int(ring) for ring in manual_chainring.split(',')]
            except ValueError:
                return jsonify({"error": "Invalid Manual Crankset"}), 400
        else:
            crankset = db.session.get(Crankset, crankset_id)
            if not crankset:
                return jsonify({"error": "Crankset not found"}), 404
            chainrings = crankset.rings

        tyre = db.session.get(Tyre, tyre_id)
        if not tyre:
            return jsonify({"error": "Tyre not found"}), 404
        tyre_circumference = tyre.circumference

        cadence_list = [cadence for cadence in range(min_cadence, max_cadence + 1, cadence_increment)]

        ratios = calculate_speeds(chainrings, cassette_sprockets, tyre_circumference, cadence_list)
        return jsonify({
            "chainrings": chainrings,
            "sprockets": cassette_sprockets,
            "results": ratios,
            "cadences": cadence_list
        })

    return bp
