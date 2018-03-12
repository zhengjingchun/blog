var mongodb = require('./db');
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var markdown = require('markdown').markdown;
var url = 'mongodb://localhost:27017/blog'
function Post(userId, name, title, post) {
    this.userId = userId;
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    var date = new Date();

    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    var post = {
        userId: this.userId,
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        "comment": []
    }

    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }

        var postTable = db.collection('posts');
        postTable.insert(post, function (err, posts) {
            db.close();
            if (err) {
                return callback(err)
            }
            callback(null, posts[0]);//成功
        })
    })
}

//读取文章
Post.getAll = function (userId, callback) {
    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }

        var postTable = db.collection('posts');
        var query = {};
        if (userId) {
            query.userId = userId.toString();
        }
        //根据query查询文章
        postTable.find(query).sort({time: -1}).toArray(function (err, docs) {
            db.close();
            if (err) {
                return callback(err);
            }
            //解析 markdown 为 html
            docs.forEach(function (doc) {
                doc.post = markdown.toHTML(doc.post);
            });
            callback(null, docs);
        })
    })
}

//获取一篇文章
Post.getOne = function (postId, callback) {
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
        //根据query查询文章
        postTable.findOne(query, function (err, docs) {
            db.close();
            if (err) {
                return callback(err);
            }

            //解析 markdown 为 html
            if (docs) {
                docs.post = markdown.toHTML(docs.post);
            }
            callback(null, docs);
        })
    })
};

//编辑
Post.edit = function (postId, callback) {
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

        //根据query查询文章
        postTable.findOne(query, function (err, docs) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        })
    })
}

//保存
Post.update = function (postId, post, callback) {
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

        //根据query查询文章
        postTable.updateOne(query, {
            $set: {post: post}
        }, function (err, docs) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        })
    })
}

//删除文章
Post.remove = function (postId, callback) {
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

        //根据query查询文章
        postTable.removeOne(query, {
            w: 1
        }, function (err) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null);
        })
    })
}