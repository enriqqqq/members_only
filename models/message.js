const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    title: String,
    text: String,
    date: Date,
});

messageSchema.virtual('formatted_date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

messageSchema.virtual('url').get(function() {
    return `/message/${this._id}`;
});

module.exports = mongoose.model('Message', messageSchema);