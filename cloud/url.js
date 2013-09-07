// 在Cloud code里初始化express框架
//在3.0之后,创建server
var express = require('express');
var url = express();

app.get('/fuck', function(req, res) {
        res.render('hello', { message: 'Congrats, you just set up your app!' });
        console.log("fuck!!!");
        });

//  //HOST/user/register/username/123/password/123/email/123@qq.com
url.get('/user/register/username/:id/password/:id/email/:id', function(request, response, next){
        
        var username = request.username.id;
        var password = request.password.id;
        var email = request.email.id;
        
        if (username && password && email){
        console.log(username + password + email);
        }
        else{
        next();//将控制转向下一个符合URL的路由
        }
        
        });