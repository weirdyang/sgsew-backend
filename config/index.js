module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.USERKEY : 'secret',
  PORT: 4000,
};
