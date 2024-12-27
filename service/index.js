var jwt = require('jsonwebtoken');
const config = require("../config/index");
const Model = require('../models')
// const logger = require('../service/logger');
var randomString = require("random-string");
const fs = require("fs")
const localization = require('../service/localization');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    response: function (status, message, data) {
        return {
          status: status,
          message: message,
          data: data,
        };
      },
    issueToken: function (data) {
        return jwt.sign(data, config.apiSecret);
      },

    authenticate: async function (req, res, next) {
        var token = req.body.token;
        
        if(!token){
          return res.status(400).json({
            status: 3,
            message: "please provide a token",
            data: null,
          });
        }
        if (token) {
          us = await Model.User.findOne({
            "tokens.token": token,
          });
          if (us) {
            if (!us.is_active) {
              return res.status(200).json({
                status: 3,
                message: localization.accountDeactivated,
                data: null,
              });
            }
    
            if (us.is_deleted) {
              return res.status(200).json({
                status: 3,
                message: localization.accountDeleted,
                data: null,
              });
            }
    
            req.user = us;
            next();
          } else
            return res.status(200).json({
              status: 3,
              message: localization.tokenExpired,
              data: null,
            });
        } else {
          return res.status(200).json({
            status: 3,
            message: localization.tokenExpired,
            data: null,
          });
        }
      },

    // Define a middleware function to validate the API key
    validateAPIKey: async function (req, res, next) {
      var app_version = req.headers['app_version'];
      var app_version_code = req.headers['app_version_code'];
      const apiKey = req.headers['api_key'];
      // Check if the API key is present and correct
      if ((apiKey !== process.env.API_KEY) || (!process.env.APP_VERSION_CODE.includes(app_version_code))) {
        // If the API key is missing or incorrect, return an error response
        return res.status(400).json({status: 3, message: "Unauthorized: Invalid API key", data: null });
      }
      next();
    },
    
      generatreffercode: async function (req, res, next) {
        let alphaPart = await randomString({
          length: 4,
          numeric: false,
          letters: true,
          special: false,
        });
      
        // Convert alphabetic part to uppercase
        alphaPart = alphaPart.toUpperCase();
      
        let numericPart = await randomString({
          length: 4,
          numeric: true,
          letters: false,
          special: false,
        });
      
        let referralCode = alphaPart + numericPart;
      
        while (true) {
          let refUser = await Model.User.findOne({
            referral_code: referralCode,
          });
      
          if (refUser) {
            alphaPart = await randomString({
              length: 4,
              numeric: false,
              letters: true,
              special: false,
            });
      
            // Convert alphabetic part to uppercase
            alphaPart = alphaPart.toUpperCase();
      
            numericPart = await randomString({
              length: 4,
              numeric: true,
              letters: false,
              special: false,
            });
      
            referralCode = alphaPart + numericPart;
          } else {
            break;
          }
        }
      
        return referralCode;
      },
      
      

    uploadFile: function (file, types) {
      return new Promise((resolve, reject) => {
 
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(file.name)[1];
        if (ext == "undefined") {
          return resolve(false);
        }
        if (types) {
          if (types.indexOf(ext) == -1) {
            return resolve(false);
          }
        }
 
        let zzz =
          "/files/" +
          new Date().getTime() +
          Math.round(Math.pow(36, 10 + 1) - Math.random() * Math.pow(36, 10))
            .toString(36)
            .slice(1);
        let newFileName = zzz + "." + ext;
        file.mv("./public" + newFileName, function (err) {
          if (err) {
            return resolve(false);
          }
          return resolve("./public" + newFileName);
        });
      });
    },


    useramount : function (cn1,cn2,cn3,ct1,ct2,ct3){
        if(cn1==1&&cn2==1&&cn3==1 ){
          return amount = 80000000
        }
        if(cn1==cn2 && cn2==cn3 && cn3==cn1){
          return amount = 3200000
        }
        // cn1= cn1==1?14:cn1;
        // cn2= cn2==1?14:cn2;
        // cn3= cn3==1?14:cn3;

        // let squence = [cn1,cn2,cn3]
        // squence.sort((a,b)=>a-b)

        
        function isSequence(numbers) {
          numbers.sort((a, b) => a - b);
          for (let i = 0; i < numbers.length - 1; i++) {
              if (numbers[i + 1] - numbers[i] !== 1) {
                return false;
              }
          }
          return true; 
      }
      const cards = [cn1,cn2, cn3]; 
      let  sequence = isSequence(cards)
      // console.log(sequence, cn1,cn2,cn3,ct1,ct2,ct3)

        // if(squence[0]== (squence[1]+1) && squence[0]== (squence[1]+2) && ct1==ct2 && ct2==ct3 && ct3==ct1){
        //   return amount = 3200000
        // }

        if(sequence && ct1==ct2 && ct2==ct3){
          return amount = 3200000
        }
        // if(squence[0]== (squence[1]+1) && squence[0]== (squence[1]+2) ){
        //   return  amount = 200000
        // }
        if(sequence){
          return amount = 200000
        }      

        if(ct1==ct2 && ct2==ct3 && ct3==ct1){
          return  amount = 125000
        }
        
        if(cn1==cn2 || cn2==cn3 || cn3==cn1){
          return  amount = 40000
        }
        return amount = 8800
    },

    generateOtp: async function (user) {
      return {
        status: true,
        otp: await this.randomNumber(config.otp_length),
        message: "OTP Generate Success",
      };
    },
    
    randomNumber: async function (length) {
      return Math.floor(
        Math.pow(10, length - 1) +
        Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
      );
    },

    authenticateAdmin: async function(req, res, next) {

      var path = req.path;
      var params = Object.values(req.params || {});
      for (var str of params) {
          path = path.split('/' + str).join('');
          // console.log('PATH PAT', path);
      }
      // console.log('PATH', path);


      if (config.ADMIN_ACCESS.FREE_ROUTES.indexOf(path) > -1) {
          return next();
      }
      else {
          var token = req.session ? (req.session.auth ? req.session.auth : false) : false;
          if (token) {
              us = await Model.SuperAdmin.findOne({
                  token : token
              });
              if (us) {
                  if (us.is_active && !us.is_deleted) {
                      if (config.ADMIN_ACCESS.NONAUTHORIZED_ONLY.indexOf(path) > -1){
                          // console.log("ha")


                          return req.method != 'GET'
                              ? res.send({
                                    status: 0,
                                    message: 'Unauthorized access denied',
                                    data: null
                                })
                              : res.redirect('/');
                          }
                      else if (
                          us.role === config.ADMIN_ROLES.ALL ||
                          config.ADMIN_ACCESS[us.role].indexOf(path) > -1
                      ) {
                          req.admin = us;
                          return next();
                      }
                      else
                          return req.method != 'GET'
                              ? res.send({
                                    status: 0,
                                    message: 'Unauthorized access denied',
                                    data: null
                                })
                              : res.redirect('/admin/401');
                  }
              }
          }
          if (config.ADMIN_ACCESS.NONAUTHORIZED_ONLY.indexOf(path) > -1)
              return next();
          else{
              return req.method != 'GET'
                  ? res.send({
                        status: 0,
                        message: 'Unauthorized access denied',
                        data: null
                    })
                  : res.redirect('/admin/login');}
      }

  },
    validateObjectId: function(id) {
      if (ObjectId.isValid(id)) {
          var obj = new ObjectId(id);
          if (obj == id) {
              return true;
          }
      }
      return false;
  },
}