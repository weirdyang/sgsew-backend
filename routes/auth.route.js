const express = require('express');
const { check } = require('express-validator');
const passport = require('passport');

const {
  register, login, logOut, getCsrfToken, checkKey,
} = require('../controllers/auth.controller');

const router = express.Router();

// creates user if req body contains necessary details
router.post('/register',
  [
    check('username')
      .stripLow()
      .isString()
      .bail()
      .not()
      .isEmpty()
      .withMessage('Username can not be empty')
      .bail()
      .isLength({ min: 6 })
      .withMessage('Must be at least 8 chars long')
      .bail(),
    check('email').normalizeEmail()
      .isEmail()
      .withMessage('Invalid email')
      .bail(),
    check('password').not().isEmpty()
      .withMessage('Invalid password')
      .bail()
      .isLength({ min: 8 })
      .withMessage('Must be at least 8 chars long')
      .bail(),
    check('avatar')
      .stripLow()
      .isString()
      .notEmpty()
      .withMessage('Invalid option for avatar')
      .bail(),
  ], register);
// logins user if username exists and password is correct
router.post('/login',
  [
    check('username')
      .not()
      .isEmpty()
      .withMessage('Invalid username')
      .bail(),
    check('password').not().isEmpty().bail(),
  ], login);

// clears jwt cookie
router.get('/logout', logOut);

// gets csrftoken
router.get('/csrftoken', getCsrfToken);

// checks if sign up key is valid
router.post('/key', checkKey);

module.exports = {
  auth: {
    jwt: (req, res, next) => passport.authenticate('jwt', { session: false })(req, res, next),
    local: passport.authenticate('local', { session: false }),
  },
  router,
};
