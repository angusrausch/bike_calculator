from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select

from .database import db

class Cassette(db.Model):
    __tablename__ = 'cassettes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    
    _sprockets = db.Column("sprockets", db.JSON)

    def __init__(self, name, sprockets):
        self.name = name
        self.sprockets = sprockets

    @property
    def sprockets(self):
        return [int(sprocket) for sprocket in self._sprockets.split(',')]

    @sprockets.setter
    def sprockets(self, value):
        if value:
            unique_sorted = sorted(list(set(value)))
            self._sprockets = unique_sorted
        else:
            self._sprockets = []

    @property
    def speed(self):
        """Equivalent to getSpeed()"""
        return len(self._sprockets) if self._sprockets else 0

    def __repr__(self):
        return f'<Cassette {self.name} ({self.speed} speed)>'

class Crankset(db.Model):
    __tablename__ = 'cranksets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    
    _rings = db.Column("rings", db.JSON)

    def __init__(self, name, rings):
        self.name = name
        self.rings = rings

    @property
    def rings(self):
        return [int(ring) for ring in self._rings.split(',')]

    @rings.setter
    def rings(self, value):
        if value:
            unique_sorted = sorted(list(set(value)))
            self._rings = unique_sorted
        else:
            self._rings = []

    @property
    def speed(self):
        """Equivalent to getSpeed()"""
        return len(self._rings) if self._rings else 0

class Tyre(db.Model):
    __tablename__ = 'tyres'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    circumference = db.Column(db.Integer, nullable=False)

    def __init__(self, name, circumference):
        self.name = name
        self.circumference = circumference
