
var Thread = AV.Object.extend('Thread');
var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');
var UserFavicon = AV.Object.extend('UserFavicon');
var CreditRuleLog = AV.Object.extend('CreditRuleLog');
var User = AV.Object.extend('_User');

var _credits = 0;
var _experience = 0;


//AV.Cloud.setInterval('refreash_thread_count', 60*30, function(){
//
//    var userQuery = new AV.Query(User);
//    userQuery.include("userFavicon");
//    userQuery.find().then(function(users){
//
//        console.log("成功！！！");
//
//        for (var i = 0; i < users.length; i++) {
//
//            var user = users[i];
//
//            //numberOfThreads
//            var threadQuery = new AV.Query(Thread);
//            threadQuery.equalTo("postUser", user);
//            threadQuery.include("postUser.userCount");
//            threadQuery.find().then(function(threads){
//
//                var firThread = threads[0];
//                if (firThread)
//                {
//                    var user = firThread.get('postUser');
//
//                    var userCount = user.get('userCount');
//
////                    console.dir(user);
////                    console.dir(userCount);
//
//                    userCount.set('numberOfThreads',threads.length);
//
//                    return userCount.save();
//                }
//
//            },function(error){
//
//                console.log("失败1！！！");
//                console.dir(error);
//
//            });
//
//            //numberOfPosts
//            var postQuery = new AV.Query(Post);
//            postQuery.equalTo("postUser", user);
//            postQuery.include("postUser.userCount");
//            postQuery.find().then(function(posts){
//
//                var firPost = posts[0];
//                if (firPost)
//                {
//                    var user = firPost.get('postUser');
//
//                    var userCount = user.get('userCount');
//
////                    console.dir(user);
////                    console.dir(userCount);
//
//                    userCount.set('numberOfPosts',posts.length);
//
//                    return userCount.save();
//                }
//
//            },function(error){
//
//                console.log("失败2！！！");
//                console.dir(error);
//
//            });
//
//            //numberOfComments
//            var commentQuery = new AV.Query(Comment);
//            commentQuery.equalTo("postUser", user);
//            commentQuery.include("postUser.userCount");
//            commentQuery.find().then(function(comments){
//
//                var firComment = comments[0];
//                if (firComment)
//                {
//                    var user = firComment.get('postUser');
//
//                    var userCount = user.get('userCount');
//
////                    console.dir(user);
////                    console.dir(userCount);
//
//                    userCount.set('numberOfComments',comments.length);
//
//                    return userCount.save();
//                }
//
//            },function(error){
//
//                console.log("失败3！！！");
//                console.dir(error);
//
//            });
//
////            var userFavicon = user.get('userFavicon');
////
////            //numberOfSupports
////            var supportQuery = userFavicon.relation('supports') ;
//////            supportQuery.equalTo("postUser", user);
////            supportQuery.include('user');
////            supportQuery.find().then(function(supports){
////
////                var user = firSupport.get('postUser');
////
////                var userCount = user.get('userCount');
////
////                userCount.set('numberOfSupports',supports.length);
////
////                return userCount.save();
////
////            },function(error){
////
////                console.log("失败4！！！");
////                console.dir(error);
////
////            });
//        }
//
//    },function(error){
//
//        console.log("失败0！！！");
//        console.dir(error);
//    });
//
//});

var checkUserNumberOfThreads = function(user){
    var userId = AV.Object.createWithoutData("_User", user.id);

    var threadQ = new AV.Query(Thread);
    threadQ.equalTo("postUser", userId);
    threadQ.count().then(function(count){

        var userCount = user.get('userCount');
        userCount.set('numberOfThreads',count);
        return userCount.save();

    }).then(function(userCount) {

            console.log('用户发帖数: '+userCount.get('numberOfPosts'));

        },function(error){

            console.log('更改用户发帖数失败');

        });
}

//发帖前
AV.Cloud.beforeSave('Thread', function(request, response) {

    var user = request.user;
    var credits = user.get("credits");

    console.log('用户积分');
    console.log(credits);

    var thread = request.object;
    var price = thread.get('price');

    console.log('悬赏积分');
    console.log(price);

    if (credits > price+5)
    {

        console.log('积分足够');
        response.success();
    }
    else
    {
        console.log('积分不足');
        response.error('积分不足');
    }

});

