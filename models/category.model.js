const mongoose = require('mongoose');

// Define the Category Schema
const categorySchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Unique ID for the category
    c_slider_img: { type: String, default: '' }, // Category slider image
    c_name: { type: String, required: true }, // Category name
    c_short_name: { type: String, default: '' }, // Short name of the category
    c_position: { type: Number, default: 0 }, // Position of the category
    c_desc: { type: String, default: '' }, // Description of the category
    discount_line: { type: String, default: '' }, // Discount line description
    isActive: { type: Boolean, default: true }, // Active status of the category
    ch_heading: { type: String, default: '' }, // Heading content
    ch_content: { type: String, default: '' }, // Content (HTML or plain text)
    ch_banner_path: { type: String, default: '' }, // Banner image path
    ch_label: { type: String, default: '' }, // Label for the banner
    createddate: { type: Date, default: Date.now }, // Creation date
    createdby: { type: Number, required: true }, // ID of the creator
    updatedby: { type: Number, required: true }, // ID of the last updater
    updateddate: { type: Date, default: Date.now } // Last updated date
}, { timestamps: true });

// Create and export the model
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
