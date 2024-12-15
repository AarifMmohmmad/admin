const express = require("express");
const router = express.Router();
const UserController = require("../controller/api.controller/userController");


router.get("/", function (req, res, next) {
  return res.send("not found");
});

router.get("/users", function (req, res, next) {
  return UserController.users(req, res, next);
});

router.post("/signup", function (req, res, next) {
  return UserController.signup(req, res, next);
});

router.post("/login", function (req, res, next) {
  return UserController.login(req, res, next);
});


module.exports = router;
