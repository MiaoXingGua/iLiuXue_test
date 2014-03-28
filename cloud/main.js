
var Thread = AV.Object.extend('Thread');
var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');
var UserFavicon = AV.Object.extend('UserFavicon');
var CreditRuleLog = AV.Object.extend('CreditRuleLog');
var User = AV.Object.extend('_User');

var _credits = 0;
var _experience = 0;

//检查用户发帖数
function checkUserNumberOfThreads(user){

    var userId = AV.Object.createWithoutData("_User", user.id);
    var threadCount = 0;

    var threadQ = new AV.Query(Thread);
    threadQ.equalTo("postUser", userId);
    threadQ.count().then(function(count){

        console.log("用户实际发帖数："+count);
        threadCount = count;

//        return user.fetch;
//
//        }).then(function(user) {

        var userCount = user.get('userCount');
        console.log("用户显示发帖数："+userCount.get('numberOfThreads'));
        userCount.set('numberOfThreads',threadCount);
        return userCount.save();

        }).then(function(userCount) {

            console.log('用户发帖数: '+userCount.get('numberOfThreads'));

        },function(error){

            console.log('更改用户发帖数失败');

        });
}

//检查用户回复数
function checkUserNumberOfPosts(user){

    var userId = AV.Object.createWithoutData("_User", user.id);
    var postCount = 0;

    var postQ = new AV.Query(Post);
    postQ.equalTo("postUser", userId);
    postQ.count().then(function(count){

        postCount = count;
        var userCount = user.get('userCount');
        return userCount.fetch;

        }).then(function(userCount) {

            userCount.set('numberOfPosts',postCount);
            return userCount.save();

        }).then(function(userCount) {

            if (!__production)
                console.log('用户最佳回复数: '+userCount.get('numberOfBestPosts'));

        },function(error){

            if (!__production)
                console.log('更改用户最佳回复数失败');

    });
}

