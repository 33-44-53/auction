const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureAdminExists() {
  console.log('🔍 Checking for admin user...');
  
  try {
    // Check if admin user exists
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@tender.com' }
    });

    if (!admin) {
      console.log('📝 Creating admin user...');
      const adminPassword = await bcrypt.hash('admin123', 12);
      
      admin = await prisma.user.create({
        data: {
          name: 'Administrator',
          email: 'admin@tender.com',
          password: adminPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created with ID:', admin.id);
    } else {
      console.log('✅ Admin user exists with ID:', admin.id);
    }

    // Check if staff user exists
    let staff = await prisma.user.findUnique({
      where: { email: 'staff@tender.com' }
    });

    if (!staff) {
      console.log('📝 Creating staff user...');
      const staffPassword = await bcrypt.hash('staff123', 12);
      
      staff = await prisma.user.create({
        data: {
          name: 'Staff User',
          email: 'staff@tender.com',
          password: staffPassword,
          role: 'STAFF'
        }
      });
      console.log('✅ Staff user created with ID:', staff.id);
    } else {
      console.log('✅ Staff user exists with ID:', staff.id);
    }

    console.log('✅ User check complete!');
  } catch (error) {
    console.error('❌ Error ensuring users exist:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdminExists();