//发帖后
AV.Cloud.afterSave('Thread', function(request) {

    var type = 11;
    var creditRuleId;
    var thread = request.object;
    var price = thread.get('price');

    var user = request.user;
    checkUserNumberOfThreads(user);

    //查找规则
    var crQuery = new AV.Query('CreditRule');
    crQuery.equalTo('type', type);
    return crQuery.first().then(function(object){

        creditRuleId = AV.Object.createWithoutData("CreditRule", object.id);
        _credits = object.get('credits')-price;
        _experience = object.get('experience');

        //调整积分
        user.increment('credits',_credits);
        //调整经验值
        user.increment('experience',_experience);

        return user.save();

    }).then(function(user){

        //增加积分变更记录
        var creditRuleLog = new CreditRuleLog();
        var userId = AV.Object.createWithoutData("_User", user.id);
        creditRuleLog.set('user',userId);
        creditRuleLog.set('type',creditRuleId);
        creditRuleLog.set('accumulativeCredit',_credits);
        creditRuleLog.set('accumulativeExperience',_experience);
        return creditRuleLog.save();

    }).then(function(obj){

        console.log('发帖成功');
        console.dir(obj);

    },function(error){

        console.log('发帖失败');
        console.dir(error);

    });
});

//删除主题
AV.Cloud.afterDelete("Thread", function(request) {

//    var postUser = request.object.get('postUser');
    var user = request.user;
    checkUserNumberOfThreads(user);

});

//更该帖子
AV.Cloud.afterSave('Post', function(request){

    var post = request.object;

    var postState = post.get('state');
    //已完成的帖子
    if (postState == 1)
    {
        var user = post.get('postUser');
        var userId = AV.Object.createWithoutData("_User", user.id);

        var postQ = new AV.Query(User);
        postQ.equalTo('postUser', userId);
        postQ.equalTo('state', 1);
        postQ.find().then(function(posts){

            console.log('啧啧啧啧啧正则啧啧啧啧啧');
            var userCount = user.get('userCount');
            console.dir(userCount);
            userCount.set('numberOfBestPost',objects.length);
            return userCount.save();

        }).then(function(userCount){


                console.log("最佳答案成功！");

        },function(error){

                console.log("最佳答案失败！");

        });
    }

});

var checkUserNumberOfPosts = function(user){

    var userId = AV.Object.createWithoutData("_User", user.id);

    var postQ = new AV.Query(Post);
    postQ.equalTo("postUser", userId);
    postQ.count().then(function(count){

        var userCount = user.get('userCount');
        userCount.set('numberOfPosts',count);
        return userCount.save();

        }).then(function(userCount) {

            console.log('用户回复数: '+userCount.get('numberOfPosts'));

        },function(error){

            console.log('更改用户回复数失败');

        });

}

var checkThreadNumberOfPosts = function(post){

    var thread = post.get('thread');
    var threadId = AV.Object.createWithoutData("Thread", thread.id);

    var postQ = new AV.Query(Post);
    postQ.equalTo("thread", threadId);
    postQ.count().then(function(count){

        //回复数
        thread.set('numberOfPosts',count);
        return thread.save();

        }).then(function(thread) {

            console.log('帖子回复数: '+thread.get('numberOfPosts'));

        },function(error){

            console.log('更改帖子回复数失败');

        });
}

var checkUserNumberOfBestPosts = function(user){

    var userId = AV.Object.createWithoutData("_User", user.id);

    var postQ = new AV.Query(Post);
    postQ.equalTo("postUser", userId);
    postQ.equalTo("state", 1);
    postQ.count().then(function(count){

        var userCount = user.get('userCount');
        userCount.set('numberOfPosts',count);
        return userCount.save();

    }).then(function(userCount) {

            console.log('用户回复数: '+userCount.get('numberOfPosts'));

        },function(error){

            console.log('更改用户回复数失败');

        });
}

//发回复后
AV.Cloud.afterSave('Post', function(request, response){

    var type = 21;
    var creditRuleId;
    console.log('发回复');
    //检查用户回复
    var user = request.user;
    checkUserNumberOfPosts(user);

    //检查帖子回复
    var post = request.object;
    checkThreadNumberOfPosts(post);

//    var thread = post.get('thread');
//    //回复
//    thread.relation('posts').add(post);
//    //最后回复人
//    thread.set('lastPoster',user);
//    //最后回复时间
//        thread.set('lastPostAt',post.get('createdAt'));

    //查找规则
    console.log('查找规则');
    var crQuery = new AV.Query('CreditRule');
    crQuery.equalTo('type', type);
    crQuery.first().then(function(object){

            creditRuleId =AV.Object.createWithoutData("CreditRule", object.id);

            _credits = object.get('credits');
            _experience = object.get('experience');

            //调整积分
            user.increment('credits',_credits);
            //调整经验值
            user.increment('experience',_experience);
            return user.save();

        }).then(function(user){

//            //增加积分变更记录
            console.log('增加积分变更记录');

            console.log('积分2 %d',_credits);
            console.log('经验2 %d',_experience);
//            console.log(c+e);

            var creditRuleLog = new CreditRuleLog();

//            console.dir(creditRuleLog);
            var userId = AV.Object.createWithoutData("_User", user.id);

            creditRuleLog.set('user',userId);
            creditRuleLog.set('type',creditRuleId);
            creditRuleLog.set('accumulativeCredit',_credits);
            creditRuleLog.set('accumulativeExperience',_experience);
            return creditRuleLog.save();

        }).then(function(creditRuleLog) {

            console.log('发回复成功');
//            console.dir(creditRuleLog);

        },function(error){

            console.log('发回复失败');
            console.dir(error);

        });
});

