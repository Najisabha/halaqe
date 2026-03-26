import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  barberId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'barbers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'salons',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: true,
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'barberId']
    },
    {
      unique: true,
      fields: ['userId', 'salonId']
    }
  ]
});

export default Favorite;
