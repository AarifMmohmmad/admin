const mongoose = require('mongoose');
const Model = require('../../models'),
  Service = require('../../service'),
  localization = require('../../service/localization'),
  jwt = require('jsonwebtoken');
const logger = require('../../service/logger');
const fs = require("fs")
const path = require("path")
// let arrayofcards = "";
let threecard = []

module.exports = {

  signup: async function (req, res, next) {
    try {
        const { email, password } = req.body;

        // Check parameters
        if (!email || !password  ) {
            return res
                .status(200)
                .json(Service.response(0, localization.missingParamError, null));
        }

        // Check if the user already exists
        let checkuser = await Model.User.findOne({ email });
        if (checkuser) {
            return res
                .status(200)
                .json(Service.response(0, localization.UserAlreadyExist, null));
        }

        // Create user and hash the password
        var user = new Model.User();
        const Token = user.generateJWT();
        user.email = email;
        user.username = "username";
        user.password = password;
        user.firstName = "username";
        user.numeric_id = Math.floor(Math.random() * 1000000000);
        user.token = [Token];
        await user.preparePassword(); // Ensure this is awaited for password hashing
        await user.save(); // Save the new user to the database

        return res
            .status(200)
            .json(Service.response(1, localization.signupSuccess, user));

    } catch (error) {
        console.log(error);
        return res.status(200).json(Service.response(0, localization.ServerError, null));
    }
  },

  login : async function (req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await Model.User.findOne({ email });
      if (!user) {
        return res
          .status(200)
          .json(Service.response(0, localization.usernotin, null));
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
      await user.save();

      let response =await user.toAuthJSON();
      response.token = newToken;
      return res
        .status(200)
        .json(Service.response(1, localization.loginSuccess, response));
    } catch (error) {
      // logger.info(error);
      console.log(error)
      return res.status(200).json(Service.response(0, localization.ServerError, null));
    }
  },


  sendotp : async function (req, res, next) {
    try {
      const { email  } = req.body;
      if(!email) {
        return res
          .status(200)
          .json(Service.response(0, localization.missingParamError, null));
      }
      const user = await Model.User.findOne({ email });
      if (!user) {
        return res
          .status(200)
          .json(Service.response(0, localization.usernotin, null));
      }
      let userOtp = await Model.UserOtp.findOne({
        "email": email,
      });

      var otpGenerate = await Service.generateOtp(params.mobile_no);
      if (!otpGenerate.status){
        return res
          .status(200)
          .json(Service.response(0, localization.otpGenerateError, null));
      }


      if (!userOtp) {
        userOtp = new Model.UserOtp({
          email: email,
        });
      }
      userOtp.otp.value = otpGenerate.otp;
      userOtp.otp.expired_at = new Date().getTime() + config.OPT_EXPIRED_IN_MINUTES * 60 * 1000;
      var usSave = await userOtp.save();

      return res
        .status(200)
        .json(Service.response(1, localization.otpSendSuccess, {
          otp: otpGenerate.otp, expired_at: userOtp.otp.expired_at
        }));

    } catch (error) {
      console.log(error)
      return res.status(200).json(Service.response(0, localization.ServerError, null));
    }
  },


  verify_otp: async function (req, res) {
    const { otp, token  } = params;


    if (!otp || !token ) {
      return res
        .status(200)
        .json(Service.response(0, localization.missingParamError, null));
    }

    let user = await Model.User.findOne({ token :{ $in: [token]} });
    if(!user) {
      return res
        .status(200)
        .json(Service.response(0, localization.usernotin, null));
    }
    let userotp = await Model.UserOtp.findOne({
      email: user.email,
    })

    // fs.appendFileSync(
    //   "log.txt",
    //   `\n${new Date()}  ${user.user_device.name} ${user._id} ${user.otp.value
    //   } ${params.otp}`
    // );

    if (userotp.otp.value != otp) {
      var message = "";
      var updateObj = {};
      // IF continuous_false_attempts count = 3
      if (user.otp.continuous_false_attempts == 3) {
        // IF false_attempts count == 50
        if (user.otp.send_attempts == config.otp_send_limit) {
          // ACCOUNT DEACTIVATE
          updateObj.is_active = false;
          // YOUR ACCOUNT IS DEACTIVATED DUE TO MANY FALSE ATTEMPTS
          message = localization.accountDeactivatedOtp;
        } else {
          // Generate & Send OTP Again
          var otpGenerate = await Service.generateOtp(user);
          if (!otpGenerate.status)
            return res
              .status(200)
              .json(Service.response(0, localization.otpGenerateError, null));
          //SEND MESSAGE OTP HERE
          Sms.sendOtp(
            user.mobile_no.number,
            user.user_device.name == "YU5530" ? "125458" : otpGenerate.otp
          )
            .then((d) => {
              logger.info("OPT Sent", d);
            })
            .catch((e) => {
              logger.info("OTP Send Error::", e);
            });
          updateObj["otp.value"] = otpGenerate.otp;
          updateObj["otp.expired_at"] =
            new Date().getTime() + config.OPT_EXPIRED_IN_MINUTES * 60 * 1000;
          updateObj["otp.send_attempts"] = user.otp.send_attempts + 1;
          updateObj["otp.continuous_false_attempts"] = 0;
          message = localization.falseOtpResent;
        }
      } else {
        // continuous_false_attempts count ++
        updateObj["otp.continuous_false_attempts"] =
          user.otp.continuous_false_attempts + 1;
        message = localization.otpValidationError;
      }
      let rez = await User.findByIdAndUpdate(user._id, {
        $set: updateObj,
      });
      if (rez) return res.status(200).json(Service.response(0, message, null));
      else
        return res
          .status(200)
          .json(Service.response(0, localization.ServerError, null));
    }
    if (user.otp.expired_at < new Date().getTime())
      return res
        .status(200)
        .json(Service.response(0, localization.otpExpired, null));
    user.otp_verified = true;
    user.otp.value = "";
    user.otp.expired_at = 0;
    var us_update = await user.updateOne({
      otp: {
        value: "",
        expired_at: 0,
      },
      otp_verified: true,
    });
    logger.info("USER", user);
    var userdata = _.pick(
      user,
      "name",
      "last_name",
      "username",
      "email",
      "profilepic",
      "avatar",
      "otp_verified",
      "numeric_id",
      "email_verified",
      "main_wallet",
      "win_wallet"
    );
    userdata.token = params.token;
    userdata.referral_code = user.referral.referral_code;
    userdata.mobileno = user.mobile_no.number;
    userdata.kyc_status = user.kyc_verified.status;
    userdata.kyc_reason =
      userdata.kyc_status == "rejected" ? user.kyc_verified.reason : "";
    var endTime = new Date();
    utility.logElapsedTime(req, startTime, endTime, "verify_otp");
    if (!us_update)
      return res
        .status(200)
        .json(Service.response(0, localization.ServerError, null));
    //respond with token
    return res
      .status(200)
      .json(Service.response(1, localization.loginSuccess, userdata));
  },



  users: async function (req, res, next) {
    try {
      let user =  await Model.User.find({});
      return res
        .status(200)
        .json(Service.response(1, localization.Success, user));
    } catch (err) {
      console.log(err)
      return res
        .status(200)
        .json(Service.response(0, localization.ServerError, null));
    }
  },
  
  forgatepassword: async function (req, res, next) {
    const { email } = req.body;
    const user = await Model.User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json(Service.response(0, localization.usernotin, null));
    }
    const token = user.generateJWT();
    return res
      .status(200)
      .json(Service.response(1, localization.success, token));
  },
}

