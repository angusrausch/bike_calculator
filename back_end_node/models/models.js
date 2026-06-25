const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Cassette extends Model {
  constructor(values, options) {
    if (values && typeof values === 'object' && !Array.isArray(values)) {
      super(values, options);
      return;
    }
    const name = values;
    const sprockets = options;
    if (sprockets === '' || (Array.isArray(sprockets) && sprockets.length === 0)) {
      throw new Error('Sprockets cannot be empty string or empty list');
    }
    super({ name, sprockets });
  }
}

function isEmptySprocketsInput(value) {
  return value === '' || (Array.isArray(value) && value.length === 0);
}

function normalizeSprockets(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(Number).filter(n => !Number.isNaN(n));
  if (typeof value === 'number') return [value];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !Number.isNaN(n));
      if (typeof parsed === 'number') return [parsed];
    } catch (e) {
      // not JSON, fallthrough to CSV
    }
    return value.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
  }
  if (typeof value === 'object') {
    return Object.values(value).map(Number).filter(n => !Number.isNaN(n));
  }
  return [];
}

Cassette.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), nullable: false },
  speed: { type: DataTypes.INTEGER(), nullable: false},
  sprockets: {
    type: DataTypes.TEXT,
    get() {
      return normalizeSprockets(this.getDataValue('sprockets'));
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('sprockets', JSON.stringify(value));
      } else {
        this.setDataValue('sprockets', value);
      }
    }
  }
}, {
  sequelize,
  modelName: 'cassettes',
  hooks: {
    beforeValidate: (cassette) => {
      const rawSprockets = cassette.getDataValue('sprockets');
      if (isEmptySprocketsInput(rawSprockets)) {
        throw new Error('sprockets cannot be empty string or empty list');
      }

      const sprockets = normalizeSprockets(rawSprockets);
      cassette.speed = sprockets.length;
      if (cassette.name == null || cassette.name === '') {
        if (Array.isArray(sprockets) && cassette.speed > 0) {
          if (cassette.speed === 1) {
            cassette.name = `${sprockets[0]} Single Speed`;
          } else {
            cassette.name = `${sprockets[0]}-${sprockets[cassette.speed - 1]} (${sprockets.length} Speed)`;
          }
        }
      }
    }
  }
});

class Crankset extends Model {
  constructor(values, options) {
    if (values && typeof values === 'object' && !Array.isArray(values)) {
      super(values, options);
      return;
    }
    const name = values;
    const rings = options;
    if (rings === '' || (Array.isArray(rings) && rings.length === 0)) {
      throw new Error('Rings cannot be empty string or empty list');
    }
    super({ name, rings });
  }
}

Crankset.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), nullable: false },
  speed: { type: DataTypes.INTEGER(), nullable: false},
  rings: {
    type: DataTypes.TEXT,
    get() {
      return normalizeSprockets(this.getDataValue('rings'));
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('rings', JSON.stringify(value));
      } else {
        this.setDataValue('rings', value);
      }
    }
  }
}, {
  sequelize,
  modelName: 'cranksets',
  hooks: {
    beforeValidate: (crankset) => {
      const rawRings = crankset.getDataValue('rings');
      if (isEmptySprocketsInput(rawRings)) {
        throw new Error('Rings cannot be empty string or empty list');
      }

      const rings = normalizeSprockets(rawRings);
      crankset.speed = rings.length;
      if (crankset.name == null || crankset.name === '') {
        if (Array.isArray(rings) && crankset.speed > 0) {
          if (crankset.speed === 1) {
            crankset.name = `${rings[0]}`;
          } else {
            rings.sort((a, b) => b - a);
            crankset.name = `${rings.join("/")}`;
          }
        }
      }
    }
  }
});

class Tyre extends Model {
  constructor(values, options) {
    if (values && typeof values === 'object' && !Array.isArray(values)) {
      super(values, options);
      return;
    }
    const name = values;
    const circumference = options;
    super({ name, circumference });
  }
}

Tyre.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), nullable: false },
  circumference: { type: DataTypes.INTEGER, nullable: false }
}, {
  sequelize,
  modelName: 'tyres',
  hooks: {
    beforeValidate: (tyre) => {
      const circumference = tyre.getDataValue('circumference');

      if (tyre.name == null || tyre.name === '') {
        if (circumference != null) {
          tyre.name = `<Tyre ${circumference}mm>`;
        } else {
          tyre.name = `<Tyre>`;
        }
      }
    }
  }
});

module.exports = { sequelize, Cassette, Crankset, Tyre };