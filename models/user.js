/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const debug = require('debug')('app:user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { secret } = require('../config');

const roles = {
  normal: 'normal',
  superuser: 'admin',
};

const avatars = ['chamomile', 'orange', 'tea-tree', 'rose', 'rosemary', 'leaf'];

function passwordValidator(value) {
  if (!value) {
    return null;
  }

  const hasUpperCase = /[A-Z]+/.test(value);

  const hasLowerCase = /[a-z]+/.test(value);

  const hasNumeric = /[0-9]+/.test(value);

  return hasUpperCase && hasLowerCase && hasNumeric;
}

const passwordCheck = [
  passwordValidator,
  'Password must contain at least 1 lower case, 1 upper case and 1 numeric character.',
];
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true, // always convert username to lowercase
    required: [true, 'Username can not be blank'],
    unique: true,
    minLength: [6, 'Usernames needs to be at least 6 characters'],
    trim: true,
    index: true,
    match: [/^[a-zA-Z0-9]+$/, 'No special characters allowed in the username'],
  },
  avatar: {
    type: String,
    lowercase: true,
    default: 'leaf',
    enum: avatars,
    required: [true, 'Please select an avatar'],
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: [true, 'Email can not be blank'],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email'],
  },
  password: {
    type: String,
    required: true,
    validate: passwordCheck,
    minLength: [8, 'Passwords need to be at least 8 characters.'],
  },
  role: {
    type: String,
    enum: [roles.superuser, roles.normal],
    required: true,
    default: roles.normal,
  },
  products: {
    type: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Product' }],
  },
}, { timestamps: true });

userSchema.plugin(uniqueValidator, { message: '{PATH} is in use' });
userSchema.methods.toProfileJSONFor = function toUserProfile(user) {
  return {
    username: this.username,
    avatar: this.avatar,
    role: this.role,
    following: user ? user.isFollowing(this._id) : false,
  };
};

userSchema.methods.generateJWT = function generateToken() {
  const exp = new Date();
  exp.setDate(exp.getDate() + 60);
  debug(exp);
  return jwt.sign({
    id: this._id,
    username: this.username,
    role: this.role,
    exp: parseInt(exp.getTime() / 1000, 10),
  }, secret);
};

userSchema.methods.toJSON = function toJson() {
  return {
    id: this._id,
    avatar: this.avatar,
    email: this.email,
    username: this.username,
    role: this.role,
  };
};

userSchema.methods.validatePassword = function validate(password, callback) {
  debug('validate', password, callback);
  return bcrypt.compare(
    password,
    this.password,
    (err, same) => {
      callback(err, same);
    },
  );
};

userSchema.methods.roles = function getRoles() {
  return roles;
};
// middleware, intercept before save
userSchema.pre('save', function hashMiddleWare(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  debug(user);
  return bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      debug(err);
      return next(err);
    }

    user.password = hash;
    return next();
  });
});
const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  roles,
};
