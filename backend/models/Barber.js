import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Barber = sequelize.define('Barber', {
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
  salonId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'salons',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  salonType: {
    type: DataTypes.ENUM('SALON', 'FREELANCE'),
    defaultValue: 'FREELANCE'
  },
  idDocumentUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  professionLicenseUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  specialties: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Years of experience'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'barbers'
});

export default Barber;
