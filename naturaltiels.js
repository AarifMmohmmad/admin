const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const router = express.Router();
const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('./config');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan = require('morgan');
var cors = require('cors');
var models = require('./models');
var service = require("./service/index")
morgan.token('host', function(req) {
    return req.hostname;
});

app.use(
    cors({
        origin: '*'
    })
);


app.use(
    session({
        secret: "config.sessionSecret",
        resave: false,
        saveUninitialized: true
    })
);



//loges request
morgan.token('body', (req, res) => JSON.stringify(req.body));
// app.use(morgan(':method :host :url :status :res[content-length] :body - :response-time ms'));
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });


app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
// var privateKey = fs.readFileSync('ssl.key', 'utf8');
// var certificate = fs.readFileSync('ssl.cert', 'utf8');
// var bundle = fs.readFileSync('ssl.ca', 'utf8');
// var server = https.createServer({
//     key: privateKey,
//     cert: certificate,
//     ca: bundle
//   }, app);
// app.use(session({
//     secret: 'your_secret_key', // Change this to your secret key
//     resave: false,
//     saveUninitialized: true
// }));


// app.use('/app', express.static(path.join(__dirname, 'public', 'app')));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile);
app.use(
    bodyParser.urlencoded({
        extended: true,
        type: 'application/x-www-form-urlencoded'
    })
);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let uploadedImage = req.files.image;
    let uploadPath = path.join(uploadDir, uploadedImage.name);
    uploadedImage.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(`File uploaded! You can view it at /uploads/${uploadedImage.name}`);
    });
});


app.post('/admin/add-category', (req, res) => {
    // Check if the required fields and files are available
    if (!req.body.name || !req.body.position || !req.files) {
        return res.status(400).json({ success: false, message: "Missing required fields or files." });
    }

    // Handle uploaded files
    const categoryImage = req.files.category_image;
    const bannerImage = req.files.banner_image;

    // Define paths to save the uploaded files
    let imagename1 = categoryImage.name +Date.now()   
     let imagename2 = bannerImage.name + Date.now()

    const categoryImagePath = path.join(__dirname, 'uploads', categoryImage.name);
    const bannerImagePath = path.join(__dirname, 'uploads', bannerImage.name);

    // Move the files to the "uploads" directory
    categoryImage.mv(categoryImagePath, (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error uploading category image', error: err });
        }

        bannerImage.mv(bannerImagePath, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error uploading banner image', error: err });
            }

            // Save the category data to the database
            const categoryData = {
                name: req.body.name,
                position: req.body.position,
                discount_line: req.body.discount_line,
                status: req.body.status === 'true',  // Convert string to boolean
                category_status: req.body.category_status === 'true',  // Convert string to boolean
                visibility: req.body.visibility,
                description: req.body.description,
                label: req.body.label,
                banner: req.body.banner,
                category_image: categoryImage.name, // Store image name in DB or path
                banner_image: bannerImage.name, // Store banner image name in DB or path
                related_products: req.body.related_products,
                seo: {
                    meta_title: req.body['seo[meta_title]'],
                    meta_description: req.body['seo[meta_description]'],
                    meta_keywords: req.body['seo[meta_keywords]']
                }
            };

            // Example: Save the category to the database (you need to implement this part)
            // CategoryModel.create(categoryData, (err, savedCategory) => {
            //     if (err) {
            //         return res.status(500).json({ success: false, message: 'Failed to save category', error: err });
            //     }
            //     res.json({ success: true, message: 'Category added successfully!' });
            // });

            // For now, let's return a success message
            res.json({ success: true, message: 'Category added successfully!' });
        });
    });
});


