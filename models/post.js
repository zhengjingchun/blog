var mongodb = require('./db');
var mongoClient = require('mongodb').MongoClient;
var markdown = require('markdown').markdown;
var url = 'mongodb://localhost:27017/blog'
function Post(name, title, post) {
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
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
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
Post.get = function (name, callback) {
    //打开数据库
    mongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }

        var postTable = db.collection('posts');
        var query = {};
        if (name) {
            query.name = name;
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