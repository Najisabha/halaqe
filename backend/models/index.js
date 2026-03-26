import sequelize, { testConnection } from '../config/database.js';
import User from './User.js';
import Barber from './Barber.js';
import Salon from './Salon.js';
import Service from './Service.js';
import Appointment from './Appointment.js';
import Review from './Review.js';
import Transaction from './Transaction.js';
import Notification from './Notification.js';
import Favorite from './Favorite.js';

export { testConnection };

// Define relationships

// User relationships
User.hasOne(Barber, { foreignKey: 'userId', as: 'barberProfile' });
Barber.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Salon, { foreignKey: 'ownerId', as: 'salons' });
Salon.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Barber relationships
Barber.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });
Salon.hasMany(Barber, { foreignKey: 'salonId', as: 'barbers' });

Barber.hasMany(Service, { foreignKey: 'barberId', as: 'services' });
Service.belongsTo(Barber, { foreignKey: 'barberId', as: 'barber' });

Barber.hasMany(Appointment, { foreignKey: 'barberId', as: 'appointments' });
Appointment.belongsTo(Barber, { foreignKey: 'barberId', as: 'barber' });

Barber.hasMany(Review, { foreignKey: 'barberId', as: 'reviews' });
Review.belongsTo(Barber, { foreignKey: 'barberId', as: 'barber' });

Barber.hasMany(Favorite, { foreignKey: 'barberId', as: 'favorites' });
Favorite.belongsTo(Barber, { foreignKey: 'barberId', as: 'barber' });

// Salon relationships
Salon.hasMany(Service, { foreignKey: 'salonId', as: 'services' });
Service.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

Salon.hasMany(Appointment, { foreignKey: 'salonId', as: 'appointments' });
Appointment.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

Salon.hasMany(Review, { foreignKey: 'salonId', as: 'reviews' });
Review.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

Salon.hasMany(Favorite, { foreignKey: 'salonId', as: 'favorites' });
Favorite.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// Service and Appointment relationship
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Appointment and Review relationship
Appointment.hasOne(Review, { foreignKey: 'appointmentId', as: 'review' });
Review.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Sync all models
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ All models synced successfully');
  } catch (error) {
    console.error('❌ Error syncing models:', error);
    throw error;
  }
};

export {
  User,
  Barber,
  Salon,
  Service,
  Appointment,
  Review,
  Transaction,
  Notification,
  Favorite,
  sequelize
};