//删除回复
AV.Cloud.afterDelete("Post", function(request) {

    //检查用户回复
    var user = request.user;
    checkUserNumberOfPosts(user);

    //检查帖子回复
    var post = request.object;
    checkThreadNumberOfPosts(post);
});

//更新回复
AV.Cloud.afterUpdate("Post", function(request){

    var user = request.user;
    console.log('最佳回复！！！！！');
    checkUserNumberOfBestPosts(user);
});


var checkUserNumberOfComments = function(user){

    var userId = AV.Object.createWithoutData("_User", user.id);

    var commentQ = new AV.Query(Comment);
    commentQ.equalTo("postUser", userId);
    commentQ.count().then(function(count){

        var userCount = user.get('userCount');
        userCount.set('numberOfComments',count);
        return userCount.save();

        }).then(function(userCount) {

            console.log('用户评论数: '+userCount.get('numberOfComments'));

        },function(error){

            console.log('更改用户评论数失败');

        });
}

var checkPostNumberOfComments = function(comment){

    var post = comment.get('post');
    var postId = AV.Object.createWithoutData("Post", post.id);

    var commentQ = new AV.Query(Comment);
    commentQ.equalTo("post", postId);
    commentQ.count().then(function(count){

        //回复数
        post.set('numberOfComments',count);
        return post.save();

    }).then(function(post) {

            console.log('回复评论数: '+post.get('numberOfComments'));

        },function(error){

            console.log('更改回复评论数失败');

        });
}

//发评论后
AV.Cloud.afterSave('Comment', function(request, response){

    var type = 22;
    var creditRuleId;

    var user = request.user;
    checkUserNumberOfComments(user);

    var comment = request.object;
    checkPostNumberOfComments(comment);

    //查找规则
    console.log('查找规则');
    var crQuery = new AV.Query('CreditRule');
    crQuery.equalTo('type', type);
    crQuery.first().then(function(object){

            creditRuleId =AV.Object.createWithoutData("CreditRule", object.id);
            _credits = object.get('credits');
            _experience = object.get('experience');

            //调整积分
            user.increment('credits',_credits);
            //调整经验值
            user.increment('experience',_experience);
            return user.save();

        }).then(function(user){

            //增加积分变更记录
            var creditRuleLog = new CreditRuleLog();
            var userId = AV.Object.createWithoutData("_User", user.id);
            creditRuleLog.set('user',userId);
            creditRuleLog.set('type',creditRuleId);
            creditRuleLog.set('accumulativeCredit',_credits);
            creditRuleLog.set('accumulativeExperience',_experience);
            return creditRuleLog.save();

        }).then(function(creditRuleLog) {

            console.log('发评论成功');
            console.dir(creditRuleLog);

        },function(error){

            console.log('发评论失败');
            console.dir(error);

        });
});

//删除评论
AV.Cloud.afterDelete("Comment", function(request) {

    var user = request.user;
    checkUserNumberOfComments(user);

    var comment = request.object;
    checkPostNumberOfComments(comment);
});


//收藏主题or取消收藏主题
AV.Cloud.afterUpdate("UserFavicon", function(request) {
    var user = request.user;
    var userFavicon = request.object;

    var userQ = new AV.Query(User);
    userQ.equalTo("objectId", user.id);
    userQ.include('userCount');
    userQ.include('userFavicon');
    userQ.first().then(function(user){


        var userFavicon = user.get('userFavicon');
        var userTFR = userFavicon.relation('threads');
        return userTFR.query().find();
//        return userFR.query().count();

        }).then(function(objects){

            //收藏主题or取消收藏主题
            var userCount = user.get('userCount');
            userCount.set('numberOfFavicon',objects.length);
            return userCount.save();

        }).then(function(userCount) {

            var userFavicon = user.get('userFavicon');
            var userSFR = userFavicon.relation('supports');
            return userSFR.query().find();
//        return userSFR.query().count();

        }).then(function(objects) {

            //收藏主题or取消收藏主题
//            console.log(objects.length);
            var userCount = user.get('userCount');
//            console.dir(userCount);
            userCount.set('numberOfSupports',objects.length);
            return userCount.save();

        }).then(function(userCount) {

            console.dir(userCount);
            console.log("收藏or赞成功！");

        },function(error){

            console.log("收藏or赞失败！");

    });
});

