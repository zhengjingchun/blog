var crypto = require('crypto');
var User = require('../models/user.js');

function indexFunction(req, res, next) {
    var data = { title: '主页',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() };
    res.render('index', data);
}

function regFunction(req, res, next) {
    var data = { title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    };
    res.render('reg', data);
}

function loginFunction(req, res, next) {
    var data = { title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()};
    res.render('login', data);
}

function postFunction(req, res, next) {
    var data = { title: '发表' };
    res.render('index', data);
}

function logoutFunction(req, res, next) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
}

function regController(req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        password_re =  req.body['password-repeat'];
    //检查两次代码输入
    if (password !== password_re) {
        req.flash('两次输入密码不一致！');
        return res.redirect('/reg');//返回注册页
    }

    var md5 = crypto.createHash('md5'),
        password = md5.update(password).digest('hex');

    var newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    })

    //检查用户名是否存在
    User.get(newUser.name, function (err, user) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if (user) {
            console.log("用户名已存在！");
            req.flash('error', "用户名已存在！");
            return res.redirect('/reg');
        }

        newUser.save(function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = user;
            console.log("注册成功！");
            req.flash('success', '注册成功!');
            res.redirect('/')
        })
    })
}

function loginController(req, res, next) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    User.get(req.body.name, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }

        //检查密码是否一致
        if (user.password !== password) {
            req.flash('error', '密码错误!');
            return res.redirect('/login');
        }

        //用户名密码匹配，则存入session
        req.session.user = user;
        req.flash('success', '登录成功!');
        res.redirect('/');
    })
}

function postController(req, res, next) {

}



module.exports = {indexFunction, regFunction, loginFunction, postFunction, logoutFunction, regController, loginController, postController};