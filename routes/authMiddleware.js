exports.isAuth = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.admin) {
        return next();
    }
    res.redirect('/');
}