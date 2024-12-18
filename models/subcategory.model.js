const mongoose = require('mongoose');

// Define the SubCategory schema
const subCategorySchema = new mongoose.Schema(
    
    {
        id: { type: String, required: true, unique: true }, // Unique ID for the category
        sc_name: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: String,
            required: true,
            trim: true
        },
        parent_category: {
            type: Number,
            required: true,
        },
        sc_desc: {
            type: String,
            required: true
        },
        sc_slider_img: {
            type: String, // Path to image file
            default: ''
        },
        seo: {
            meta_title: {
                type: String,
                required: true
            },
            meta_description: {
                type: String,
                required: true
            },
            meta_keywords: {
                type: String,
                required: true
            }
        }
    },
    { timestamps: true } // Add timestamps for created_at and updated_at
);

// Create and export the SubCategory model
const SubCategory = mongoose.model('SubCategory', subCategorySchema);
module.exports = SubCategory;
