import sequelize, { testConnection } from '../config/database.js';
import { syncDatabase } from '../models/index.js';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('🔄 Starting database initialization...\n');

    // Test connection
    console.log('📡 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Database connection failed!');
      console.log('\n💡 Make sure:');
      console.log('  1. PostgreSQL is running');
      console.log('  2. Database "halaqe_db" exists');
      console.log('  3. Credentials in .env are correct');
      process.exit(1);
    }

    // Sync database
    console.log('\n📊 Creating database tables...');
    await syncDatabase(false); // false = don't drop existing tables
    
    console.log('\n✅ Database tables created successfully!');

    // Create admin user if not exists
    console.log('\n👤 Checking for admin user...');
    const adminExists = await User.findOne({ 
      where: { 
        email: 'admin@halaqe.com',
        type: 'ADMIN'
      } 
    });

    if (!adminExists) {
      console.log('   Creating default admin user...');
      await User.create({
        firstname: 'Admin',
        lastname: 'Halaqe',
        email: 'admin@halaqe.com',
        password: 'admin123456',
        phonenumber: '+970599000000',
        city: 'رام الله',
        area: 'البيرة',
        address: 'المكتب الرئيسي',
        birthDate: '1990-01-01',
        gender: 'MALE',
        type: 'ADMIN',
        isEmailVerified: true,
        isActive: true
      });
      console.log('   ✅ Admin user created!');
      console.log('      Email: admin@halaqe.com');
      console.log('      Password: admin123456');
    } else {
      console.log('   ℹ️  Admin user already exists');
    }

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  ✅ Database Initialization Complete  ║');
    console.log('╚══════════════════════════════════════╝\n');
    
    console.log('📝 Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Open: http://localhost:4000');
    console.log('  3. Test API at: http://localhost:4000/health\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

initDatabase();
