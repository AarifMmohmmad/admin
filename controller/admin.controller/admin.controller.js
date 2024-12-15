const Model = require('../../models');
const Service = require('../../service');
const localization = require('../../service/localization');
module.exports = {

    login: async function (req, res) {
      try {
        
        const {email , password } = req.body;
        console.log(email , password)
        if (!email ) {
          return res
            .status(200)
            .json(Service.response(0, localization.missingParamError, null));
        }

        var user = await Model.SuperAdmin.findOne({
           email: email, 
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
        console.log(req.admin)
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
        let findsuperuser = await Model.SuperAdmin.findOne({});
        if (!findsuperuser) {
          return Service.response(0, localization.invalidCredentials, null);
        }
        return Service.response(1, localization.loginSuccess, findsuperuser);
      } catch (error) {
        
      }
    } 
}

