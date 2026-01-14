const mongoose = require("mongoose");

const addonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
  },

  categoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
  },

  sellerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },

  productImage: {
    type: String,
  },

  addons: [addonSchema], // <-- add-on options defined by admin
});

module.exports = mongoose.model('Product', productSchema);
