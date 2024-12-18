const Model = require('../../models');
const Service = require('../../service');
const localization = require('../../service/localization');
const multer = require('multer');
const fs = require('fs');
const path = require('path')




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // The folder where files will be uploaded
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'category_image', maxCount: 1 },
  { name: 'banner_image', maxCount: 1 }
]);


module.exports = {

    login: async function (req, res) {
      try {
        
        const {email , password } = req.body;
        console.log(email , password,"password")
        if (!email ) {
          return res
            .status(200)
            .json(Service.response(0, localization.missingParamError, null));
        }

        var user = await Model.SuperAdmin.findOne({
          email:email
        });
          console.log(user,"user")
        if (!user){
          return res
          .status(200)
          .json(Service.response(0, localization.invalidCredentials, null));
        }
        let match = await user.authenticate(password);
        if (!match) { 
              return res
                .status(200)
                .json(Service.response(0, localization.incorrectPassword, null));
            }
        
            const newToken = user.generateJWT();
  
            let loginuserstoken =await user.removeexpiretoken(user.token);
            user.token = loginuserstoken;
      
            if (user.loginAllowed >= loginuserstoken.length ) {
              user.token.push(newToken);
            }else {
              user.token.shift();
              user.token.push(newToken);
            }
        req.session.auth = newToken;
        req.session.auth.max;
        Age = 36000000;
        var rez = await user.save();
        if (!rez)
          return res
            .status(200)
            .json(Service.response(0, localization.ServerError, null));
        // ADD ACCESS LOG
      //   var newLog = new AccessLog({
      //     admin: user._id,
      //     action: "Logged into Admin panel",
      //     created_at: new Date().getTime(),
      //   });
      //   await newLog.save();
        return res
          .status(200)
          .json(Service.response(1, localization.loginSuccess, newToken));
      } catch (error) {
        console.log(error)
        return res
        .status(200)
        .json(Service.response(0, localization.invalidCredentials, null));
      }
    },
    logout: async (req, res) => {
      try {
        if (req.admin) {
          if (Service.validateObjectId(req.admin._id)) {
            // var newLog = new AccessLog({
            //   admin: req.admin._id,
            //   action: "Logged out from Admin panel",
            //   created_at: new Date().getTime(),
            // });
            // await newLog.save();
          }
        }
        req.session.destroy((err) => {
          if (err) {
            console.log("Session destroy error:", err);
            return res.send(Service.response(0, localization.ServerError, err));
          }
         res.clearCookie('connect.sid'); // Assuming 'connect.sid' is the default cookie name
          return res.send(Service.response(1, localization.Success, null));
        });      
      } catch (err) {
        console.log("ERR", err);
        return res.send(Service.response(0, localization.ServerError, err));
      }
    },
    profile:  async (params) => {
      try {
        console.log(req.admin,"req.admin ")
        let findsuperuser = await Model.SuperAdmin.findOne({});
        if (!findsuperuser) {
          return Service.response(0, localization.invalidCredentials, null);
        }
        return Service.response(1, localization.loginSuccess, findsuperuser);
      } catch (error) {
        
      }
    } ,
    updateAdminProfilePass: async (req, res) => {
      // var params = _.pick(req.body, "opass", "pass_confirmation", "pass");


    var params = {opass, pass_confirmation, pass} = req.body
     try {
       //logger.info("Admin Profile Update Request", params);
       if (!params) {
         return res.send({
           status: 0,
           Msg: localization.allFiledError,
         });
       }
       if (!params.opass) {
         return res.send({
           status: 0,
           Msg: localization.allFiledError,
         });
       }
       if (!params.pass_confirmation) {
         return res.send({
           status: 0,
           Msg: localization.allFiledError,
         });
       }
       if (!params.pass) {
         return res.send({
           status: 0,
           Msg: localization.allFiledError,
         });
       }
       if (params.pass_confirmation != params.pass) {
         return res.send({
           status: 0,
           Msg: localization.passwordNotMatchError,
         });
       }
       if (
         params.pass_confirmation.trim().length < 6 ||
         params.pass_confirmation.trim().length > 12
       ) {
         return res.send({
           status: 0,
           Msg: localization.passwordValidationError,
         });
       }
         let user =await Model.SuperAdmin.findOne({_id:req.admin._id})
         let match = await user.authenticate(opass);
       if (!match) {
         return res.send({
           status: 0,
           Msg: "Invaild Old Password",
         });
       }
       user.password = pass
       await user.preparePassword(); // Ensure this is awaited for password hashing
       await user.save()
 
       if(user){
        return res
        .status(200)
        .json(Service.response(1, "Sucessfully update Password", user))
       }
     } catch (error) {
      console.log(error)
     }
    },

    categorylist: async (req, res) => {
      try {
          const searchTerm = req.query.name || ''; // सर्च के लिए नाम
          const start = parseInt(req.query.start) || 0; // पेजिनेशन के लिए शुरू
          const length = parseInt(req.query.length) || 10; // कितने रिकॉर्ड्स चाहिए
          const draw = parseInt(req.query.draw) || 1; // DataTable की draw property
  
          // MongoDB एग्रीगेशन पाइपलाइन
          const pipeline = [
              // सर्च लागू करें
              {
                  $match: searchTerm
                      ? { c_name: { $regex: searchTerm, $options: 'i' } }
                      : {},
              },
              // Products से जोड़ने के लिए id को string में बदलें
              {
                  $addFields: {
                      idAsString: { $toString: '$id' }, // Category id को string में बदलें
                  },
              },
              // Products से डेटा जोड़ें
              {
                  $lookup: {
                      from: 'products', // Products संग्रह का नाम
                      let: { catId: '$idAsString' }, // Category id पास करें
                      pipeline: [
                          {
                              $addFields: {
                                  categoryArray: { $split: ['$p_category', ','] }, // p_category को array में बदलें
                              },
                          },
                          {
                              $match: {
                                  $expr: { $in: ['$$catId', '$categoryArray'] }, // Category id से मैच करें
                              },
                          },
                      ],
                      as: 'products', // Output फ़ील्ड
                  },
              },
              // प्रोडक्ट की गिनती जोड़ें
              {
                  $addFields: {
                      numberOfProduct: { $size: '$products' },
                  },
              },
              // केवल आवश्यक फ़ील्ड रखें
              {
                  $project: {
                      id: 1,
                      c_name: 1,
                      c_position: 1,
                      isActive: 1,
                      discount_line: 1,
                      numberOfProduct: 1, // डायनामिक प्रोडक्ट गिनती
                  },
              },
              // पेजिनेशन लागू करें
              { $skip: start },
              { $limit: length },
          ];
  
          // एग्रीगेशन रन करें
          const data = await Model.Category.aggregate(pipeline);
  
          // कुल रिकॉर्ड्स और फ़िल्टर किए गए रिकॉर्ड्स की गिनती
          const recordsTotal = await Model.Category.countDocuments();
          const recordsFiltered = searchTerm
              ? await Model.Category.countDocuments({
                    c_name: { $regex: searchTerm, $options: 'i' },
                })
              : recordsTotal;
  
          // डेटा फॉर्मेट करें
          const formattedData = data.map(item => ({
              id: item.id,
              name: item.c_name,
              position: item.c_position || 'N/A',
              status: item.isActive ? 'Active' : 'Inactive',
              numberOfProduct: item.numberOfProduct || 0, // डायनामिक प्रोडक्ट गिनती
              action: `<button>Edit</button><button>Delete</button>`, // Action बटन
          }));
  
          // DataTable के लिए JSON रिस्पॉन्स
          res.json({
              draw: draw,
              recordsTotal: recordsTotal, // कुल रिकॉर्ड्स
              recordsFiltered: recordsFiltered, // फ़िल्टर किए गए रिकॉर्ड्स
              data: formattedData, // पेजिनेटेड डेटा
          });
      } catch (error) {
          console.error('Error fetching category list:', error);
          res.status(500).json({ message: 'Internal Server Error' });
      }
  },
  
  
  createCategory : async (req, res) => {
    try {
        // Use multer to handle file upload

          console.log("yes this call ")

        const uploadDir = path.join(__dirname, '../uploads/');

        // Make sure the upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    
        // Create variables to store image paths
        let category_image = '';
        let banner_image = '';
    
        // Set up buffers for receiving file data
        let categoryImageBuffer = Buffer.alloc(0);
        let bannerImageBuffer = Buffer.alloc(0);
    
        // Check for file streams in the request
        req.on('data', (chunk) => {
            if (req.headers['content-type'].includes('multipart/form-data')) {
                // Handling multipart form data, extracting files and fields
    
                // Read file chunks and assign them to buffers
                if (req.headers['content-type'].includes('category_image')) {
                    categoryImageBuffer = Buffer.concat([categoryImageBuffer, chunk]);
                } else if (req.headers['content-type'].includes('banner_image')) {
                    bannerImageBuffer = Buffer.concat([bannerImageBuffer, chunk]);
                }
            }
        });
    
        req.on('end', async () => {
            try {
                const { name, position, discount_line, status, category_status, description, label, banner, seo } = req.body;
    
                // Check if category already exists
                const alreadyfind = await Model.Category.findOne({ name });
                if (alreadyfind) {
                    return res.status(200).json(Service.response(false, "Category already found", null));
                }
    
                // Define file paths to save the images
                if (categoryImageBuffer.length > 0) {
                    category_image = path.join(uploadDir, `${Date.now()}-category_image.jpg`);
                    fs.writeFileSync(category_image, categoryImageBuffer);
                }
    
                if (bannerImageBuffer.length > 0) {
                    banner_image = path.join(uploadDir, `${Date.now()}-banner_image.jpg`);
                    fs.writeFileSync(banner_image, bannerImageBuffer);
                }
    
                // Create a new category instance
                const newCategory = new Model.Category({
                    name,
                    position,
                    discount_line,
                    status,
                    category_status,
                    description,
                    label,
                    banner,
                    seo,
                    category_image, // Path to uploaded category image
                    banner_image,   // Path to uploaded banner image
                });
    
                // Save the category to the database
                await newCategory.save();
    
                return res.status(200).json(Service.response(true, "Category created successfully", newCategory));
            } catch (error) {
                console.error(error);
                return res.status(500).json(Service.response(false, localization.ServerError, null));
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(Service.response(false, localization.ServerError, null));
    }
},


subcategorylist: async (req, res) => {
  const searchTerm = req.query.name || ''; // नाम सर्च करने के लिए
  const start = parseInt(req.query.start) || 0; // Pagination के लिए शुरू
  const length = parseInt(req.query.length) || 10; // कितने रिकॉर्ड्स चाहिए
  const draw = parseInt(req.query.draw) || 1; // DataTable की draw property

  try {
    // Aggregation पाइपलाइन
    const pipeline = [
      // सर्च लागू करें
      {
        $match: searchTerm
          ? { sc_name: { $regex: searchTerm, $options: 'i' } }
          : {},
      },
      {
        $addFields: {
          idAsString: { $toString: '$id' }, // SubCategory id को string में बदलें
        },
      },
      // Parent category से डेटा जोड़ें
      {

        $lookup: {
          from: 'categories', // Parent category संग्रह का नाम
          localField: 'parent_category', // SubCategory का फ़ील्ड
          foreignField: 'id', // Category का फ़ील्ड
          as: 'parentCategory', // Output फ़ील्ड
        },
      },
      // Parent category का पहला एलिमेंट निकालें
      {
        $unwind: {
          path: '$parentCategory',
          preserveNullAndEmptyArrays: true, // अगर parent category नहीं मिले तो null रखें
        },
      },
      // SubCategory को Products से जोड़ने के लिए `id` को string में बदलें
      {
        $addFields: {
          idAsString: { $toString: '$id' }, // SubCategory id को string में बदलें
        },
      },
      // Products से डेटा जोड़ें
      {
        $lookup: {
          from: 'products', // Products संग्रह का नाम
          let: { subCatId: '$idAsString' }, // SubCategory id पास करें
          pipeline: [
            {
              $addFields: {
                subcategoryArray: { $split: ['$p_subcategory', ','] }, // p_subcategory को array में बदलें
              },
            },
            {
              $match: {
                $expr: { $in: ['$$subCatId', '$subcategoryArray'] }, // मैच करें
              },
            },
          ],
          as: 'products', // Output फ़ील्ड
        },
      },
      // प्रोडक्ट की गिनती जोड़ें
      {
        $addFields: {
          numberOfProduct: { $size: '$products' },
        },
      },
      // केवल आवश्यक फ़ील्ड रखें
      {
        $project: {
          id: 1,
          sc_name: 1,
          parent_cate_name: '$parentCategory.c_name',
          isActive: 1,
          discount_line: 1,
          numberOfProduct: 1, // डायनामिक प्रोडक्ट गिनती
        },
      },
      // पेजिनेशन लागू करें
      { $skip: start },
      { $limit: length },
    ];

    // Aggregation रन करें
    const data = await Model.SubCategory.aggregate(pipeline);

    // कुल रिकॉर्ड्स और फ़िल्टर किए गए रिकॉर्ड्स की गिनती
    const recordsTotal = await Model.SubCategory.countDocuments();
    const recordsFiltered = searchTerm
      ? await Model.SubCategory.countDocuments({
          sc_name: { $regex: searchTerm, $options: 'i' },
        })
      : recordsTotal;

    // डेटा फॉर्मेट करें
    const formattedData = data.map(item => ({
      id: item.id,
      name: item.sc_name,
      parent_cate: item.parent_cate_name || 'N/A', // Parent category का नाम
      status: item.isActive ? 'Active' : 'Inactive',
      numberOfProduct: item.numberOfProduct || 0, // डायनामिक प्रोडक्ट गिनती
      action: `<button>Edit</button><button>Delete</button>`, // Action बटन
    }));

    // Response to DataTable
    res.json({
      draw: draw,
      recordsTotal: recordsTotal,
      recordsFiltered: recordsFiltered,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
},




subcreateCategory : async (req, res) => {
try {
    // Use multer to handle file upload
    const uploadDir = path.join(__dirname, '../uploads/');

    // Make sure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create variables to store image paths
    let category_image = '';
    let banner_image = '';

    // Set up buffers for receiving file data
    let categoryImageBuffer = Buffer.alloc(0);
    let bannerImageBuffer = Buffer.alloc(0);

    // Check for file streams in the request
    req.on('data', (chunk) => {
        if (req.headers['content-type'].includes('multipart/form-data')) {
            // Handling multipart form data, extracting files and fields

            // Read file chunks and assign them to buffers
            if (req.headers['content-type'].includes('category_image')) {
                categoryImageBuffer = Buffer.concat([categoryImageBuffer, chunk]);
            } else if (req.headers['content-type'].includes('banner_image')) {
                bannerImageBuffer = Buffer.concat([bannerImageBuffer, chunk]);
            }
        }
    });

    req.on('end', async () => {
        try {
            const { name, position, discount_line, status, category_status, description, label, banner, seo } = req.body;

            // Check if category already exists
            const alreadyfind = await Model.Category.findOne({ name });
            if (alreadyfind) {
                return res.status(200).json(Service.response(false, "Category already found", null));
            }

            // Define file paths to save the images
            if (categoryImageBuffer.length > 0) {
                category_image = path.join(uploadDir, `${Date.now()}-category_image.jpg`);
                fs.writeFileSync(category_image, categoryImageBuffer);
            }

            if (bannerImageBuffer.length > 0) {
                banner_image = path.join(uploadDir, `${Date.now()}-banner_image.jpg`);
                fs.writeFileSync(banner_image, bannerImageBuffer);
            }

            // Create a new category instance
            const newCategory = new Model.Category({
                name,
                position,
                discount_line,
                status,
                category_status,
                description,
                label,
                banner,
                seo,
                category_image, // Path to uploaded category image
                banner_image,   // Path to uploaded banner image
            });

            // Save the category to the database
            await newCategory.save();

            return res.status(200).json(Service.response(true, "Category created successfully", newCategory));
        } catch (error) {
            console.error(error);
            return res.status(500).json(Service.response(false, localization.ServerError, null));
        }
    });
} catch (error) {
    console.error(error);
    return res.status(500).json(Service.response(false, localization.ServerError, null));
}
},


productlist: async (req, res) => {
  try {
    const searchTerm = req.query.name || ''; // सर्च टर्म
    const start = parseInt(req.query.start) || 0; // Pagination शुरू
    const length = parseInt(req.query.length) || 10; // कितने रिकॉर्ड्स चाहिए
    const draw = parseInt(req.query.draw) || 1; // DataTable का draw प्रॉपर्टी

    // सर्च फिल्टर लागू करें
    const query = searchTerm
      ? { p_name: { $regex: searchTerm, $options: 'i' } }
      : {};

    // कुल रिकॉर्ड्स की गिनती
    const recordsTotal = await Model.Product.countDocuments();
    // फ़िल्टर किए गए रिकॉर्ड्स की गिनती
    const recordsFiltered = await Model.Product.countDocuments(query);

    // पेजिनेशन और सॉर्टिंग के साथ डेटा फ़ेच करें
    const data = await Model.Product.find(query)
      .skip(start)
      .limit(length)
      .lean();
    console.log(data)
    // डेटा को फॉर्मेट करें
    const formattedData = data.map(item => ({
      id: item.id,
      sku: item.sku_code,
      name: item.p_name,
      status: item.status ? 'Active' : 'Inactive',
      slprice: item.p_our_price,
      price: item.p_price,
      quantity: item.stock,
      action: `
        <button class="btn btn-primary btn-edit" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger btn-delete" data-id="${item.id}">Delete</button>
      `
    }));

    // Response
    res.json({
      draw: draw,
      recordsTotal: recordsTotal,
      recordsFiltered: recordsFiltered,
      data: formattedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
},
subcreateproduct : async (req, res) => {
try {
    // Use multer to handle file upload
    const uploadDir = path.join(__dirname, '../uploads/');

    // Make sure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create variables to store image paths
    let category_image = '';
    let banner_image = '';

    // Set up buffers for receiving file data
    let categoryImageBuffer = Buffer.alloc(0);
    let bannerImageBuffer = Buffer.alloc(0);

    // Check for file streams in the request
    req.on('data', (chunk) => {
        if (req.headers['content-type'].includes('multipart/form-data')) {
            // Handling multipart form data, extracting files and fields

            // Read file chunks and assign them to buffers
            if (req.headers['content-type'].includes('category_image')) {
                categoryImageBuffer = Buffer.concat([categoryImageBuffer, chunk]);
            } else if (req.headers['content-type'].includes('banner_image')) {
                bannerImageBuffer = Buffer.concat([bannerImageBuffer, chunk]);
            }
        }
    });

    req.on('end', async () => {
        try {
            const { name, position, discount_line, status, category_status, description, label, banner, seo } = req.body;

            // Check if category already exists
            const alreadyfind = await Model.Category.findOne({ name });
            if (alreadyfind) {
                return res.status(200).json(Service.response(false, "Category already found", null));
            }

            // Define file paths to save the images
            if (categoryImageBuffer.length > 0) {
                category_image = path.join(uploadDir, `${Date.now()}-category_image.jpg`);
                fs.writeFileSync(category_image, categoryImageBuffer);
            }

            if (bannerImageBuffer.length > 0) {
                banner_image = path.join(uploadDir, `${Date.now()}-banner_image.jpg`);
                fs.writeFileSync(banner_image, bannerImageBuffer);
            }

            // Create a new category instance
            const newCategory = new Model.Category({
                name,
                position,
                discount_line,
                status,
                category_status,
                description,
                label,
                banner,
                seo,
                category_image, // Path to uploaded category image
                banner_image,   // Path to uploaded banner image
            });

            // Save the category to the database
            await newCategory.save();

            return res.status(200).json(Service.response(true, "Category created successfully", newCategory));
        } catch (error) {
            console.error(error);
            return res.status(500).json(Service.response(false, localization.ServerError, null));
        }
    });
} catch (error) {
    console.error(error);
    return res.status(500).json(Service.response(false, localization.ServerError, null));
}
},
}

