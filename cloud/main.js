var Thread = AV.Object.extend('Thread');
var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');
var UserFavicon = AV.Object.extend('UserFavicon');
var CreditRuleLog = AV.Object.extend('CreditRuleLog');
var User = AV.Object.extend('_User');
var Relation = AV.Object.extend('Relation');

AV._initialize('rfot8le8vvv49dfwb6o4bwaa5y4sq0jqs038f9ongkzcc9l4', '1wv67cz0mmjo8xzeu5ym1alrbevm317gbjadt0bs2gijqyxs', 'jbabwt9bmr06b8vtngw5f65gtawazjhar7z3ke6lwjabsz74');
AV.Cloud.useMasterKey();


//时间
var moment = require('moment');

//AV.Cloud.define("userInfoToUser", function(request, response) {
//
//    var userQ = new AV.Query(User);
//    userQ.exists("userInfo");
//    userQ.include("userInfo");
//    userQ.find({
//        success: function(users) {
//
//            var userList = [];
//            for (var i in users)
//            {
//                var user = users[i];
//                var userInfo = user.get("userInfo");
//                var album = userInfo.relation('album');
//                album.query
//                if (album)
//                {
////                    user.set('brithday',userInfo.get("brithday"));
////                    user.set('affectiveState',userInfo.get("affectiveState"));
////                    user.set('telephone',userInfo.get("telephone"));
////                    user.set('mobile',userInfo.get("mobile"));
////                    user.set('address',userInfo.get("address"));
////                    user.set('zipcode',userInfo.get("zipcode"));
////                    user.set('nationality',userInfo.get("nationality"));
////                    user.set('brithProvince',userInfo.get("brithProvince"));
////                    user.set('graduateSchool',userInfo.get("graduateSchool"));
////                    user.set('company',userInfo.get("company"));
////                    user.set('education',userInfo.get("education"));
////                    user.set('bloodType',userInfo.get("bloodType"));
////                    user.set('QQ',userInfo.get("QQ"));
////                    user.set('MSN',userInfo.get("MSN"));
////                    user.set('interest',userInfo.get("interest"));
//                    user.set('album',userInfo.get("album"));
//                    var album = user.relation('album');
//                    album.add();
//
//                }
//                userList.push(user);
//            }
//
//
//            AV.Object.saveAll(userList, {
//                success: function(list) {
//                    // All the objects were saved.
//                    console.log("成功");
//                },
//                error: function(error) {
//                    // An error occurred while saving one of the objects.
//                    console.log("失败");
//                }
//            });
//        },
//        error: function(error) {
//            // There was an error.
//        }
//    });
//});

function getDate(datestamp) {

//    console.log(datestamp);
//    console.log(new Date(parseInt(datestamp * 1000));
//    console.log(moment.unix(datestamp).toDate());

    return moment.unix(datestamp).toDate();
}

AV.Cloud.define("isToday", function(request, response) {

//    var date1 =  moment("2014-07-23 11:04:41", "YYYY-MM-DD HH:mm:ss").toDate();
//    request.user.get('updatedAt');
//    var timestamp = request.params.timestamp;
//    var date = getDate(timestamp);
    response.success(isToday(request.user.get('updatedAt')));

});

AV.Cloud.define("isTodayTest", function(request, response) {

    var date1 = getDate(1406113481.447);
    var date2 =  moment("2014-07-23 11:04:41", "YYYY-MM-DD HH:mm:ss").toDate();
    console.log(date1);
    console.log(date2);
//    console.log(isToday(date1));

});

function isToday(date)
{
    var today = new Date();

    console.log(date);
    console.log(today);
    console.log(moment(today).diff(date, 'days'));

    if (moment(today).diff(date, 'years')>0)
    {
        console.log('years');
        return false;
    }
    else if (moment(today).diff(date, 'months')>0)
    {
        console.log('months');
        return false;
    }
    else if (moment(today).diff(date, 'days')>0)
    {
        console.log('days');
        return false;
    }
    else
    {
        return true;
    }
}

AV.Cloud.define("saveUserRelationCount", function(request, response) {

    var userId = request.params.userId;
    var user = AV.Object.createWithoutData("_User",userId);
    var numberOfFriends = request.params.numberOfFriends;
    var numberOfFollows = request.params.numberOfFollows;
    var numberOfBilaterals = request.params.numberOfBilaterals;
    user.set('numberOfFriends',numberOfFriends);
    user.set('numberOfFollows',numberOfFollows);
    user.set('numberOfBilaterals',numberOfBilaterals);
    user.save().then(function(user) {
        
        response.success(user);

    },function(error){
        response.error(error);
    });
});


