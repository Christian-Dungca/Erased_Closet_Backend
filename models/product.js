const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    details: {type: String, required: true},
    color: {type: String, required: true},
    size: {type: String, required: true},
    image: {type: String, required: true},
    images: {type: [String], required: true},
});

module.exports = mongoose.model('Product', productSchema);