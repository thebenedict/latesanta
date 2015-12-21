var React = require('react');
var TweetList = require('./tweetlist.jsx');
//var _ = require('lodash');
var Tweets = React.createClass({
  componentDidMount: function () {
    // Get reference to this item
    var that = this;
    // Set up the connection
    var socket = io.connect('http://localhost:3000/');
    // Handle incoming messages
    socket.on('tweet', function (data) {
      console.log("hello tweet!");
      // Insert the message
      var tweets = that.props.data;
      console.log(data);
      tweets.push(data);
      // tweets = _.sortBy(tweets, function (item) {
      //   return item.created_at;
      // }).reverse();
      that.setProps({data: tweets});
    });
  },
  getInitialState: function () {
    return {data: this.props.data};
  },
  render: function () {
    return (
      <div>
        <h1>Tweets</h1>
        <TweetList data={this.props.data} />
      </div>
    )
  }
});
module.exports = Tweets;