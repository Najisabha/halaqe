import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  category: {
    type: DataTypes.ENUM('HAIRCUT', 'BEARD', 'SHAVE', 'COLORING', 'STYLING', 'OTHER'),
    defaultValue: 'HAIRCUT'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'services'
});

export default Service;
