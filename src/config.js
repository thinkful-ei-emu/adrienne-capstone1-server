module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DATABASE_URL || 'postgresql://travel_companion@localhost/travel_companion',
  JWT_SECRET: process.env.JWT_SECRET ||'wogi923utpg[jap4hu2i'
};