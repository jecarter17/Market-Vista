var createError = require('http-errors');
var express = require('express');
var request = require("request");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bcrypt = require("bcrypt");
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

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://JC:Echols14@market-vista-db-jvnpz.mongodb.net/test?retryWrites=true&w=majority";
const mongo_client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const user_db = "mv_users";
const user_collection = "users";
const session_collection = "user-sessions";

const av_token = "VHUF69V04PDDFMM9";
const hashSalt = 10;

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testAPI", testAPIRouter);

app.post("/getStockQuote", (req, res) => {
  request(
    "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="+req.body.symbol+"&apikey="+av_token,
    function(error, response, body){
      if(!error && response.statusCode == 200){
        var parsedBody = JSON.parse(body);
        var curPrice = parsedBody['Global Quote']['05. price']
        var responeObj;
        if (curPrice) {
          responeObj = {
            success: true,
            symbol: req.body.symbol,
            price: curPrice,
            msg: req.body.symbol + " quote successfully fetched"
          }
        } else {
          responeObj = {
            success: false,
            symbol: req.body.symbol,
            price: 0,
            msg: "Failed to fetch " + req.body.symbol + " quote"
          }
        }        
        console.log(responeObj);
        res.send(JSON.stringify(responeObj));
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
        var testPassHash = bcrypt.hashSync("pass"+id, hashSalt);
        console.log("pass"+id);
        return collection.insertOne({
          _id: id,
          username: "user"+id,
          password: testPassHash,
          portfolio: [{
            symbol: "IBM",
            shares: 4
          },{
            symbol: "AMD",
            shares: 10
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
    collection.find({username: req.body.username}).toArray().then(
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
          }else{
            returnObj = {
              username: "",
              success: false,
              msg: "Unsuccesful login",
              token: -1
            };
          }
          console.log(returnObj);
          res.send(JSON.stringify(returnObj));
        }else{
          var uname = findResult[0].username;
          if(bcrypt.compareSync(req.body.password, findResult[0].password)){
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
          }else{
            returnObj = {
              username: "",
              success: false,
              msg: "There are no users matching the entered credentials. Please try again.",
              token: -1
            };
            console.log(returnObj);
            res.send(returnObj);
          }
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
      {_id: new ObjectId(req.body.token) },
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

app.post("/getPortfolio", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    console.log("getting portfolio for user " + req.body.username);
    
    collection.find({username: req.body.username}).toArray().then(
      result => {
        var response;
        if (result.length == 1) {
          response = {
            username: req.body.username,
            success: true,
            msg: "Portfolio found and returned",
            portfolio: result[0].portfolio
          }
        } else if (res.length == 0) {
          response = {
            username: req.body.username,
            success: false,
            msg: "User not found, portfolio not returned",
            portfolio: []
          }
        } else {
          console.log("More than one user with username " + req.body.username + ", awkward...");
          response = {
            username: req.body.username,
            success: false,
            msg: "Duplicate users found, portfolio not returned",
            portfolio: []
          }
        }
        console.log(response);
        res.send(JSON.stringify(response));
      },
      err => {throw err;}
    );
  });
});

app.post("/modifyPortfolio", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    console.log("modifying portfolio for " + req.body.username + "\n \
                  symbol: " + req.body.symbol + ", inc: " + req.body.inc);
    collection.findOneAndUpdate(
      {username: req.body.username, "portfolio.symbol": req.body.symbol},
      {$inc:{"portfolio.$.shares": req.body.inc}},
      {returnOriginal: false}
    ).then(
      result => {
        var response = {
          success: true,
          portfolio: result.value.portfolio,
          msg: "incremented " + req.body.symbol + " shares by " + req.body.inc
        }
        console.log(response);
        res.send(JSON.stringify(response));
      }
    ).catch(
      err => {
        var response = {
          success: false,
          portfolio: [],
          msg: "Failed to find or update portfolio"
        }
        console.log(response);
        res.send(JSON.stringify(response));
        console.error(`Failed to find and update document: ${err}`)
      }
    );
  });
});

app.post("/addPosition", (req, res) => {
  mongo_client.connect(err => {
    const collection = mongo_client.db(user_db).collection(user_collection);
    console.log("opening position in " + req.body.symbol + " for " + req.body.username);
    collection.findOneAndUpdate(
      {username: req.body.username},
      {
        $push: {
          portfolio: {
            $each: [{symbol: req.body.symbol, shares: 1}]
          }
        }
      },
      {returnOriginal: false}
    ).then(
      result => {
        var response = {
          success: true,
          portfolio: result.value.portfolio,
          msg: "Added position of " + req.body.symbol + " for " + req.body.user
        }
        console.log(response);
        res.send(JSON.stringify(response));
      }
    ).catch(
      err => {
        var response = {
          success: false,
          portfolio: [],
          msg: "Something went wrong, failed to add position..."
        }
        console.log(response);
        res.send(JSON.stringify(response));
        console.error(`Failed to find and update document: ${err}`)
      }
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
