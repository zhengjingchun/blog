var mongodb = require('./db');
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var markdown = require('markdown').markdown;
var url = 'mongodb://localhost:27017/blog'
function Comment(postId, comment) {
    this.postId = postId;
    this.comment = comment;
}

module.exports = Comment;

//存储留言
Comment.prototype.save = function (callback) {

       var postId = this.postId;
       var comment = this.comment;


    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }

        var postTable = db.collection('posts');

        var query = {
            "_id": ObjectId(postId)
        };
        postTable.updateOne(query, {
            $push: {"comments": comment}
        }, function (err, post) {
            db.close();
            if (err) {
                return callback(err)
            }
            callback(null);//成功
        })
    })
}