const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    username: String,
    member_status: String,
    password: String,
    admin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);