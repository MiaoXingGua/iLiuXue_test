
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

    var thread = request.object;
    var type = 11;
    var user = request.user;

    var price = thread.get('price');

    var creditRuleId;

    var userId = AV.Object.createWithoutData("_User", user.id);

    var threadQ = new AV.Query(Thread);
    threadQ.equalTo("postUser", userId);
    threadQ.count().then(function(count){

        //最后回复时间=发帖时间
    //    var updatedAt = thread.get('updatedAt');
    //
    //    thread.set('lastPostAt',updatedAt);
    //    thread.save().then(function(thread){

        //user的发帖数+1
        console.log('user的发帖数+1');

        var userCount = user.get('userCount');
        userCount.set('numberOfThreads',count);
        return userCount.save();

        }).then(function(){

            //查找规则
            var crQuery = new AV.Query('CreditRule');
            crQuery.equalTo('type', type);
            return crQuery.first();

        }).then(function(object){

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

//发回复后
AV.Cloud.afterSave('Post', function(request, response){

    var post = request.object;

    var type = 21;

    var user = request.user;
    var thread = post.get('thread');

    var creditRuleId;

    var threadId = AV.Object.createWithoutData("Thread", thread.id);

    var postQ = new AV.Query(Post);
    postQ.equalTo("thread", threadId);
    postQ.count().then(function(count){

        //回复
        thread.relation('posts').add(post);
        //回复数
        thread.set('numberOfPosts',count);
        //最后回复人
        thread.set('lastPoster',user);
        //最后回复时间
        thread.set('lastPostAt',post.get('createdAt'));

        return thread.save();

    }).then(function(thread){

        //user的回复数+1
        console.log('user的回复数+1');

//        console.log('userCount');

        var userCount = user.get('userCount');

        console.dir(userCount);

        userCount.increment('numberOfPosts');

        console.dir(userCount);

        return userCount.save();

         }).then(function(){

            //查找规则
            console.log('查找规则');
            var crQuery = new AV.Query('CreditRule');
            crQuery.equalTo('type', type);
            return crQuery.first();

        }).then(function(object){

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
            console.dir(creditRuleLog);

        },function(error){

            console.log('发回复失败');
            console.dir(error);

        });
});

//发评论后
AV.Cloud.afterSave('Comment', function(request, response){

    var comment = request.object;

    var type = 22;

    var user = request.user;
    var post = comment.get('post');

    var creditRuleId;
    var postId = AV.Object.createWithoutData("Post", post.id);
    var commentQ = new AV.Query(Comment);
    commentQ.equalTo("post", postId);
    commentQ.count().then(function(count){
        //评论
        post.relation('comments').add(comment);
        //评论数
        post.set('numberOfComments',count);
        //最后评论人
        post.set('lastCommenter',user);   //这里就不用WithoutData
        //最后评论时间
        post.set('lastCommentAt',comment.get('createdAt'));

        return post.save();

    }).then(function(post){

        //user的评论数+1
        var userCount = user.get('userCount');

        console.dir(userCount);

        userCount.increment('numberOfComments');

        return userCount.save();    //user.save() 不会save到userCount

//        }).then(function(user){

        }).then(function(){

            //查找规则
            var crQuery = new AV.Query('CreditRule');
            crQuery.equalTo('type', type);
            return crQuery.first();

        }).then(function(object){

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

//删除主题
AV.Cloud.afterDelete("Thread", function(request) {

    var postUser = request.object.get('postUser');
//    console.dir(postUser);

    var userCount = postUser.get('userCount');
//    console.dir(userCount);

    userCount.increment('numberOfThreads',-1);
    userCount.save(null, {
        success: function(userCount) {

            console.log('删除主题成功');
            console.dir(creditRuleLog);
        },
        error: function(userCount, error) {

            console.log('删除主题失败');
            console.dir(error);
        }
    });
});

//删除回复
AV.Cloud.afterDelete("Post", function(request) {

    var post = request.object;
    var postUser = post.get('postUser');
    var comments = post.get('comments');

//    console.dir(postUser);

    var userCount = postUser.get('userCount');
//    console.dir(userCount);

    userCount.increment('numberOfPosts',-1);
    userCount.save(null, {
        success: function(userCount) {

            console.log('删除回复成功');
            console.dir(creditRuleLog);
        },
        error: function(userCount, error) {

            console.log('删除回复失败');
            console.dir(error);
        }
    });
});

//删除评论
AV.Cloud.afterDelete("Comment", function(request) {

    var postUser = request.object.get('postUser');
//    console.dir(postUser);

    var userCount = postUser.get('userCount');
    console.dir(userCount);

    userCount.increment('numberOfComments',-1);
    userCount.save(null, {
        success: function(userCount) {

            console.log('删除评论成功');
            console.dir(creditRuleLog);
        },
        error: function(userCount, error) {

            console.log('删除评论失败');
            console.dir(error);
        }
    });
});

//收藏主题or取消收藏主题
AV.Cloud.afterUpdate("UserFavicon", function(request) {
    var user = request.user;
    var userQ = new AV.Query(User);
    userQ.equalTo("objectId", user.id);
    userQ.include('userCount');
    userQ.include('userFavicon');
    userQ.first().then(function(user){

        console.dir(user);
        var userFavicon = user.get('userFavicon');
        console.dir(userFavicon);
        var userFTQ = userFavicon.relation('threads');
        return userFTQ.count();

        },function(error){

        console.log("收藏失败123456！");

        }).then(function(count){

            console.log(cont);
        var userCount = user.get('userCount');
        userCount.set('numberOfFavicon',count);
        return userCount.save();

        }).then(function() {

            console.log("收藏成功！");

        },function(error){

            console.log("收藏失败！");

    });
});