require('babel-core/register');

var express = require('express');
var router = express.Router();
var db = require('../db');
var assert = require('assert');
var React = require('react');

var Tweets = React.createFactory(require('../components/tweets.jsx'));

/* GET home page. */
router.get('/', function(req, res, next) {
  getTweets(function(tweets){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var markup = React.renderToString(Tweets({ data: tweets }));
    
    res.render('index', {
      markup: markup,
      state: JSON.stringify(tweets)
    });
  });
});

function getTweets(callback) {
  db.getTweetCollection().find({},function(error,cursor){
    cursor.toArray(function(err,tweets){
      assert.equal(null, err);
      callback(tweets.slice(0,10));
    });
  });
}

module.exports = router;
