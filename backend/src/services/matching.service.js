const { Op } = require('sequelize');
const { User, DonorProfile } = require('../models');
const { ROLES } = require('../constants');
const { haversineDistanceKm } = require('../utils/haversine');

async function matchDonors({ bloodGroup, latitude, longitude, radiusKm = 50 }) {
  // Calculate 6 months ago date for filtering
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const donors = await User.findAll({
    where: {
      role: ROLES.DONOR,
      bloodGroup,
      isBlocked: false,
      latitude: { [Op.ne]: null },
      longitude: { [Op.ne]: null },
    },
    include: [
      {
        model: DonorProfile,
        as: 'donorProfile',
        where: { 
          isAvailable: true,
          // Only include donors who haven't donated in last 6 months or never donated
          [Op.or]: [
            { lastDonationDate: null },
            { lastDonationDate: { [Op.lte]: sixMonthsAgo } },
          ],
        },
      },
    ],
    attributes: ['id', 'name', 'bloodGroup', 'phone', 'latitude', 'longitude', 'address'],
  });

  return donors
    .map((donor) => {
      const distanceKm = haversineDistanceKm(
        Number(latitude),
        Number(longitude),
        Number(donor.latitude),
        Number(donor.longitude),
      );

      return {
        donor,
        distanceKm: Number(distanceKm.toFixed(2)),
      };
    })
    .filter((item) => item.distanceKm <= Number(radiusKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

module.exports = {
  matchDonors,
};
