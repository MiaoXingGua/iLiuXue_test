
var Thread = AV.Object.extend('Thread');
var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');
var UserFavicon = AV.Object.extend('UserFavicon');
var CreditRuleLog = AV.Object.extend('CreditRuleLog');
var User = AV.Object.extend('_User');

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

//            var user = AV.Object.createWithoutData("_User",userId);
//
//            console.dir(user);
//            var commentQ = new AV.Query(Comment);
//            commentQ.equalTo("postUser", user);
//            commentQ.notEqualTo('isDelete',true);
//            commentQ.count().then(function(count){
//                console.log(count);

                var user = AV.Object.createWithoutData("_User",userId);
                user.set('numberOfComments',5);
                console.dir(user);

                 user.save().then(function(user) {
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

            var userQ = new AV.Query(User);
            userQ.get(userId, {
                success: function(user) {

                    var supportsQ = user.relation('supports').query();
                    supportsQ.notEqualTo('isDelete',true);
                    supportsQ.count({
                        success: function(count) {
                            user.set('numberOfSupports',count);
                            user.save().then(function(user) {
                                done(user,null);
                            }, function(error) {
                                console.log("失败3");
                                done(null,error);
                            });
                        },
                        error: function(error) {
                            console.log("失败2");
                            done(null,error);
                        }
                    });
                },
                error: function(object, error) {
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

            var userQ = new AV.Query(User);
            userQ.get(userId, {
                success: function(user) {

                    var faviconsQ = user.relation('favicons').query();
                    faviconsQ.notEqualTo('isDelete',true);
                    faviconsQ.count({
                        success: function(count) {
                            user.set('numberOfFavicons',count);
                            user.save().then(function(user) {
                                done(user,null);
                            }, function(error) {
                                console.log("失败3");
                                done(null,error);
                            });
                        },
                        error: function(error) {
                            console.log("失败2");
                            done(null,error);
                        }
                    });
                },
                error: function(object, error) {
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

//            var thread = AV.Object.createWithoutData("_User",threadId);
//            console.dir(thread);
//            var postQ = new AV.Query(Post);
//            postQ.equalTo("thread", thread);
//            postQ.notEqualTo('isDelete',true);
//            postQ.count().then(function(count){
//                console.log("count : "+count);
//                thread.set('numberOfPosts',count);
//                return thread.save();
//
//            }).then(function(thread) {
//                    console.log("111111");
//                    done(thread,null);
//
//                },function(error){
//                    console.log("2222222");
//                    done(null,error);
//                });



            var threadQ = new AV.Query(Thread);
            threadQ.get(threadId, {
                success: function(thread) {

                    var postsQ = thread.relation('posts').query();
//                    postsQ.notEqualTo('isDelete',true);
                    postsQ.count({
                        success: function(count) {
                            thread.set('numberOfPosts',count);
                            thread.save().then(function(post) {
                                done(post,null);
                            }, function(error) {
                                console.log("失败3");
                                done(null,error);
                            });
                        },
                        error: function(error) {
                            console.log("失败2");
                            done(null,error);
                        }
                    });
                },
                error: function(object, error) {
                    console.log("失败1");
                    done(null,error);
                }
            });
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

        var post = AV.Object.createWithoutData("_User",postId);

        var commentQ = new AV.Query(Comment);
        commentQ.equalTo("post", post);
        commentQ.notEqualTo('isDelete',true);
        commentQ.count().then(function(count){

            post.set('numberOfComments',count);
            return post.save();

        }).then(function(post) {
                done(thread,null);

            },function(error){
                done(null,error);
            })

    }

AV.Cloud.define("checkPostNumberOfSupports", function(request, response) {

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
        function checkPostNumberOfSupports(postId,done){

            var postQ = new AV.Query(Post);
            postQ.get(postId, {
                success: function(post) {

                    var supportsQ = post.relation('supports').query();
                    supportsQ.notEqualTo('isDelete',true);
                    supportsQ.count({
                        success: function(count) {
                            post.set('numberOfSupports',count);
                            post.save().then(function(post) {
                                done(post,null);
                            }, function(error) {
                                console.log("失败3");
                                done(null,error);
                            });
                        },
                        error: function(error) {
                            console.log("失败2");
                            done(null,error);
                        }
                    });
                },
                error: function(object, error) {
                    console.log("失败1");
                    done(null,error);
                }
            });
        }

