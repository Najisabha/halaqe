import { User, Barber, Salon, Service } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample data...\n');

    // Create sample users
    console.log('👥 Creating sample users...');
    const users = await Promise.all([
      User.create({
        firstname: 'محمد',
        lastname: 'أحمد',
        email: 'mohamed@example.com',
        password: '123456',
        phonenumber: '+970599111111',
        city: 'رام الله',
        area: 'البيرة',
        birthDate: '1995-05-15',
        gender: 'MALE',
        type: 'USER',
        isEmailVerified: true,
        balance: 100.00,
        points: 50
      }),
      User.create({
        firstname: 'أحمد',
        lastname: 'خالد',
        email: 'ahmad@example.com',
        password: '123456',
        phonenumber: '+970599222222',
        city: 'نابلس',
        area: 'رفيديا',
        birthDate: '1992-03-20',
        gender: 'MALE',
        type: 'BARBER',
        isEmailVerified: true
      }),
      User.create({
        firstname: 'عمر',
        lastname: 'سعيد',
        email: 'omar@example.com',
        password: '123456',
        phonenumber: '+970599333333',
        city: 'الخليل',
        area: 'الدوارة',
        birthDate: '1990-08-10',
        gender: 'MALE',
        type: 'PROVIDER',
        isEmailVerified: true
      })
    ]);

    console.log(`   ✅ Created ${users.length} users`);

    // Create sample salon
    console.log('\n💈 Creating sample salon...');
    const salon = await Salon.create({
      ownerId: users[2].id, // Provider
      name: 'صالون الأناقة',
      description: 'أفضل صالون حلاقة في المدينة',
      address: 'شارع الرئيسي، بجانب البنك',
      city: 'رام الله',
      area: 'البيرة',
      latitude: 31.9038,
      longitude: 35.2034,
      phone: '+970599444444',
      email: 'elegance@example.com',
      openingTime: '09:00:00',
      closingTime: '21:00:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      rating: 4.5,
      totalReviews: 25
    });

    console.log('   ✅ Created salon');

    // Create sample barber
    console.log('\n✂️  Creating sample barber...');
    const barber = await Barber.create({
      userId: users[1].id,
      salonId: salon.id,
      salonType: 'SALON',
      idDocumentUrl: 'https://drive.google.com/file/d/sample-id',
      professionLicenseUrl: 'https://drive.google.com/file/d/sample-license',
      specialties: ['قص شعر', 'تشذيب لحية', 'صبغة'],
      experience: 5,
      rating: 4.7,
      totalReviews: 15,
      isApproved: true,
      approvedAt: new Date(),
      description: 'حلاق محترف بخبرة 5 سنوات'
    });

    console.log('   ✅ Created barber');

    // Create sample services
    console.log('\n💼 Creating sample services...');
    const services = await Promise.all([
      Service.create({
        barberId: barber.id,
        salonId: salon.id,
        name: 'قص شعر عادي',
        description: 'قص شعر احترافي مع تسريح',
        price: 35.00,
        duration: 30,
        category: 'HAIRCUT'
      }),
      Service.create({
        barberId: barber.id,
        salonId: salon.id,
        name: 'قص شعر + تشذيب لحية',
        description: 'قص شعر كامل مع تشذيب وتنظيف اللحية',
        price: 50.00,
        duration: 45,
        category: 'HAIRCUT'
      }),
      Service.create({
        barberId: barber.id,
        salonId: salon.id,
        name: 'حلاقة كاملة',
        description: 'حلاقة تقليدية بالموس',
        price: 25.00,
        duration: 20,
        category: 'SHAVE'
      }),
      Service.create({
        barberId: barber.id,
        salonId: salon.id,
        name: 'صبغة شعر',
        description: 'صبغة شعر كاملة بألوان متعددة',
        price: 80.00,
        duration: 90,
        category: 'COLORING'
      })
    ]);

    console.log(`   ✅ Created ${services.length} services`);

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  ✅ Sample Data Seeded Successfully!  ║');
    console.log('╚══════════════════════════════════════╝\n');

    console.log('📝 Test Credentials:');
    console.log('\n👤 Regular User:');
    console.log('   Email: mohamed@example.com');
    console.log('   Password: 123456');
    console.log('\n✂️  Barber:');
    console.log('   Email: ahmad@example.com');
    console.log('   Password: 123456');
    console.log('\n🏢 Provider:');
    console.log('   Email: omar@example.com');
    console.log('   Password: 123456');
    console.log('\n👨‍💼 Admin:');
    console.log('   Email: admin@halaqe.com');
    console.log('   Password: admin123456\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

seedData();
