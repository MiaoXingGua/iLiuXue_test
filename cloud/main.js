
var Thread = AV.Object.extend('Thread');
var Post = AV.Object.extend('Post');
var Commnet = AV.Object.extend('Commnet');
var CreditRuleLog = AV.Object.extend('CreditRuleLog');
var User = AV.Object.extend('_User');

var _credits = 0;
var _experience = 0;


AV.Cloud.setInterval('refreash_thread_count', 30, function(){

    var userQuery = new AV.Query(User);
    userQuery.find().then(function(users){

        console.log("成功1！！！");
//        console.log(users.length);

        for (var i = 0; i < users.length; i++) {

//            console.log(i);
            var user = users[i];
//            console.log(user.get('username'));

            var threadQuery = new AV.Query(Thread);
            threadQuery.equalTo("postUser", user);
            threadQuery.find().then(function(threads){

                var firThread = threads[0];
                if (firThread)
                {
                    var user = firThread.get('postUser');

                    var userCount = user.get('userCount');

                    console.dir(user);
                    console.dir(userCount);

                    userCount.set('numberOfThreads',threads.length);

                    return userCount.save();
                }

//                console.log(user.get('username'));

//                console.log(count);
//                console.log(user.get('username'));

//               if (users[i].get('username') == '123456789')
//               {
//                   console.log(count);
//                   var userCount = users[i].get('userCount');
//                   userCount.set('numberOfThreads',count);
//                   return userCount.save();
//               }
//
            }).then(function(userCount){
//
                console.log("成功2！！！");
                console.log(userCount);
//
            },function(error){

                console.log("失败2！！！");
                console.dir(error);

            });
        }

    },function(error){

        console.log("失败1！！！");
        console.dir(error);
    });

});

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


    //最后回复时间=发帖时间
//    var updatedAt = thread.get('updatedAt');
//
//    thread.set('lastPostAt',updatedAt);
//    thread.save().then(function(thread){

    //user的发帖数+1
    console.log('user的发帖数+1');

//    var userCount = user.get('userCount');
//    userCount.increment('numberOfThresds');
//    userCount.save().then(function(obj) {
//
//        console.log('成功');
//        console.dir(obj);
//
//    }, function(error) {
//
//        console.log('失败');
//        console.dir(error);
//    });

    var userCount = user.get('userCount');
    userCount.increment('numberOfThreads');
    userCount.save().then(function(){

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

    //回复
    thread.relation('posts').add(post);
    //回复数
    thread.increment('numberOfPosts');
    //最后回复人
    thread.set('lastPoster',user);
    //最后回复时间
    thread.set('lastPostAt',post.get('createdAt'));

    thread.save().then(function(thread){

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

    //评论
    post.relation('comments').add(comment);
    //评论数
    post.increment('numberOfComments');
    //最后评论人
    post.set('lastCommenter',user);   //这里就不用WithoutData
    //最后评论时间
    post.set('lastCommentAt',comment.get('createdAt'));

    post.save().then(function(post){

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