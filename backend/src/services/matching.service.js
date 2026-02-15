const { Op } = require('sequelize');
const { User, DonorProfile } = require('../models');
const { ROLES } = require('../constants');
const { haversineDistanceKm } = require('../utils/haversine');

async function matchDonors({ bloodGroup, latitude, longitude, radiusKm = 50 }) {
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
        where: { isAvailable: true },
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
