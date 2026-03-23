const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tender.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@tender.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created:', admin.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  
  const staff = await prisma.user.upsert({
    where: { email: 'staff@tender.com' },
    update: {},
    create: {
      name: 'Staff User',
      email: 'staff@tender.com',
      password: staffPassword,
      role: 'STAFF'
    }
  });

  console.log('Staff user created:', staff.email);

  // Create sample bidders
  const bidders = [
    { name: 'አበበ ወርቅ', companyName: 'አዲስ ንግድ ኩባንያ', phone: '0911123456', email: 'abebe@example.com', tin: '0012345678' },
    { name: 'ደስታ ኃይለ', companyName: 'ሀይማኖት ንግድ ድርጅት', phone: '0911987654', email: 'desta@example.com', tin: '0023456789' },
    { name: 'ሚካኤል ገብረ', companyName: 'ግብር ንግድ ማህበር', phone: '0911567890', email: 'michael@example.com', tin: '0034567890' }
  ];

  for (const bidder of bidders) {
    await prisma.bidder.create({
      data: bidder
    });
  }

  console.log('Sample bidders created');
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });