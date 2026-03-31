const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

// TEMPORARY ENDPOINT - DELETE AFTER USE!
// This endpoint seeds the database with default users
router.all('/seed-database', async (req, res, next) => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@tender.com' }
    });

    if (existingAdmin) {
      return res.json({ 
        message: 'Database already seeded',
        users: ['admin@tender.com', 'staff@tender.com']
      });
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email: 'admin@tender.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 12);
    const staff = await prisma.user.create({
      data: {
        name: 'Staff User',
        email: 'staff@tender.com',
        password: staffPassword,
        role: 'STAFF'
      }
    });

    // Create sample bidders
    const bidders = [
      { name: 'አበበ ወርቅ', companyName: 'አዲስ ንግድ ኩባንያ', phone: '0911123456', email: 'abebe@example.com', tin: '0012345678' },
      { name: 'ደስታ ኃይለ', companyName: 'ሀይማኖት ንግድ ድርጅት', phone: '0911987654', email: 'desta@example.com', tin: '0023456789' },
      { name: 'ሚካኤል ገብረ', companyName: 'ግብር ንግድ ማህበር', phone: '0911567890', email: 'michael@example.com', tin: '0034567890' }
    ];

    for (const bidder of bidders) {
      await prisma.bidder.create({ data: bidder });
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      users: [
        { email: 'admin@tender.com', password: 'admin123', role: 'ADMIN' },
        { email: 'staff@tender.com', password: 'staff123', role: 'STAFF' }
      ],
      biddersCreated: bidders.length
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
