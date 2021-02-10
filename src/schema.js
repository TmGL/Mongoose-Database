const mongoose = require('mongoose');

module.exports = mongoose.model('db', new mongoose.Schema({
    key: String,
    value: mongoose.SchemaTypes.Mixed
}));