AV.Cloud.define("checkUserNumberOfThreads", function(request, response) {

    var userId = request.params.userId;
    checkUserNumberOfThreads(userId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查用户发帖数
        function checkUserNumberOfThreads(userId,done){

            var user = AV.Object.createWithoutData("_User",userId);

            var threadQ = new AV.Query(Thread);
            threadQ.equalTo("postUser", user);
            threadQ.notEqualTo('isDelete',true);
            threadQ.count().then(function(count){

                user.set('numberOfThreads',count);
                return user.save();

                }).then(function(user) {
                    done(user,null);

                },function(error){
                    done(null,error);
                });


        }

AV.Cloud.define("checkUserNumberOfPosts", function(request, response) {

    var userId = request.params.userId;
    checkUserNumberOfPosts(userId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查用户回复数
        function checkUserNumberOfPosts(userId,done){

            var user = AV.Object.createWithoutData("_User",userId);

            var postQ = new AV.Query(Post);
            postQ.equalTo('postUser', user);
            postQ.notEqualTo('isDelete',true);
            postQ.count().then(function(count){

                user.set('numberOfPosts',count);
                return user.save();

                }).then(function(user) {
                    done(user,null);

                },function(error){
                    done(null,error);
            });
        }

AV.Cloud.define("checkUserNumberOfBestPosts", function(request, response) {

    var userId = request.params.userId;
    checkUserNumberOfBestPosts(userId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});


        //检查用户最佳回复数
        function checkUserNumberOfBestPosts(userId,done){

            var user = AV.Object.createWithoutData("_User",userId);

            var postQ = new AV.Query(Post);
            postQ.equalTo("postUser", user);
            postQ.notEqualTo('isDelete',true);
            postQ.equalTo("state", true);
            postQ.count().then(function(count){

                user.set('numberOfBestPosts',count);
                return user.save();

            }).then(function(user) {
                done(user,null);

            },function(error){
                done(null,error);
            });
        }

AV.Cloud.define("checkUserNumberOfComments", function(request, response) {

    var userId = request.params.userId;
    checkUserNumberOfComments(userId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查用户评论数
        function checkUserNumberOfComments(userId,done){

            var user = AV.Object.createWithoutData("_User",userId);

//            console.dir(user);
            var commentQ = new AV.Query(Comment);
            commentQ.equalTo("postUser", user);
            commentQ.notEqualTo('isDelete',true);
            commentQ.count().then(function(count){

                user.set('numberOfComments',count);

                return user.save();

                }).then(function(user) {
                    done(user,null);

                },function(error){
                    done(null,error);
                });
        }


AV.Cloud.define("checkUserNumberOfSupports", function(request, response) {

    var userId = request.params.userId;
    checkUserNumberOfSupports(userId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查用户赞数
        function checkUserNumberOfSupports(userId,done){

//            var user = AV.Object.createWithoutData("_User",userId);
//            var supportsQ = user.relation('supports').query();
//            supportsQ.notEqualTo('isDelete',true);
//            supportsQ.count({
//                success: function(count) {
//                    user.set('numberOfSupports',count);
//                    user.save().then(function(user) {
//                        done(user,null);
//                    }, function(error) {
//                        console.log("失败3");
//                        done(null,error);
//                    });
//                },
//                error: function(error) {
//                    console.log("失败2");
//                    done(null,error);
//                }
//            });

//            var userQ = new AV.Query(User);
//            userQ.get(userId, {
//                success: function(user) {
//
//                    console.dir("user : "+user);
//
//                    var supportsQ = user.relation('supports').query();
//                    supportsQ.notEqualTo('isDelete',true);
//                    supportsQ.count({
//                        success: function(count) {
//
//                            console.log("count : "+count);
//
//                            user.set('numberOfSupports',count);
//                            user.save().then(function(user) {
//                                done(user,null);
//                            }, function(error) {
//                                console.log("失败3");
//                                done(null,error);
//                            });
//                        },
//                        error: function(error) {
//                            console.log("失败2");
//                            done(null,error);
//                        }
//                    });
//                },
//                error: function(object, error) {
//                    console.log("失败1");
//                    done(null,error);
//                }
//            });

            var user = AV.Object.createWithoutData("_User",userId);
            var relationQ = new AV.Query(Relation);
            relationQ.equalTo('user',user);
            relationQ.exists('post');
            relationQ.equalTo('type','support');
            relationQ.count({
                success: function(count) {
                    user.set('numberOfSupports',count);
                    user.save().then(function(user) {
                        done(user,null);
                    }, function(error) {
                        console.log("失败2");
                        done(null,error);
                    });
                },
                error: function(error) {
                    console.log("失败1");
                    done(null,error);
                }
            });
        }

AV.Cloud.define("checkUserNumberOfFavicons", function(request, response) {

    var userId = request.params.userId;
    checkUserNumberOfFavicons(userId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查用户收藏数
        function checkUserNumberOfFavicons(userId,done){

            var user = AV.Object.createWithoutData("_User",userId);
            var relationQ = new AV.Query(Relation);
            relationQ.equalTo('user',user);
            relationQ.exists('thread');
            relationQ.equalTo('type','favicon');
            relationQ.count({
                success: function(count) {
                    user.set('numberOfFavicons',count);
                    user.save().then(function(user) {
                        done(user,null);
                    }, function(error) {
                        console.log("失败2");
                        done(null,error);
                    });
                },
                error: function(error) {
                    console.log("失败1");
                    done(null,error);
                }
            });

        }

AV.Cloud.define("checkThreadNumberOfPosts", function(request, response) {

    var threadId = request.params.threadId;
    checkThreadNumberOfPosts(threadId,function (success,error){
        if (success)
        {
            response.success(success);
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查帖子的回复数
        function checkThreadNumberOfPosts(threadId,done){

            var thread = AV.Object.createWithoutData("Thread",threadId);
            console.dir(thread);
            var postQ = new AV.Query(Post);
            postQ.equalTo("thread", thread);
            postQ.notEqualTo('isDelete',true);
            postQ.count().then(function(count){
                console.log("count : "+count);
                thread.set('numberOfPosts',count);
                return thread.save();

            }).then(function(thread) {
                    console.log("111111");
                    done(thread,null);

                },function(error){
                    console.log("2222222");
                    done(null,error);
                });



//            var threadQ = new AV.Query(Thread);
//            threadQ.get(threadId, {
//                success: function(thread) {
//
//                    var postsQ = thread.relation('posts').query();
////                    postsQ.notEqualTo('isDelete',true);
//                    postsQ.count({
//                        success: function(count) {
//                            thread.set('numberOfPosts',count);
//                            thread.save().then(function(post) {
//                                done(post,null);
//                            }, function(error) {
//                                console.log("失败3");
//                                done(null,error);
//                            });
//                        },
//                        error: function(error) {
//                            console.log("失败2");
//                            done(null,error);
//                        }
//                    });
//                },
//                error: function(object, error) {
//                    console.log("失败1");
//                    done(null,error);
//                }
//            });
        }




AV.Cloud.define("checkPostNumberOfComments", function(request, response) {

    var postId = request.params.postId;
    checkPostNumberOfComments(postId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

    //检查回复的评论数
    function checkPostNumberOfComments(postId,done){

        var post = AV.Object.createWithoutData("Post",postId);

        console.dir(post);
        var commentQ = new AV.Query(Comment);
        commentQ.equalTo("post", post);
        commentQ.notEqualTo('isDelete',true);
        commentQ.count().then(function(count){

            console.log("主题评论数："+count);
            post.set('numberOfComments',count);
            return post.save();

        }).then(function(post) {
                done(post,null);

            },function(error){
                done(null,error);
            })

    }

AV.Cloud.define("checkPostNumberOfSupports", function(request, response) {

    var postId = request.params.postId;
    checkPostNumberOfSupports(postId,function (success,error){
        if (success)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

        //检查回复的赞数
        function checkPostNumberOfSupports(postId,done){

            var post = AV.Object.createWithoutData("Post",postId);
            var relationQ = new AV.Query(Relation);
            relationQ.equalTo('post',post);
            relationQ.exists('user');
            relationQ.equalTo('type','support');
            relationQ.count({
                success: function(count) {
                    post.set('numberOfSupports',count);
                    post.save().then(function(post) {
                        done(post,null);
                    }, function(error) {
                        console.log("失败2");
                        done(null,error);
                    });
                },
                error: function(error) {
                    console.log("失败1");
                    done(null,error);
                }
            });

//            var postQ = new AV.Query(Post);
//            postQ.get(postId, {
//                success: function(post) {
//
//                    console.dir("post : " + post);
//
//                    var supportsQ = post.relation('supports').query();
//                    supportsQ.notEqualTo('isDelete',true);
//                    supportsQ.count({
//                        success: function(count) {
//
//                            console.log("count : "+count);
//
//                            post.set('numberOfSupports',count);
//                            post.save().then(function(post) {
//                                done(post,null);
//                            }, function(error) {
//                                console.log("失败3");
//                                done(null,error);
//                            });
//                        },
//                        error: function(error) {
//                            console.log("失败2");
//                            done(null,error);
//                        }
//                    });
//                },
//                error: function(object, error) {
//                    console.log("失败1");
//                    done(null,error);
//                }
//            });
        }

AV.Cloud.define("getUserFromSinaWebUid",function(request, response) {

    var uid = request.params.uid;
    if (uid)
    {
        var userQ = new AV.Query(User);
        userQ.equalTo('username',"sina"+uid);
        userQ.first({
            success: function(user) {

                if (user)
                {
                    if (!__production) console.log("已存在user");
                    user.set("password", "sina"+uid+"liuxue");
                    user.set("userKey", "sina"+uid+"liuxue");

                    user.save(null, {
                        success: function(user) {
                            response.success({"username":user.get("username"),"password":user.get("userKey"),"isFirst":false});
                        },
                        error: function(user, error) {
                            response.error(error);
                        }
                    });
                }
                else
                {
                    if (!__production) console.log("不存在user");
                    var user = new AV.User();
                    user.set("username", "sina"+uid);
                    user.set("password", "sina"+uid+"liuxue");
                    user.set("userKey", "sina"+uid+"liuxue");

                    user.signUp(null, {
                        success: function(user) {
                            response.success({"username":user.get("username"),"password":user.get("userKey"),"isFirst":true});
                        },
                        error: function(user, error) {
                            response.error(error);
                        }
                    });
                }
            },
            error: function(error) {
                response.error(error);
            }
        });
    }
});
