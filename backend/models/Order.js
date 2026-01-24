// const mongoose = require("mongoose");

// const AddonSchema = new mongoose.Schema({
//   addonId: { type: String, required: true }, // unique id for addon
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, required: true, min: 1 },
// });

// const ProductSchema = new mongoose.Schema({
//   _id: { type: String, required: true }, // product ID
//   name: String,
//   price: Number,
//   quantity: Number,
//   productImage: String,
//   addons: [AddonSchema], // <-- new addons array here
//   default: [],  // if no addons provided, default to empty array

// });

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   products: [ProductSchema], // array of products with addons
//   total: Number,
//   date: {
//     type: Date,
//     default: Date.now,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "completed", "processing"],
//     default: "pending",
//   },
//   orderType: {
//     type: String,
//     enum: ["dine-in", "takeaway"],
//     default: "takeaway",
//   },
// });

// module.exports = mongoose.model("Order", orderSchema);
const mongoose = require("mongoose");

const AddonSchema = new mongoose.Schema({
  addonId: { type: String, required: true }, // unique id for addon
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // product ID
  name: String,
  price: Number,
  quantity: Number,
  productImage: String,
  addons: [AddonSchema], // <-- new addons array here
  default: [],  // if no addons provided, default to empty array
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [ProductSchema], // array of products with addons
  total: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "processing"],
    default: "pending",
  },
  orderType: {
    type: String,
    enum: ["dine-in", "takeaway"],
    // REMOVED default since we're no longer using orderType for ecommerce
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  
  // ==========================================
  // 📦 DELIVERY INFORMATION (NEW)
  // ==========================================
  deliveryInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  }
});

module.exports = mongoose.model("Order", orderSchema);