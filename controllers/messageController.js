const Message = require('../models/message');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all messages.
exports.message_list = asyncHandler(async (req, res) => {
    const messages = await Message.find().populate('user_id').sort({ date: -1 });

    // get all members
    const members = await User.find({ member_status: 'member' });
    
    res.render('index', { 
        user: req.user,
        members: members,
        messages: messages,
    });
});

// Create a new message
exports.message_create = [
    body("title")
        .escape()
        .isLength({ min: 1, max: 20 }),
    body("msg")
        .escape()
        .isLength({ min: 1, max: 200}),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.redirect('/');
            return;
        } 

        const message = new Message({
            user_id: req.user.id,
            title: req.body.title,
            text: req.body.msg,
            date: new Date(),
        });

        await message.save();   
        res.redirect('/');
    })
];

exports.message_delete = asyncHandler(async (req, res) => {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect('/');
});