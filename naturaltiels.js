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



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


let categorymodel  = require("./models/category.model") 
let subcategory = require("./models/subcategory.model")
let product = require("./models/product.model")
app.post('/admin/add-category', async (req, res) => {
    try {
        if (!req.body.name || !req.files?.category_image || !req.files?.banner_image) {
            return res.status(400).json({ success: false, message: 'Missing required fields or files.' });
        }

        const categoryImage = req.files.category_image;
        const bannerImage = req.files.banner_image;

        // File upload
        const categoryImagePath = path.join(uploadDir, `category-${Date.now()}-${categoryImage.name}`);
        const bannerImagePath = path.join(uploadDir, `banner-${Date.now()}-${bannerImage.name}`);
        await categoryImage.mv(categoryImagePath);
        await bannerImage.mv(bannerImagePath);

        // Save category data (mock example)
        const categoryData = {
            name: req.body.name,
            position: req.body.position,
            discount_line: req.body.discount_line,
            status: req.body.status === 'true',
            category_status: req.body.category_status === 'true',
            visibility: req.body.visibility,
            description: req.body.description,
            label: req.body.label,
            banner: req.body.banner,
            category_image: `uploads/${path.basename(categoryImagePath)}`,
            banner_image: `uploads/${path.basename(bannerImagePath)}`,
            seo: {
                meta_title: req.body['seo[meta_title]'],
                meta_description: req.body['seo[meta_description]'],
                meta_keywords: req.body['seo[meta_keywords]'],
            },
        };
        const newCategory = new categorymodel(categoryData)
        let savecate = await newCategory.save();
        // Save to database (replace with actual DB logic)
        console.log('Category saved:', savecate);
        
        res.json({ success: true, message: 'Category added successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});


app.post('/admin/add-subcategory', async (req, res) => {
    try {
        console.log("yes call")
      if (!req.body.name || !req.body.category || !req.files?.category_image) {
        return res.status(400).json({ success: false, message: 'Missing required fields or files.' });
      }
  
      const categoryImage = req.files.category_image;
      console.log(categoryImage.name ,"name")
      const imagePath = path.join(uploadDir, `subcategory-${Date.now()}-${categoryImage.name}`);
      await categoryImage.mv(imagePath);
  
      const subCategoryData = {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        category_image: `uploads/${path.basename(imagePath)}`,
        seo: {
          meta_title: req.body['seo[meta_title]'],
          meta_description: req.body['seo[meta_description]'],
          meta_keywords: req.body['seo[meta_keywords]'],
        },
      };
  
      const newSubCategory = new subcategory(subCategoryData);
      const savedSubCategory = await newSubCategory.save();
      res.json({ success: true, message: 'SubCategory added successfully!', data: savedSubCategory });
    } catch (error) {
        console.log(error)
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

const apiRouter = require('./routes/apiRouter');
const adminRouter = require('./routes/adminRouter');

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


app.post('/admin/add-product', async (req, res) => {
    try {
        // Check if images are uploaded
        if (!req.files || !req.files.image ) {
            return res.status(400).json({ success: false, message: 'No images uploaded.' });
        }
        console.log(req.body)

                // Handle image upload
                const image = req.files.image;
                const imagePath = path.join(uploadDir, `product-${Date.now()}-${image.name}`);
                await image.mv(imagePath); // Move the image to the directory

            let imagespath = [`uploads/${path.basename(imagePath)}`]
        // Create the product object from request body
        const productData = {
            name: req.body.name,
            brand: req.body.brand,
            skuCode: req.body.skuCode,
            urlKey: req.body.urlKey,
            visibility: req.body.visibility === 'on', // Convert checkbox value to boolean
            productLabel: req.body.productLabel,
            size: req.body.size,
            productType: req.body.productType,
            group: req.body.group, // Optional, this can be empty
            unit: req.body.unit,
            serialNo: req.body.serialNo,
            description: req.body.description,
            metaDescription: {
                metaTitle: req.body.metaTitle,
                metaKeywords: req.body.metaKeywords ? req.body.metaKeywords.split(',') : [],
                metaDescription: req.body.metaDescription
            },
            price: {
                price: req.body.price,
                ourPrice: req.body.ourPrice,
                ourCutPrice: req.body.ourCutPrice,
                ourFullCutPrice: req.body.ourFullCutPrice
            },
            images: imagespath, // Store array of image URLs
            category: req.body.category,
            subCategory: req.body.subCategory,
            linkedProducts: {
                relatedProducts: req.body.linkedProducts_relatedProducts || [],
                productRequired: req.body.linkedProducts_productRequired || []
            }
        };

        // Save product to the database
        const newProduct = new product(productData);
        const savedProduct = await newProduct.save();

        // Return success response
        res.json({ success: true, message: 'Product added successfully!', data: savedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding product', error: error.message });
    }
});





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
