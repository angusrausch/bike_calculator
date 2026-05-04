from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select

from .database import db

class Cassette(db.Model):
    __tablename__ = 'cassettes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    
    _sprockets = db.Column("sprockets", db.JSON)

    def __init__(self, name=None, sprockets=None):
        self.sprockets = sprockets
        if name is not None:
            self.name = name
        else:
            sprockets_list = self.sprockets if self.sprockets is not None else []
            if sprockets_list:
                if len(sprockets_list) > 1:
                    self.name = f'{sprockets_list[0]}-{sprockets_list[-1]} ({len(sprockets_list)} Speed)'
                else:
                    self.name = f'{sprockets_list[0]} Single Speed'
            else:
                self.name = '<Cassette>'

    @property
    def sprockets(self):
        if isinstance(self._sprockets, str):
            return [int(sprocket) for sprocket in self._sprockets.split(',')] # pragma: no cover
        elif isinstance(self._sprockets, list):
            return [int(sprocket) for sprocket in self._sprockets if sprocket != ',']
        else:
            return []

    @sprockets.setter
    def sprockets(self, value):
        if value == "" or value == []:
            raise ValueError("sprockets cannot be empty string or empty list")
        elif not value:
            raise ValueError("sprockets cannot be empty string or empty list")
        elif isinstance(value, str):
            items = [int(x) for x in value.split(',') if x]
            if not items:
                raise ValueError("sprockets string must contain at least one integer")
        elif isinstance(value, list):
            if not value:
                raise ValueError("sprockets list must contain at least one integer")
            items = [int(x) for x in value]
        elif isinstance(value, int):
            items = [value]
        else:
            raise ValueError("sprockets must be a list or comma-separated string")
        unique_sorted = sorted(set(items))
        self._sprockets = unique_sorted

    @property
    def speed(self):
        return len(self.sprockets)

    def __repr__(self):
        return self.name if self.name else '<Cassette>'


class Crankset(db.Model):
    __tablename__ = 'cranksets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    
    _rings = db.Column("rings", db.JSON)

    def __init__(self, name=None, rings=None):
        self.rings = rings
        if name is not None:
            self.name = name
        else:
            rings_list = self.rings if self.rings is not None else []
            if rings_list:
                rings_sorted = sorted((int(r) for r in rings_list), reverse=True)
                rings_string = "/".join(str(r) for r in rings_sorted)
                self.name = rings_string
            else:
                self.name = '<Crankset>'

    @property
    def rings(self):
        if isinstance(self._rings, str):
            return [int(ring) for ring in self._rings.split(',')] # pragma: no cover
        elif isinstance(self._rings, list):
            return [int(ring) for ring in self._rings if ring != ',']
        else:
            return []

    @rings.setter
    def rings(self, value):
        if value == "" or value == []:
            raise ValueError("rings cannot be empty string or empty list")
        elif not value:
            self._rings = []
            return
        elif isinstance(value, str):
            items = [int(x) for x in value.split(',') if x]
            if not items:
                raise ValueError("rings string must contain at least one integer")
        elif isinstance(value, list):
            if not value:
                raise ValueError("rings list must contain at least one integer")
            items = [int(x) for x in value]
        elif isinstance(value, int):
            items = [value]
        else:
            raise ValueError("rings must be a list or comma-separated string")
        unique_sorted = sorted(set(items))
        self._rings = unique_sorted

    @property
    def speed(self):
        return len(self.rings) if self.rings else 0
    
    def __repr__(self):
        return self.name if self.name else '<Crankset>'

class Tyre(db.Model):
    __tablename__ = 'tyres'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    circumference = db.Column(db.Integer, nullable=False)

    def __init__(self, name=None, circumference=None):
        self.circumference = int(circumference) if circumference is not None else None
        if name is not None:
            self.name = name
        else:
            if self.circumference is not None:
                self.name = f"<Tyre {self.circumference}mm>"
            else:
                self.name = "<Tyre>"

    def __repr__(self):
        return self.name if self.name else '<Tyre>'