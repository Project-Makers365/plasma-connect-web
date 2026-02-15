const bcrypt = require('bcrypt');
const { User, DonorProfile, PlasmaStock } = require('../models');
const { ROLES } = require('../constants');

async function seedData() {
  const password = await bcrypt.hash('Password@123', 10);

  const seedUsers = [
    {
      name: 'System Admin',
      email: 'admin@plasma.local',
      password,
      phone: '9999999999',
      role: ROLES.ADMIN,
      bloodGroup: 'O+',
      address: 'Central Office',
      latitude: 17.385,
      longitude: 78.4867,
    },
    {
      name: 'Donor One',
      email: 'donor1@plasma.local',
      password,
      phone: '9000000001',
      role: ROLES.DONOR,
      bloodGroup: 'A+',
      address: 'Banjara Hills',
      latitude: 17.4126,
      longitude: 78.4347,
    },
    {
      name: 'Recipient User',
      email: 'user1@plasma.local',
      password,
      phone: '9000000002',
      role: ROLES.USER,
      bloodGroup: 'A+',
      address: 'Madhapur',
      latitude: 17.4483,
      longitude: 78.3915,
    },
    {
      name: 'City Hospital',
      email: 'hospital1@plasma.local',
      password,
      phone: '9000000003',
      role: ROLES.HOSPITAL,
      bloodGroup: 'AB+',
      address: 'Secunderabad',
      latitude: 17.4399,
      longitude: 78.4983,
    },
    {
      name: 'Main Blood Bank',
      email: 'bloodbank1@plasma.local',
      password,
      phone: '9000000004',
      role: ROLES.BLOOD_BANK,
      bloodGroup: 'O+',
      address: 'Ameerpet',
      latitude: 17.4375,
      longitude: 78.4482,
    },
  ];

  const userMap = {};
  for (const seedUser of seedUsers) {
    const [user] = await User.findOrCreate({
      where: { email: seedUser.email },
      defaults: seedUser,
    });
    userMap[user.role] = user;
  }

  const donor = userMap[ROLES.DONOR];
  const bloodBank = userMap[ROLES.BLOOD_BANK];

  if (donor) {
    await DonorProfile.findOrCreate({
      where: { userId: donor.id },
      defaults: {
        userId: donor.id,
        isAvailable: true,
        totalDonations: 2,
      },
    });
  }

  if (bloodBank) {
    const stockRows = [
      { bloodBankId: bloodBank.id, bloodGroup: 'A+', unitsAvailable: 8 },
      { bloodBankId: bloodBank.id, bloodGroup: 'O+', unitsAvailable: 12 },
      { bloodBankId: bloodBank.id, bloodGroup: 'AB+', unitsAvailable: 5 },
    ];

    for (const stockRow of stockRows) {
      await PlasmaStock.findOrCreate({
        where: {
          bloodBankId: stockRow.bloodBankId,
          bloodGroup: stockRow.bloodGroup,
        },
        defaults: stockRow,
      });
    }
  }
}

module.exports = seedData;
