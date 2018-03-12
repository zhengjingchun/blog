var mongodb = require('./db');
var mongoClient = require('mongodb').MongoClient;
var markdown = require('markdown').markdown;
var url = 'mongodb://localhost:27017/blog'
function Comment(name, title, comment) {
    this.name = name;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储留言
Comment.prototype.save = function (callback) {
    var date = new Date();

    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    var comment = {
        name: this.name,

    }
}