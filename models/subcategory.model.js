const mongoose = require('mongoose');

// Define the SubCategory schema
const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        description: {
            type: String,
            required: true
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
