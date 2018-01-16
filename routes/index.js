var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

/* GET home page. */
router.get('/', indexController.indexFunction);
router.get('/reg', indexController.regFunction);
router.post('/reg', indexController.regController);
router.get('/login', indexController.loginFunction);
router.post('/login', indexController.loginController);
router.get('/post', indexController.postFunction);
router.post('/post', indexController.postController);
router.get('/logout', indexController.logoutFunction);

module.exports = router
