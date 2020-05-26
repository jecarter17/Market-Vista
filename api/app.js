var createError = require('http-errors');
var express = require('express');
var request = require("request");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require("helmet");
//var session = require("express-session");
var cors = require("cors");
var ObjectId = require('mongodb').ObjectId;

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
app.use(helmet());
//app.use(session({secret: "mySecret", cookie: {maxAge: 10000}}));

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://JC:Echols14@market-vista-db-jvnpz.mongodb.net/test?retryWrites=true&w=majority";
const mongo_client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const user_db = "mv_users";
const user_collection = "users";
const session_collection = "user-sessions";


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

function createNewSession(uname){
  const collection = mongo_client.db(user_db).collection(session_collection);
  var curr_ts = Date.now();
  return collection.insertOne({
    username: uname,
    timestamp: curr_ts,
    isDeleted: false
  });
}

app.post("/login", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    // perform actions on the collection object
    console.log("parsing request body...");
    console.log(req.body);
    console.log(req.body.username);
    console.log(req.body.password);
    collection.find({username: req.body.username, password: req.body.password}).toArray().then(
      findResult => {
        console.log("parsing result...");
        console.log(findResult);
        var returnObj;
        if(findResult.length != 1){
          if(findResult.length == 0){
            returnObj = {
              username: "",
              success: false,
              msg: "There are no users matching the entered credentials. Please try again.",
              token: -1
            }
          }else if(findResult.length != 1){
            returnObj = {
              username: "",
              success: false,
              msg: "Uh oh... There are multiple users matching the entered credentials. We messed up...",
              token: -1
            };
          }
          console.log(returnObj);
          res.send(JSON.stringify(returnObj));
        }else{
          var uname = findResult[0].username;
          //create new session and add token to response obj
          createNewSession(uname).then(
            insertResult => {
              var session_token = insertResult.insertedId;
              returnObj = {
                username: uname,
                success: true,
                msg: "",
                token: session_token
              };
              console.log(returnObj);
              res.send(JSON.stringify(returnObj));
            },
            err => {throw err;}
          );
        }
      },
      err => {throw err;}
    );
  });
});

app.post("/logout", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(session_collection);
    
    console.log("marking session " + req.body.token + " as deleted...");
    collection.findOneAndUpdate(
      {_id: req.body.token },
      {$set:{isDeleted: true}},
      {returnOriginal: false}
    ).then(
      result => {
        console.log("done marking");
        console.log(result.value);
        res.send(result.value.isDeleted);
      },
      err => {throw err;}
    );
  });
});

app.post("/validateToken", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(session_collection);
    
    console.log("validating session " + req.body.token);
    collection.find({_id: new ObjectId(req.body.token), isDeleted: false}).toArray().then(
      findResult => {
        console.log(findResult);
        var returnObj;
        if(findResult.length == 1){
          returnObj = {
            username: findResult[0].username,
            success: true,
            msg: "User is logged in"
          }
        }else if(findResult.length == 0){
          returnObj = {
            username: "",
            success: false,
            msg: "Invalid session token"
          }
        }else{
          returnObj = {
            username: "",
            success: false,
            msg: "More than one valid session, issue on our end..."
          }
        }
        console.log(returnObj);
        res.send(JSON.stringify(returnObj));
      },
      err => {throw err;}
    );
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
