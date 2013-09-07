// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var name = require('cloud/name.js');
//var user = require('cloud/user.js')

var XMPP_SEVER = "http://115.28.44.100:7070/http-bind/";
var XMPP_HOST = "@115.28.44.100";

var url = require('cloud/url.js')
var strophe = require('./strophejs/strophe.js')

AV.Cloud.define("hello", function(request, response) {
  response.success("hello !" + request.params.name);
});



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

AV.Cloud.define('pingXMPP', function(request, response) {
                
                



//连接到xmpp服务器
var xmppConnect = new Strophe.Connection(XMPP_SEVER);

xmppConnect.connect(data.jid, data.password, function (status) {
                    if (status === Strophe.Status.CONNECTED) {
                    $(document).trigger('connected');
                    } else if (status === Strophe.Status.DISCONNECTED) {
                    $(document).trigger('disconnected');
                    }
                    });

conn.connect(data.jid, data.password, function (status) {
             if (status === Strophe.Status.CONNECTED) {
             $(document).trigger('connected');
             } else if (status === Strophe.Status.DISCONNECTED) {
             $(document).trigger('disconnected');
             }
             });

$(document).bind('connected', function () {
                 // inform the user
                 Hello.log("Connection established.");
                 Hello.connection.addHandler(Hello.handle_pong, null, "iq", null, "ping1");
                 var domain = Strophe.getDomainFromJid(Hello.connection.jid);
                 Hello.send_ping(domain);
                 });


$(document).bind('disconnected', function () {
                 Hello.log("Connection terminated.");
                 // remove dead connection object
                 Hello.connection = null;
                 });

send_ping: function (to) {
    var ping = $iq({to: to, type: "get", id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
    
    
    Hello.log("Sending ping to " + to + ".");
    
    
    Hello.start_time = (new Date()).getTime();
    Hello.connection.send(ping);
},


handle_pong: function (iq) {
    var elapsed = (new Date()).getTime() - Hello.start_time;
    Hello.log("Received pong from server in " + elapsed + "ms.");
    
    
    Hello.connection.disconnect();
    
    return false;
}
                
                });

function signUpToXMPP(userId,password){
    
    AV.Cloud.httpRequest({
                         method:'POST'

                         url: "http://" + XMPP_SEVER + "/",

                         headers:{
                            
                         
                         },
                         
                         body{
                         
                         }
                         success: function(httpResponse) {

                         },
                         error: function(httpResponse) {
                         
                         }
    });
    
});

