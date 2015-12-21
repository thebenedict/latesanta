var React = require('react');
var ReactDOM = require('react-dom');

var Tweets = require('./tweets.jsx');

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
ReactDOM.render(
  <Tweets data={initialState} />,
  document.getElementById('view')
);