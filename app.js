const path = require('path');

require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const csurf = require('csurf');
const debug = require('debug')('app');
const express = require('express');
const logger = require('morgan');

debug(process.env.NODE_ENV, 'postman');
debug(process.env.NODE_ENV !== 'postman');
// read value from cookie
// value: (req) => req.cookies['XSRF-TOKEN'],
const csrfProtection = csurf(
  {
    cookie: {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV !== 'postman',
    },
    ignoreMethods: process.env.NODE_ENV === 'test' ? ['GET', 'HEAD', 'OPTIONS', 'POST', 'DELETE', 'PUT'] : ['GET', 'HEAD', 'OPTIONS'],
  },
);
const { errorHandler, notFoundHandler } = require('./middleware');
const { router: authRouter } = require('./routes/auth.route');
const productRouter = require('./routes/products.route');
const searchRouter = require('./routes/search.route');
const usersRouter = require('./routes/users.route');

const app = express();
require('./config/passport')(app);
require('./config/mongoose')();

const corsOptions = {
  origin: process.env.CLIENT_URL ?? '*',
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
debug(process.env.CLIENT_URL);
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', csrfProtection, usersRouter);
app.use('/auth', csrfProtection, authRouter);
app.use('/products', csrfProtection, productRouter);
app.use('/search', searchRouter);
// error for unsupported routes (which we dont want to handle)
app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
