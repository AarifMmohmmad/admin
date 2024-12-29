const mongoose = require('mongoose');

// Define the Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    position: { type: Number, default: 0 },  
    discount_line: { type: String, default: '' }, 
    status: { type: Boolean, default: true }, 
    category_status: { type: Boolean, default: true }, 
    description: { type: String, default: '' }, 
    label: { type: String, default: '' }, 
    banner: { type: String, default: '' }, 
    category_image: { type: String, default: '' },
    banner_image: { type: String, default: '' }, 
    seo: {
        meta_title: { type: String, default: '' },
        meta_description: { type: String, default: '' },
        meta_keywords: { type: String, default: '' }
    }
}, { timestamps: true });

// Create and export the model
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
