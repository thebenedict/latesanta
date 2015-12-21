var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

if (app.get('env') === 'development') {
  require('dotenv').load();
}

// for making external requests, e.g. to sentiment140
var request = require('request');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbUser = process.env.MONGOLAB_DB_USERNAME;
var dbPass = process.env.MONGOLAB_DB_PASSWORD;
var dbPath = process.env.MONGOLAB_DB_PATH;
var db = require('./db')
var url = 'mongodb://' + dbUser + ':' + dbPass + dbPath;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// main code -- where to put this?
db.connect(url, function(err) {
  assert.equal(null, err);
  console.log("Mongolab connection established");

  var processTweet = function(tweet) {
    var encodedTweetText = encodeURIComponent(tweet.text);
    var sentimentUrl = 'http://www.sentiment140.com/api/classify?appid=' + process.env.S140_APP_ID + '&text=' + encodedTweetText + '&tid=' + tweet.id_str;

    request(sentimentUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var parsed = JSON.parse(body);
        console.log("\tpolarity: " + parsed["results"]["polarity"]);
        var updateResult = db.get().collection('tweets').updateOne (
          { "id_str": tweet.id_str },
          { $set: { "polarity": parsed["results"]["polarity"] } }, 
          function(err, results) {
            //callback();
          }
        );
      }
    })
  }

  var Twit = require('twit');

  var T = new Twit({
      consumer_key:         process.env.TWITTER_CONSUMER_KEY
    , consumer_secret:      process.env.TWITTER_CONSUMER_SECRET
    , access_token:         process.env.TWITTER_ACCESS_TOKEN
    , access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
  })

  var stream = T.stream('statuses/filter', { track: ['upshelp', 'fedexhelp', 'uspshelp'] })

  stream.on('tweet', function (tweet) {
    console.log(tweet.text)
    app.io.sockets.emit("tweet",tweet);
    
    db.get().collection('tweets').insertOne(tweet, function(err, result) {
      assert.equal(err, null);
      console.log("\tTweet saved to db.");
      processTweet(tweet);
    });
  });

  stream.on('error', function(e) {
    console.log(e)
  });
});


module.exports = app;