app.post('/admin/add-product', async (req, res) => {
    try {
        // Check if required fields are available
        const { name, brand, skuCode, urlKey, visibility, category, subCategory, description, linkedProducts, price } = req.body;
        
        if (!name || !brand || !skuCode || !urlKey || !category || !subCategory || !description || !price) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Handle image files (assuming 'images' is the name of the input in the form)
        let images = [];
        if (req.files && req.files.images) {
            if (Array.isArray(req.files.images)) {
                // Handle multiple images
                images = req.files.images.map(image => {
                    const imageName = Date.now() + '-' + image.name;
                    const uploadPath = path.join(__dirname, '../uploads/products', imageName);
                    image.mv(uploadPath, (err) => {
                        if (err) {
                            console.error('Error uploading image:', err);
                            return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
                        }
                    });
                    return imageName;
                });
            } else {
                // Handle single image
                const imageName = Date.now() + '-' + req.files.images.name;
                const uploadPath = path.join(__dirname, '../uploads/products', imageName);
                req.files.images.mv(uploadPath, (err) => {
                    if (err) {
                        console.error('Error uploading image:', err);
                        return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
                    }
                });
                images.push(imageName);
            }
        }

        // Prepare the product data
        const newProduct = new ProductModel({
            name,
            brand,
            skuCode,
            urlKey,
            visibility: visibility === 'on', // Convert checkbox to boolean
            category,
            subCategory,
            description,
            linkedProducts,
            price: {
                price: parseFloat(price.price),
                ourPrice: parseFloat(price.ourPrice),
                ourCutPrice: parseFloat(price.ourCutPrice),
                ourFullCutPrice: parseFloat(price.ourFullCutPrice),
            },
            images: images // Store image names in the database
        });

        // Save the product in the database
        const savedProduct = await newProduct.save();

        return res.status(200).json({
            success: true,
            message: 'Product added successfully!',
            data: savedProduct
        });

    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

app.post('/admin/add-subcategory', async (req, res) => {
    try {
        // Get the form data
        const { name, description, category, seo } = req.body;
        
        if (!name || !category || !seo.meta_title || !seo.meta_description || !seo.meta_keywords) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Handle image upload
        let imageName = '';
        if (req.files && req.files.category_image) {
            const imageFile = req.files.category_image;
            imageName = Date.now() + '-' + imageFile.name;
            const uploadPath = path.join(__dirname, '../uploads/subcategories', imageName);
            await imageFile.mv(uploadPath);
        }

        // Create a new subcategory
        const newSubCategory = new SubCategoryModel({
            name,
            category,
            description,
            image: imageName,
            seo: {
                meta_title: seo.meta_title,
                meta_description: seo.meta_description,
                meta_keywords: seo.meta_keywords
            }
        });

        // Save the subcategory to the database
        const savedSubCategory = await newSubCategory.save();

        return res.status(200).json({
            success: true,
            message: 'SubCategory added successfully!',
            data: savedSubCategory
        });

    } catch (error) {
        console.error('Error adding subcategory:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// const isAuthenticated = (req, res, next) => {
//     if (req.session && req.session.loggedIn) {
//         next(); 
//     } else {
//         res.redirect('/login');
//     }
// };


const apiRouter = require('./routes/apiRouter');
const adminRouter = require('./routes/adminRouter');


// Middleware for authentication (admin routes)
// app.use((req, res, next) => {
//     if (!req.path.startsWith('/api')) {
//         console.log("Admin middleware",req.path);
//         service.authenticateAdmin(req,res,next)
//     } else {
//         next();
//     }
// });
app.use('/api', apiRouter); 
app.use('/', adminRouter);


app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});



app.use(
    bodyParser.urlencoded({
        extended: true,
        type: 'application/x-www-form-urlencoded'
    })
);
process.on('unhandledRejection', function(err) {
    console.log("ERR",err);
});

/**
 *	Server bootup section
 **/ 
 try {
    // DB Connect
    const dbConnection = mongoose.connect(
        `${config.dbConnectionUrl}`,
        {
            useNewUrlParser: true,
        }
    );

    dbConnection.then(() => {
        console.log("mongodb connected successfully ")
        // logger.info(`Connected to ${process.env.NODE_ENV} database: ${config.dbConnectionUrl}`);
        server.listen(config.port, function() {
            // logger.info('Game API Server listening at PORT:' + config.port);
            console.log('Game API Server listening at PORT:' + config.port);
        });
    }).catch((err) => {
        // logger.info('ERROR CONNECTING TO DB', err);
    });
} catch (err) {
    logger.info('DBCONNECT ERROR', err);
}

module.exports = server;
