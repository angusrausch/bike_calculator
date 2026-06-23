const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Cassette extends Model {
  get sprocketsList() {
    const raw = this.getDataValue('sprockets');
    if (!raw) return [];
    return raw.split(',').map(Number);
  }
}
Cassette.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), nullable: false },
  sprockets: { type: DataTypes.STRING(255) }
}, { sequelize, modelName: 'cassettes' });


class Crankset extends Model {
  get ringsList() {
    const raw = this.getDataValue('rings');
    if (!raw) return [];
    return raw.split(',').map(Number);
  }
}
Crankset.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), nullable: false },
  rings: { type: DataTypes.STRING(255) }
}, { sequelize, modelName: 'cranksets' });


class Tyre extends Model {}
Tyre.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), nullable: false },
  circumference: { type: DataTypes.INTEGER, nullable: false }
}, { sequelize, modelName: 'tyres' });

module.exports = { sequelize, Cassette, Crankset, Tyre };