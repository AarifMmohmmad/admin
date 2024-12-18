const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  p_name: { type: String, required: true },
  sku_code: { type: String, required: true },
  p_url_key: { type: String, required: true },
  p_image_path: { type: String },
  p_unit: { type: String },
  p_our_price: { type: Number, required: true },
  p_price: { type: Number, required: true },
  p_category: { type: String, required: true },
  p_subcategory: { type: String },
  p_brand: { type: String },
  p_group: { type: Number, default: 0 },
  p_description: { type: String },
  p_features: { type: String },
  p_type: { type: String },
  p_label: { type: String, default: '' },
  related_products: { type: String },
  required_products: { type: String },
  stock: { type: Number, default: 0 },
  isNewProduct: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: false },
  isGuestCheckout: { type: Boolean, default: true },
  isTrending: { type: Boolean, default: false },
  size: { type: String, default: 'na' },
  status: { type: Number, default: 1 },
  cut_price: { type: Number, default: 0 },
  full_cut_price: { type: Number, default: 0 },
  purchase_collection: { type: Number, default: 0 },
  isOurProduct: { type: Boolean, default: true },
  product_group: { type: Number, default: 0 },
  p_serial_number: { type: String, default: null },
  createddate: { type: Date, default: null },
  createdby: { type: String, default: null },
  updateddate: { type: Date, default: null },
  updatedby: { type: String, default: null },
});

// Model बनाएं
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
