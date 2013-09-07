// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var name = require('cloud/name.js');
var user = require('cloud/user.js')

AV.Cloud.define("hello", function(request, response) {
  response.success("hello !" + request.params.name);
});



AV.Cloud.define("register", function(request, response) {
                
                var username = request.params.username;
                var password = request.params.password;
                var email = request.params.email;
                
                if (username && password && email){
                console.log(username + password + email);
                response.success(username + password + email);
                }
                
                });