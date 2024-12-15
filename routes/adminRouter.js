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

router.get("/admin", AdminPagesController.dashboard);
router.get("/admin/dashboard", AdminPagesController.dashboard);
router.get("/admin/user", AdminPagesController.users);

module.exports = router;