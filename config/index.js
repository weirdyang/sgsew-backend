module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.USERKEY : 'secret',
  PORT: 4000,
  MAX_AGE: 60 * 60 * 24,
  MAX_SIZE: 10 * 1024 * 1024,
};
