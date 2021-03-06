var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录!');
        return res.redirect('/login')
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        return res.redirect('back');
    }
    next();
}

function indexFunction(req, res, next) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    Post.getTen(null, page, function (err, posts, total) {
        if (err) {
            posts = [];
        }
        var data = { title: '主页',
            user: req.session.user,
            posts: posts,
            page: page,
            isFirstPage: (page - 1) === 0,
            isLastPage: ((page - 1) * 10 + posts.length) === total,
            success: req.flash('success').toString(),
            error: req.flash('error').toString() };
        res.render('index', data);
    })
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
    var data = { title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()};
    res.render('post', data);
}

function logoutFunction(req, res, next) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
}

function uploadFunction(req, res, next) {
    res.render('upload', {
        title: '文件上传',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
}

function getUserPostFunction(req, res, next) {
    User.check(req.params.userId, function (err, user) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //检查用户是否存在
        if (!user) {
            req.flash('error', '用户不存在！');
            return res.redirect('/');
        }
        //查询并返回该用户的所有文章
        Post.getTen(user._id, page, function (err, posts, total) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts,
                page: page,
                isFirstPage: (page - 1) === 0,
                isLastPage: ((page - 1) * 10 + posts.length) === total,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        })
    })
}

function getPostFunction(req, res, next) {
    Post.getOne(req.params.postId, function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('article', {
            title: post.title,
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
}

function editFunction(req, res, next) {
    Post.edit(req.params.postId, function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        res.render('edit', {
            title: '编辑',
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
}

function removeFunction(req, res, next) {
    Post.remove(req.params.postId, function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        req.flash('success', '删除成功!');
        res.redirect('/');
    })
}

function getArchiveFunction(req, res, next) {
    Post.getArchive(function (err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('archive', {
            title: '存档',
            user: req.session.user,
            posts: posts,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
}

function getTagsFunction(req, res, next) {
    Post.getTags(function (err, tags) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('tags', {
            title: '标签',
            tags: tags,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
}

function getTagFunction(req, res, next) {
    Post.getTag(req.params.tag, function (err, posts) {
        if (err) {
            req.flash('error',err);
            return res.redirect('/');
        }

        res.render('tag', {
            title: 'TAG:' + req.params.tag,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    })
}

function searchFunction(req, res, next) {
    Post.search(req.query.keyword, function (err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('search', {
            title: "搜索:" + req.query.keyword,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
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
            req.flash('error', "用户名已存在！");
            return res.redirect('/reg');
        }

        newUser.save(function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = user;
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
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        post = new Post(currentUser._id, currentUser.name,req.body.title, req.body.post, tags);
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功！');
        res.redirect('/');
    })
}

function uploadController(req, res, next) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
}

function editController(req, res, next) {
    Post.update(req.params.postId, req.body.post, function (err) {
        var url = encodeURI('/p/' + req.params.postId);
        if (err) {
            req.flash('error', err);
            return res.redirect(url);
        }

        req.flash('success', '修改成功!');
        res.redirect(url);//成功！返回文章页
    })
}

function getPostController(req, res, next) {
    var date = new Date();

    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };

    var comment = {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        content: req.body.content,
        time: time
    };

    var newComment = new Comment(req.params.postId, comment);
    newComment.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '留言成功!');
        res.redirect('back');
    });

}

module.exports = {indexFunction, regFunction, loginFunction, postFunction, searchFunction,
    logoutFunction, uploadFunction, regController, loginController, postController, checkLogin, checkNotLogin, uploadController,
    getUserPostFunction, getPostFunction, editFunction, editController, removeFunction, getPostController, getArchiveFunction,
    getTagsFunction, getTagFunction};