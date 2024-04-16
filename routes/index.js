const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');
const passport = require('passport');
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;

// Home Page
router.get('/', isAuth, messageController.message_list);

// Register routes
router.get('/register', userController.create_get);

router.post('/register', userController.create_post);

router.get('/edit', isAuth, userController.edit_get);

router.post('/edit', isAuth, userController.edit_post);

// Login routes
router.get('/login', userController.login_get);

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if(err) return next(err);
    res.redirect('/login');
  });
});

router.post('/message/create', isAuth, messageController.message_create);

router.post('/message/:id/delete', isAdmin, messageController.message_delete);

router.post('/update-membership', isAuth, userController.update_member_status);

module.exports = router;
