const express = require('express');
const router = express.Router();
var AdminPagesController = require("../controller/admin.controller/adminpage.controller");
var AdminController = require("../controller/admin.controller/admin.controller");
var service = require("../service/index")
const path = require('path');
router.use(service.authenticateAdmin);
// router.use(service.authenticateAdmin);




router.get('/admin/login', async (req, res) => {
    await AdminPagesController.login(req,res)   
    // res.send('Admin test route is accessible');
});

router.post('/admin/login', async (req, res) => {
    await AdminController.login(req,res)
    // res.send('Admin test route is accessible');
});


router.get("/admin/logout", AdminController.logout);



 
router.get('/admin/profile', async (req, res) => {
    await AdminPagesController.profile(req,res)
    // res.send('Admin test route is accessible');
});


router.post('/admin/adminpass', async (req, res) => {
    await AdminController.updateAdminProfilePass(req,res)
    // res.send('Admin test route is accessible');
});


router.get("/admin", AdminPagesController.dashboard);
router.get("/admin/dashboard", AdminPagesController.dashboard);
router.get("/admin/user", AdminPagesController.users);


router.get("/admin/category", AdminPagesController.category);
router.get("/admin/categorylist", AdminController.categorylist);
router.get("/admin/get-categories", AdminController.catelist);

let productmodel = require("../models/product.model")
let subcatgroymode = require("../models/subcategory.model")

router.get('/admin/get-subcategories/:categoryId', async (req, res) => {
    const { categoryId } = req.params; // Get categoryId from URL params

    try {
        // Fetch subcategories that match the categoryId
        const subcategories = await subcatgroymode.find({ category: categoryId });

        // Return subcategories
        res.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories.',
            error: error.message
        });
    }
});

router.get('/admin/get-products', async (req, res) => {
    try {
        const products = await productmodel.find().populate('category').populate('subCategory').populate('linkedProducts.relatedProducts').populate('linkedProducts.productRequired');
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products.',
            error: error.message
        });
    }
});

router.get("/admin/categoryadd", AdminPagesController.addcategory);
// router.post("/admin/add-category", AdminController.createCategory);


router.get("/admin/subcategory", AdminPagesController.subcategory);
router.get("/admin/subcategorylist", AdminController.subcategorylist);
router.get("/admin/subcategoryadd", AdminPagesController.subaddcategory);
router.post("/admin/subadd-category", AdminController.subcreateCategory);


router.get("/admin/product", AdminPagesController.product);
router.get("/admin/productlist", AdminController.productlist);
router.get("/admin/subproductadd", AdminPagesController.addproduct);
router.post("/admin/subproduct", AdminController.subcreateproduct);

const multer = require('multer');

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Category route
router.post('/admin/add-category', upload.fields([
    { name: 'category_image', maxCount: 1 },
    { name: 'banner_image', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, position, discount_line, status, category_status, description, label, banner } = req.body;

        // Validate
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // File paths
        const category_image = req.files['category_image'] ? req.files['category_image'][0].path : null;
        const banner_image = req.files['banner_image'] ? req.files['banner_image'][0].path : null;

        // Save to database (Example only)
        const newCategory = {
            name,
            position,
            discount_line,
            status,
            category_status,
            description,
            label,
            banner,
            category_image,
            banner_image
        };
        console.log('New Category:', newCategory);

        return res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;