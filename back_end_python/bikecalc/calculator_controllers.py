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

    def find_cassette_sprockets(cassette_id, manual_cassette):
        if cassette_id == "0":
            try:
                return [int(sprocket) for sprocket in manual_cassette.split(',')]
            except ValueError:
                raise ValueError("Invalid Manual Cassette")
        else:
            cassette = db.session.get(Cassette, cassette_id)
            if not cassette:
                raise KeyError("Cassette not found")
            return cassette.sprockets

    def find_chainrings(crankset_id, manual_chainring):
        if crankset_id == "0":
            try:
                return[int(ring) for ring in manual_chainring.split(',')]
            except ValueError:
                raise ValueError("Invalid Manual Crankset")
        else:
            crankset = db.session.get(Crankset, crankset_id)
            if not crankset:
                raise KeyError("Crankset not found")
            return crankset.rings
        
    def find_tyres(tyre_id):
        tyre = db.session.get(Tyre, tyre_id)
        if not tyre:
            raise KeyError("Tyre not found")
        return tyre.circumference

    def create_cadence_list(args):
        try:
            min_cadence = args.get('min_cadence', 60)
            min_cadence = int(min_cadence) if min_cadence != "" else 60
        except ValueError:
            raise ValueError("Invalid minimum cadence")
        try:
            max_cadence = args.get('max_cadence', 120)
            max_cadence = int(max_cadence) if max_cadence != "" else 120
        except ValueError:
            raise ValueError("Invalid maximum cadence")
        try:
            cadence_increment = args.get('cadence_increment', 10)
            cadence_increment = int(cadence_increment) if cadence_increment != "" else 10
        except ValueError:
            raise ValueError("Invalid cadence increment")
        if min_cadence > max_cadence:
            raise ValueError("min_cadence cannot be greater than max_cadence")
        if not cadence_increment > 0:
            raise ValueError("cadence_increment must be greater than 0")
        try:
            cadence_list = [cadence for cadence in range(min_cadence, max_cadence + 1, cadence_increment)]
        except ValueError:
            raise ValueError("Could not create cadence list with provided values")
        if len(cadence_list) == 0:
            raise ValueError("No cadence values produced with given parameters")

        return cadence_list

    def find_params(args, expected):
        crankset_id = args.get('crankset_id', '0')
        manual_chainring = args.get('manual_chainring', "")
        chainrings = find_chainrings(crankset_id, manual_chainring)

        cassette_id = args.get('cassette_id', '0')
        manual_cassette = args.get('manual_cassette', "")
        cassette_sprockets = find_cassette_sprockets(cassette_id, manual_cassette)

        if expected == 1:
            return chainrings, cassette_sprockets

        try:
            tyre_id = int(args.get('tyre_id'))
        except TypeError:
            raise ValueError("Tyre ID not provided")
        tyre_circumference = find_tyres(tyre_id)

        if expected == 2:        
            return chainrings, cassette_sprockets, tyre_circumference
        
        cadence_list = create_cadence_list(args)

        return chainrings, cassette_sprockets, tyre_circumference, cadence_list

    @bp.route("/api/calculate/ratio")
    def get_calculate_ratios():
        try:
            chainrings, cassette_sprockets = find_params(request.args, 1)
        except ValueError as e:
            return jsonify({"error": e.args[0]}), 400
        except KeyError as e:
            return jsonify({"error": e.args[0]}), 404


        ratios = calculate_ratios(chainrings, cassette_sprockets)
        return jsonify({
            "chainrings": chainrings,
            "sprockets": cassette_sprockets,
            "results": ratios
        })

    @bp.route("/api/calculate/rollout")
    def get_calculate_rollout():
        try:
             chainrings, cassette_sprockets, tyre_circumference = find_params(request.args, 2)
        except ValueError as e:
            return jsonify({"error": e.args[0]}), 400
        except KeyError as e:
            return jsonify({"error": e.args[0]}), 404
        
        ratios = calculate_rollouts(chainrings, cassette_sprockets, tyre_circumference)
        return jsonify({
            "chainrings": chainrings,
            "sprockets": cassette_sprockets,
            "results": ratios
        })

    @bp.route("/api/calculate/speed")
    def get_calculate_speed():
        try:
            chainrings, cassette_sprockets, tyre_circumference, cadence_list = find_params(request.args, 3)
        except ValueError as e:
            return jsonify({"error": e.args[0]}), 400
        except KeyError as e:
            return jsonify({"error": e.args[0]}), 404

        ratios = calculate_speeds(chainrings, cassette_sprockets, tyre_circumference, cadence_list)
        return jsonify({
            "chainrings": chainrings,
            "sprockets": cassette_sprockets,
            "results": ratios,
            "cadences": cadence_list
        })

    return bp
