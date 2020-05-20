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

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://JC:Echols14@market-vista-db-jvnpz.mongodb.net/test?retryWrites=true&w=majority";
const mongo_client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const user_db = "mv_users";
const user_collection = "users";


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testAPI", testAPIRouter);

const av_token = "VHUF69V04PDDFMM9";

app.get("/getStockQuote", (req, res) => {
  request(
    "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey="+av_token,
    function(error, response, body){
      if(!error && response.statusCode == 200){
        var parsedBody = JSON.parse(body);
        var curPrice = parsedBody['Global Quote']['05. price']
        console.log(curPrice);
        res.send(curPrice);
      }
    }
  )
});

app.post("/getUserData", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    // perform actions on the collection object
    console.log(req.body);
    collection.find(req.body).toArray(function(err, result){
      if (err) throw err;
      console.log(result);
      res.send(result);
    });
  });
});

app.get("/testGetUser", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    // perform actions on the collection object
    console.log(req);
    console.log(req.body);
    collection.find({username: "user1"}).toArray().then(
      result => {
        console.log(result);
        res.send(result);
      },
      err => {throw err;}
    );
  });
});

function getNextSequenceValue(sequenceName){
  console.log("updating sequence #...")
  return mongo_client.db(user_db).collection(user_collection).findOneAndUpdate(
    {_id: sequenceName },
    {$inc:{sequence_value:1}},
    {returnOriginal: false}
  ).then(function(result){
    console.log("done updating sequence #");
    return result.value.sequence_value;
  });
}

app.get("/saveTestUser", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    // perform actions on the collection object
    if (err) throw err;
    console.log("saving new user...");
    getNextSequenceValue("user_id").then(
      id => {
        console.log("inserting new user...")
        return collection.insertOne({
          _id: id,
          username: "user"+id,
          password: "pass"+id,
          portfolio: [{
            symbol: "IBM",
            shares: "4"
          },{
            symbol: "AMD",
            shares: "10"
          }]
        });
      },
      err => {throw err;}
    ).then(
      () => {
        console.log("done inserting user");
        console.log("querying for current users...");
        return collection.find({}).toArray();
      },
      err => {throw err;}
    ).then(
      result => {
        console.log("done querying for current users");
        if (err) throw err;
        console.log(result);
        res.send(result);
      },
      err => {throw err;}
    ).then(
      () => {
        console.log("done saving test user api call");
      },
      err => {throw err;}
    );
    console.log("back in base");
  });
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
