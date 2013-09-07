// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var name = require('cloud/name.js');
//var user = require('cloud/user.js')

//var XMPP_SEVER = "http://115.28.44.100:7070/http-bind/";
//var XMPP_HOST = "@115.28.44.100";

//var url = require('cloud/url.js')
//var strophe = require('./strophejs/strophe.js')

AV.Cloud.define("hello", function(request, response) {
  response.success("hello !" + request.params.name);
});

//注册
AV.Cloud.define('register', function(request, response) {

    var username = request.params.username;
    var password = request.params.password;
    var email = request.params.email;

    if (username && password && email){
                
        var user = new AV.User();
        user.set("username", username);
        user.set("password", password);
        user.set("email", email);
        
        strophe.
                
        user.signUp(null, {
                success: function(user) {
                    
                    
                    
                },
                error: function(user, error) {
        
                    alert("Error: " + error.code + " " + error.message);
                    
                }
        });
    }
});

//登录
AV.User.logIn("myname", "mypass", {
              success: function(user) {
              // Do stuff after successful login.
              },
              error: function(user, error) {
              // The login failed. Check error to see why.
              }
              });





