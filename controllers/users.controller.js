const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const { User } = require('../models/user');
const { roles } = require('../models/user');

const wrap = (fn) => (...args) => fn(...args).catch(args[2]);

const getUserProfile = wrap(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.sendStatus(401);
  }
  // eslint-disable-next-line no-underscore-dangle
  const profile = req.profile.toProfileJSONFor(user || false);
  return res.json({ profile });
});

const getUsers = wrap(async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later',
      500,
    );
    return next(error);
  }

  return res.json({ users: users.map((user) => user.toObject({ getters: true })) });
});

const getUserInfo = wrap(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('journals');
  if (!user) {
    return res.sendStatus(401);
  }
  return res.json({ user: user.toJSON() });
});
const getUser = wrap(async (req, res, next) => {
  // userId is passed in the req.pararms
  // e.g /users/<userId>
  // .route(/:userId)
  const { userId } = req.params;
  let user;
  try {
    user = await User.findById(userId, '-password');
  } catch (err) {
    const error = new HttpError(
      'Error fetching user details, please try again later',
      500,
    );
    return next(error);
  }
  if (!user) {
    return next(new HttpError(
      'User not found', 404,
    ));
  }
  return res.json(user.toObject({ getters: true }));
});

const deleteUser = async (req, res, next) => {
  if (req.user.role !== roles.superuser) {
    return next(
      new HttpError(`Only ${roles.superuser} can delete users`, 401),
    );
  }
  const userId = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findByIdAndRemove(userId);
  if (!user) {
    return res.status(404).send({ message: `no such user with ${userId}` });
  }

  return res.json({ message: `${user.username} deleted.` });
};
module.exports = {
  deleteUser,
  getUsers,
  getUser,
  getUserInfo,
  getUserProfile,
};
