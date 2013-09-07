// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var name = require('cloud/name.js');
var user = require('cloud/user.js')

AV.Cloud.define("hello", function(request, response) {
  response.success("hello !" + request.params.name);
});