AV.Cloud.define("checkUserNumberOfBestPosts", function(request, response) {

    var userId = request.params.userId;

    console.dir(userId);
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
    var postCount = 0;

    console.dir(user);

    var postQ = new AV.Query(Post);
    postQ.equalTo("postUser", user);
    postQ.equalTo("state", 1);
    postQ.count().then(function(count){

//        postCount = count;
        console.log(count);
//        var numberOfBestPosts =
        user.set('numberOfBestPosts',count);
        return user.save();
//        return userCount.fetch;
//
//    }).then(function(userCount) {
//
//        userCount.set('numberOfBestPosts',postCount);
//        return userCount.save();

    }).then(function(user) {


        console.log('用户最佳回复数: '+user.get('numberOfBestPosts'));
            done(user,null);

    },function(error){


        console.log('保存用户最佳回复数失败');
            done(null,error);
    });
}

//检查用户评论数
function checkUserNumberOfComments(user){

    var userId = AV.Object.createWithoutData("_User", user.get('objectId'));
    var commentCount = 0;

    var commentQ = new AV.Query(UserFavicon);
    commentQ.equalTo("postUser", userId);
    commentQ.count().then(function(count){

        commentCount = count;
        var userCount = user.get('userCount');
        return userCount.fetch;

    }).then(function(userCount) {

        userCount.set('numberOfComments',commentCount);
        return userCount.save();

    }).then(function(userCount) {

            if (!__production)
                console.log('用户评论数: '+userCount.get('numberOfComments'));

        },function(error){

            if (!__production)
                console.log('更改用户评论数失败');

        });
}

//检查用户赞数
function checkUserNumberOfSupports(user){

    var userId = AV.Object.createWithoutData("_User", user.id);
    var supportConut = 0;

    var userFavicon = user.get('userFavicon');
    userFavicon.fetch().then(function(userFavicon){

        var supportsQ = userFavicon.relation('supports').query();
        return supportsQ.count();

    }).then(function(count) {

            supportConut = count;
            var userCount = user.get('userCount');
            return userCount.fetch;

        }).then(function(userCount) {

            userCount.set('numberOfSupports',supportConut);
            return userCount.save();

        }).then(function(userCount) {

            if (!__production)
                console.log('用户赞数: '+userCount.get('numberOfComments'));

        },function(error){

            if (!__production)
                console.log('更改用户赞数失败');

        });
}

//检查用户收藏数
function checkUserNumberOfFavicons(user){

    var userId = AV.Object.createWithoutData("_User", user.id);
    var faviconConut = 0;

    var userFavicon = user.get('userFavicon');
    userFavicon.fetch().then(function(userFavicon){

        var faviconQ = userFavicon.relation('threads').query();
        return faviconQ.count();

    }).then(function(count) {

            faviconConut = count;
            var userCount = user.get('userCount');
            return userCount.fetch;

        }).then(function(userCount) {

            userCount.set('numberOfFavicons',supportConut);
            return userCount.save();

        }).then(function(userCount) {

            if (!__production)
                console.log('用户收藏数: '+userCount.get('numberOfFavicons'));

        },function(error){

            if (!__production)
                console.log('更改用户收藏数失败');

        });
}

//检查帖子的回复数
function checkThreadNumberOfPosts(post){

    var thread = post.get('thread');
    thread.fetch(function(thread){

        var threadId = AV.Object.createWithoutData("Thread", thread.id);
        var postQ = new AV.Query(Post);
        postQ.equalTo("thread", threadId);
        return postQ.count();

        }).then(function(count){

            //回复数
            thread.set('numberOfPosts',count);
            return thread.save();

        }).then(function(thread) {

            if (!__production)
                console.log('用户收藏数: '+thread.get('numberOfPosts'));

        },function(error){

            if (!__production)
                console.log('用户收藏数: '+thread.get('numberOfPosts'));
    });

}

//检查回复的评论数
function checkPostNumberOfComments(comment){

    var post = comment.get('post');
    thread.fetch(function(post){

        var postId = AV.Object.createWithoutData("Post", post.id);

        var commentQ = new AV.Query(Comment);
        commentQ.equalTo("post", postId);
        return commentQ.count();

        }).then(function(count){

            //回复数
            post.set('numberOfComments',count);
            return post.save();

        }).then(function(post) {

            if (!__production)
                console.log('回复的评论数: '+post.get('numberOfComments'));

        },function(error){

            if (!__production)
                console.log('更改回复的评论数失败');

    });

}

////发帖前
//AV.Cloud.beforeSave('Thread', function(request, response) {
//
//    console.log("发帖前检查");
//    var user = request.user;
//    var credits = user.get("credits");
//
//    if (!__production)
//        console.log('用户积分 :'+credits);
//
//
//    var thread = request.object;
//    var price = thread.get('price');
//
//    if (!__production)
//        console.log('悬赏积分 :'+price);
//    if (!price) price = 0;
//
//    if (credits >= price+5)
//    {
//        console.log('积分足够');
//        response.success();
//    }
//    else
//    {
//        console.log('积分不足');
//        response.error('积分不足');
//    }
//
//});
//
////发帖后
//AV.Cloud.afterSave('Thread', function(request) {
//
//    console.log("发帖后");
//    var type = 11;
//    var creditRuleId;
//    var thread = request.object;
//    var price = thread.get('price');
//
//    var user = request.user;
//    checkUserNumberOfThreads(user);
//
//    //查找规则
//    var crQuery = new AV.Query('CreditRule');
//    crQuery.equalTo('type', type);
//    return crQuery.first().then(function(object){
//
//        creditRuleId = AV.Object.createWithoutData("CreditRule", object.id);
//        _credits = object.get('credits')-price;
//        _experience = object.get('experience');
//
//        //调整积分
//        user.increment('credits',_credits);
//        //调整经验值
//        user.increment('experience',_experience);
//
//        return user.save();
//
//    }).then(function(user){
//
//        //增加积分变更记录
//        var creditRuleLog = new CreditRuleLog();
//        var userId = AV.Object.createWithoutData("_User", user.id);
//        creditRuleLog.set('user',userId);
//        creditRuleLog.set('type',creditRuleId);
//        creditRuleLog.set('accumulativeCredit',_credits);
//        creditRuleLog.set('accumulativeExperience',_experience);
//        return creditRuleLog.save();
//
//    }).then(function(obj){
//
//        console.log('发帖成功');
//        console.dir(obj);
//
//    },function(error){
//
//        console.log('发帖失败');
//        console.dir(error);
//
//    });
//});

//删除主题
//AV.Cloud.afterDelete("Thread", function(request) {
//
////    var postUser = request.object.get('postUser');
//    var user = request.user;
//    checkUserNumberOfThreads(user);
//
//});

//更新帖子
//AV.Cloud.afterSave('Post', function(request){
//
//    var post = request.object;
//
//    var postState = post.get('state');
//    //已完成的帖子
//    if (postState == 1)
//    {
//        var user = post.get('postUser');
//        var userId = AV.Object.createWithoutData("_User", user.id);
//
//        var postQ = new AV.Query(User);
//        postQ.equalTo('postUser', userId);
//        postQ.equalTo('state', 1);
//        postQ.find().then(function(posts){
//
//            var userCount = user.get('userCount');
//            console.dir(userCount);
//            userCount.set('numberOfBestPost',objects.length);
//            return userCount.save();
//
//        }).then(function(userCount){
//
//
//                console.log("最佳答案成功！");
//
//        },function(error){
//
//                console.log("最佳答案失败！");
//
//        });
//    }
//
//});
//
//
//
////发回复后
//AV.Cloud.afterSave('Post', function(request, response){
//
//    var type = 21;
//    var creditRuleId;
//    console.log('发回复');
//    //检查用户回复
//    var user = request.user;
//    checkUserNumberOfPosts(user);
//
//    //检查帖子回复
//    var post = request.object;
//    checkThreadNumberOfPosts(post);
//
//    //查找规则
//    console.log('查找规则');
//    var crQuery = new AV.Query('CreditRule');
//    crQuery.equalTo('type', type);
//    crQuery.first().then(function(object){
//
//            creditRuleId =AV.Object.createWithoutData("CreditRule", object.id);
//
//            _credits = object.get('credits');
//            _experience = object.get('experience');
//
//            //调整积分
//            user.increment('credits',_credits);
//            //调整经验值
//            user.increment('experience',_experience);
//            return user.save();
//
//        }).then(function(user){
//
////            //增加积分变更记录
//            console.log('增加积分变更记录');
//
//            console.log('积分2 %d',_credits);
//            console.log('经验2 %d',_experience);
////            console.log(c+e);
//
//            var creditRuleLog = new CreditRuleLog();
//
////            console.dir(creditRuleLog);
//            var userId = AV.Object.createWithoutData("_User", user.id);
//
//            creditRuleLog.set('user',userId);
//            creditRuleLog.set('type',creditRuleId);
//            creditRuleLog.set('accumulativeCredit',_credits);
//            creditRuleLog.set('accumulativeExperience',_experience);
//            return creditRuleLog.save();
//
//        }).then(function(creditRuleLog) {
//
//            console.log('发回复成功');
////            console.dir(creditRuleLog);
//
//        },function(error){
//
//            console.log('发回复失败');
//            console.dir(error);
//
//        });
//});
//
////删除回复
//AV.Cloud.afterDelete("Post", function(request) {
//
//    //检查用户回复
//    var user = request.user;
//    checkUserNumberOfPosts(user);
//
//    //检查帖子回复
//    var post = request.object;
//    checkThreadNumberOfPosts(post);
//});
//
////更新回复
//AV.Cloud.afterUpdate("Post", function(request){
//
//    var user = request.user;
//    console.log('最佳回复！！！！！');
//    checkUserNumberOfBestPosts(user);
//});
//
//
//
//
////发评论后
//AV.Cloud.afterSave('Comment', function(request, response){
//
//    var type = 22;
//    var creditRuleId;
//
//    var user = request.user;
//    checkUserNumberOfComments(user);
//
//    var comment = request.object;
//    checkPostNumberOfComments(comment);
//
//    //查找规则
//    console.log('查找规则');
//    var crQuery = new AV.Query('CreditRule');
//    crQuery.equalTo('type', type);
//    crQuery.first().then(function(object){
//
//            creditRuleId =AV.Object.createWithoutData("CreditRule", object.id);
//            _credits = object.get('credits');
//            _experience = object.get('experience');
//
//            //调整积分
//            user.increment('credits',_credits);
//            //调整经验值
//            user.increment('experience',_experience);
//            return user.save();
//
//        }).then(function(user){
//
//            //增加积分变更记录
//            var creditRuleLog = new CreditRuleLog();
//            var userId = AV.Object.createWithoutData("_User", user.id);
//            creditRuleLog.set('user',userId);
//            creditRuleLog.set('type',creditRuleId);
//            creditRuleLog.set('accumulativeCredit',_credits);
//            creditRuleLog.set('accumulativeExperience',_experience);
//            return creditRuleLog.save();
//
//        }).then(function(creditRuleLog) {
//
//            console.log('发评论成功');
//            console.dir(creditRuleLog);
//
//        },function(error){
//
//            console.log('发评论失败');
//            console.dir(error);
//
//        });
//});
//
////删除评论
//AV.Cloud.afterDelete("Comment", function(request) {
//
//    var user = request.user;
//    checkUserNumberOfComments(user);
//
//    var comment = request.object;
//    checkPostNumberOfComments(comment);
//});


//收藏主题or取消收藏主题
//AV.Cloud.afterUpdate("UserFavicon", function(request) {
//    console.log("收藏主题or取消收藏主题");
//    var user = request.user;
//    var userFavicon = request.object;
//
//    var userQ = new AV.Query(User);
//    userQ.equalTo("objectId", user.id);
//    userQ.include('userCount');
//    userQ.include('userFavicon');
//    userQ.first().then(function(user){
//
//
//        var userFavicon = user.get('userFavicon');
//        var userTFR = userFavicon.relation('threads');
//        return userTFR.query().find();
////        return userFR.query().count();
//
//        }).then(function(objects){
//
//            //收藏主题or取消收藏主题
//            var userCount = user.get('userCount');
//            userCount.set('numberOfFavicons',objects.length);
//            return userCount.save();
//
//        }).then(function(userCount) {
//
//            var userFavicon = user.get('userFavicon');
//            var userSFR = userFavicon.relation('supports');
//            return userSFR.query().find();
////        return userSFR.query().count();
//
//        }).then(function(objects) {
//
//            //收藏主题or取消收藏主题
////            console.log(objects.length);
//            var userCount = user.get('userCount');
////            console.dir(userCount);
//            userCount.set('numberOfSupports',objects.length);
//            return userCount.save();
//
//        }).then(function(userCount) {
//
//            console.dir(userCount);
//            console.log("收藏or赞成功！");
//
//        },function(error){
//
//            console.log("收藏or赞失败！");
//
//    });
//});

