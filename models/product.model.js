'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product Schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  skuCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  urlKey: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  visibility: {
    type: Boolean,
    default: true
  },
  productLabel: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    required: true
  },
  productType: {
    type: String,
    required: true
  },
  group: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: true
  },
  serialNo: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  metaDescription: {
    metaTitle: {
      type: String,
      trim: true
    },
    metaKeywords: {
      type: [String],
      trim: true
    },
    metaDescription: {
      type: String,
      trim: true
    }
  },
  price: {
    price: {
      type: Number,
      required: true
    },
    ourPrice: {
      type: Number,
      required: true
    },
    ourCutPrice: {
      type: Number,
      required: true
    },
    ourFullCutPrice: {
      type: Number,
      required: true
    }
  },
  images: {
    type: [String], // Array of image URLs
    required: true
  },
  category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
  },
  subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory'
  },
  linkedProducts: {
    relatedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    productRequired: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  }
}, { timestamps: true });

// Create an instance method to format the product response
ProductSchema.methods.toProductJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    brand: this.brand,
    skuCode: this.skuCode,
    urlKey: this.urlKey,
    visibility: this.visibility,
    productLabel: this.productLabel,
    size: this.size,
    productType: this.productType,
    group: this.group,
    unit: this.unit,
    serialNo: this.serialNo,
    description: this.description,
    metaDescription: this.metaDescription,
    price: this.price,
    images: this.images,
    category: this.category,
    subCategory: this.subCategory,
    linkedProducts: this.linkedProducts
  };
};

// Create the Product model
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
