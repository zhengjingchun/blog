var mongodb = require('./db');
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var markdown = require('markdown').markdown;
var url = 'mongodb://localhost:27017/blog'
function Post(userId, name, title, post, tags) {
    this.userId = userId;
    this.name = name;
    this.title = title;
    this.post = post;
    this.tags = tags;
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
        tags: this.tags,
        comments: [],
        pv: 0
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
Post.getTen = function (userId, page, callback) {
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
        postTable.count(query, function (error, total) {
            if (error) {
                db.close();
                return callback(err);
            }
            postTable.find(query,{
                skip: (page - 1)*10,
                limit: 10
            }).sort({time: -1}).toArray(function (err, docs) {
                if (err) {
                    return callback(err);
                }
                //解析 markdown 为 html
                docs.forEach(function (doc) {
                    if (doc.post) {
                        doc.post = markdown.toHTML(doc.post);
                    }
                });
                callback(null, docs, total);
            })
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
        postTable.findOne(query, function (err, doc) {
            if (err) {
                db.close();
                return callback(err);
            }
            if (doc) {
                //每访问 1 次，pv 值增加 1
                postTable.updateOne(query, {
                    $inc: {"pv": 1}
                }, function (err) {
                    db.close();
                    console.log(err)
                    if (err) {
                        return callback(err);
                    }
                });
            }
            db.close();
            //解析 markdown 为 html
            if (doc) {
                doc.post = markdown.toHTML(doc.post);
                if (doc.comments && doc.comments.length) {
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                }
            }
            callback(null, doc);
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

//返回所有文章存档信息
Post.getArchive = function(callback) {
    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }

        var postTable = db.collection('posts');
        postTable.find({}, {
            "name": 1,
            "time": 1,
            "title": 1
        }).sort({
            time: -1
        }).toArray(function (err, docs) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        })
    })
}

//获取标签
Post.getTags = function (callback) {
    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }

        var postTable = db.collection('posts');
        //distinct 用来找出给定键的所有不同值
        postTable.distinct('tags', function (err, tags) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null, tags);
        })
    })
}

//获取标签对应的文章
Post.getTag = function (tag, callback) {
    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }
        var postTable = db.collection('posts');
        //查询所有 tags 数组内包含 tag 的文档
        //并返回只含有 name、time、title 组成的数组
        postTable.find({
            "tags": tag
        }, {
            "name": 1,
            "time": 1,
            "title": 1
        }).sort({
            time: -1
        }).toArray(function (err, docs) {
            mongodb.close();
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        });
    })
}

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }
        var pattern = new RegExp(keyword, "i");
        var postTable = db.collection('posts');
        postTable.find({
            "title": pattern
        }, {
            "name": 1,
            "time": 1,
            "title": 1
        }).sort({
            time: -1
        }).toArray(function (err, docs) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        });
    });
};