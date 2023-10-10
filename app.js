var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();

const allowedOrigin = 'http://localhost:5173';

const corsOptions = {
  origin: allowedOrigin,
  credentials: true, // Allow credentials (e.g., cookies)
};

app.use(cors(corsOptions));

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var doctorRouter = require('./routes/doctors')

const database=require('./config/connection')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

database();

app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/doctors', doctorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
