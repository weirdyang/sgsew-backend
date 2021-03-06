const express = require('express');

const {
  getUsers, getUser, getUserInfo, deleteUser,
} = require('../controllers/users.controller');
const User = require('../models/user');

const { auth } = require('./auth.route');

const router = express.Router();
router.use(auth.jwt);

router.param('username', (req, res, next, username) => {
  User.findOne({ username }).then((user) => {
    if (!user) { return res.sendStatus(404); }

    req.profile = user;

    return next();
  }).catch(next);
});
// get all users
router.get('/', getUsers);
// get self
router.get('/self', getUserInfo);
// get single user
router.get('/single/:userId', getUser);

// delete user
router.delete('/:id', deleteUser);

module.exports = router;
