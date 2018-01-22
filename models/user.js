var mongodb = require('./db');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/blog';

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    }

    //打开数据库
    MongoClient.connect(url,function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }
        var usersTable = db.collection('users');
        usersTable.insert(user, function (err, users) {
            db.close();
            if (err) {
                return callback(err)
            }

            callback(null, users[0]);//成功
        })
    })
};

//读取用户信息
User.get = function (name, callback) {
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return callback(err);
        }
        var usersTable = db.collection('users');
        usersTable.findOne({
            name: name
        }, function (err, user) {
            db.close();
            if (err) {
                return callback(err);
            }
            callback(null, user);
        })
    })
}