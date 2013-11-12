
var Thread = AV.Object.extend('Thread');
var CreditRuleLog = AV.Object.extend('CreditRuleLog');


var _credits = 0;
var _experience = 0;

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
    var updatedAt = Thread.get('updatedAt');

    var price = Thread.get('price');

    thread.set('lastPostAt',updatedAt);

    //提交问题
    var type = 11;
    var user = request.user;

    //查找规则
    var crQuery = new AV.Query('CreditRule');
    crQuery.equalTo('type', type);
    crQuery.first().then(function(object){

        _credits = object.get('credits')-(price+5);
        _experience = object.get('experience');

        //调整积分
        user.increment('credits',_credits);
        //调整经验值
        user.increment('experience',_experience);

        return user.save();

        }).then(function(user){

            //增加积分变更记录
            var creditRuleLog = new CreditRuleLog();
            creditRuleLog.set('user',user);
            creditRuleLog.set('type',type);
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
//    if (post.get('createdAt') != post.get('updateAt'))
//        return;

    var type = 21;

    var user = request.user;
    var thread = post.get('thread');

//    console.log('thread');
//    console.dir(thread);

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
//        console.log('userCount');

        var userCount = user.get('userCount');

//        console.dir(userCount);

        userCount.increment('numberOfPosts');

        return userCount.save();

         }).then(function(){


            //查找规则
            console.log('查找规则');
            var crQuery = new AV.Query('CreditRule');
            crQuery.equalTo('type', type);
            return crQuery.first();

        }).then(function(object){

//            console.log('调整积分');
//            console.dir(object);

            creditRuleId =AV.Object.createWithoutData("CreditRule", object.id);

            _credits = object.get('credits');
            _experience = object.get('experience');


//            console.log('积分1 %d',_credits);
//            console.log('经验1 %d',_experience);
//            console.log(c+e);

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
    if (comment.get('createdAt') != comment.get('updateAt'))
        return;

    var post = post.get('post');
    var user = request.user;

    post.increment('numberOfPosts');

    //评论
    post.relation('comments').add(comment);
    //评论数
    post.increment('numberOfComments');
    //最后评论人
    post.set('lastCommenter',user);
    //最后评论时间
    post.set('lastCommentAt',comment.get('createdAt'));

    post.save().then(function(thread){

        //user的评论数+1
        user.get('userCount').increment('numberOfComments');

        return user.save();

//        }).then(function(user){

    }).then(function(user){

            var type = 22;
            //查找规则
            var crQuery = new AV.Query('CreditRule');
            crQuery.equalTo('type', type);
            return crQuery.first();

        }).then(function(object){

            var c = object.get('credits');
            var e = object.get('experience');

            //调整积分
            user.increment('credits',c);
            //调整经验值
            user.increment('experience',e);
            return user.save();

        }).then(function(user,c,e){

            //增加积分变更记录
            var creditRuleLog = new CreditRuleLog();
            creditRuleLog.set('user',user);
            creditRuleLog.set('type',type);
            creditRuleLog.set('accumulativeCredit',c);
            creditRuleLog.set('accumulativeExperience',e);
            return creditRuleLog.save();

        },function(error){


        });
});