const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

// Return the registration form
exports.create_get = (req, res) => {
    res.render('register', { 
        errors: null,
        prev_values: null,
    });
}

// Create a new user
exports.create_post = [
    // Validate and sanitize fields
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified.")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("last_name")
        .trim()
        .isLength({ min: 1})
        .escape()
        .withMessage("Last name must be specified.")
        .isAlphanumeric()
        .withMessage("Last name has non-alphanumeric characters"),
    body("username")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Username must be specified.")
        .isAlphanumeric()
        .withMessage("Username has non-alphanumeric characters.")
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            if(user) return Promise.reject();
        }).withMessage("Username is already taken"),
    body("password")
        .isLength({ min: 3})
        .escape()
        .withMessage("Password must be at least 3 characters long"),
    body("c_password").custom((value, { req }) => {
        return value === req.body.password;
    }).withMessage("Passwords do not match"),
    
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            // Create an object with the first error message for each field
            const firstErrors = {};
            errors.array().forEach((error) => {
                if(!firstErrors[error.path]) {
                    firstErrors[error.path] = error.msg;
                }
            });

            res.render('register', { 
                errors: firstErrors,
                prev_values: req.body,
            });
            return;
        }
        
        // Hash the password
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if(err) { 
                return next(err); 
            }
            const user = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                member_status: "non-member",
                password: hashedPassword,
            });
            await user.save();
            res.redirect('/');       
        });
    }),
];

// Return the login form
exports.login_get = (req, res) => {
    const errors = req.flash('error');
    let usedError = null;

    if(errors.length > 0) {
        usedError = errors[0];
    }

    res.render('login', { 
        error: usedError,
    });
};

// Update the user's member status
exports.update_member_status = asyncHandler(async (req, res) => {
    if(req.body.secret_password !== process.env.MEMBERSHIP_PASSWORD) {
        res.redirect('/');
        return;
    }
    
    const user = await User.findById(req.user.id);
    user.member_status = "member";
    await user.save();
    res.redirect('/');
});

exports.edit_get = (req, res, next) => {
    res.render('edit', {
        user: req.user,
        errors: null,
    });
}

exports.edit_post = [
    // Validate and sanitize fields
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified.")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("last_name")
        .trim()
        .isLength({ min: 1})
        .escape()
        .withMessage("Last name must be specified.")
        .isAlphanumeric()
        .withMessage("Last name has non-alphanumeric characters"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            // Create an object with the first error message for each field
            const firstErrors = {};
            errors.array().forEach((error) => {
                if(!firstErrors[error.path]) {
                    firstErrors[error.path] = error.msg;
                }
            });

            res.render('edit', { 
                user: req.user,
                errors: firstErrors,
            });
            return;
        }

        const user = await User.findById(req.user.id);
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        await user.save(); 
        
        res.redirect('/');
    })
];