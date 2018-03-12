var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');
var fileServces = require('../public/javascripts/fileService');

/* GET home page. */
router.get('/', indexController.indexFunction);

router.get('/reg', indexController.checkNotLogin);
router.get('/reg', indexController.regFunction);
router.post('/reg', indexController.checkNotLogin);
router.post('/reg', indexController.regController);

router.get('/login', indexController.checkNotLogin);
router.get('/login', indexController.loginFunction);
router.post('/login', indexController.checkNotLogin);
router.post('/login', indexController.loginController);

router.get('/post', indexController.checkLogin);
router.get('/post', indexController.postFunction);
router.post('/post', indexController.checkLogin);
router.post('/post', indexController.postController);

router.get('/logout', indexController.checkLogin);
router.get('/logout', indexController.logoutFunction);

router.get('/upload', indexController.checkLogin);
router.get('/upload', indexController.uploadFunction);
router.post('/upload', indexController.checkLogin);
router.post('/upload', fileServces.upload.single('file'), indexController.uploadController);

router.get('/u/:userId', indexController.getUserPostFunction);
router.get('/p/:postId', indexController.getPostFunction);

router.get('/edit/:postId', indexController.checkLogin);
router.get('/edit/:postId', indexController.editFunction);
router.post('/edit/:postId', indexController.checkLogin);
router.post('/edit/:postId', indexController.editController);

router.get('/remove/:postId', indexController.checkLogin);
router.get('/remove/:postId', indexController.removeFunction);

module.exports = router
