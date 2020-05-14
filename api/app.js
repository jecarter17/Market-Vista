var createError = require('http-errors');
var express = require('express');
var request = require("request");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require("./routes/testAPI");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testAPI", testAPIRouter);

app.get("/getStockData", (req, res) => {
  request(
    "https://api.worldtradingdata.com/api/v1/stock?symbol=SNAP&api_token=pHr6rXvzaxwgriEmMtTuQkEjQc8NTNQaofaDu8OZBLQKy9wUJjgYgR9H2rxz",
    function(error, response, body){
      if(!error && response.statusCode == 200){
        res.send(body);
      }
    }
  )
});

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
