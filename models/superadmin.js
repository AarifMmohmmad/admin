'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  jwt = require('jsonwebtoken'),
  config = require('../config/index'),
  crypto = require('crypto');



/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
const validateLocalStrategyPassword = function (password) {
  return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
const UserSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: '',
    validate: [validateLocalStrategyPassword, 'Password should be longer']
  },
  status: {
    type: Boolean,
    default: false
  },
  token: [{
    type: String,
    default: '',
  }], 
  salt: {
    type: String
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  loginAllowed: {
    type: Number,
    default: 1
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: 'ALL'
  },
  numeric_id:{
    type: Number,
    default: null
  }
});

UserSchema.methods.preparePassword = function () {
    
  if (this.password ) { // && this.password.length > 5
    this.salt = crypto.randomBytes(32).toString('base64');
    this.password = this.hashPassword(this.password);
  }
};

UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
  } else {
    return password;
  }
};


/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = async function (password) {
  // console.log(this.password.toString(),this.hashPassword(password).toString())
  return this.password.toString() == this.hashPassword(password).toString();
};

UserSchema.methods.removeexpiretoken = async function (tokens) {

    const isTokenExpired = (token) => {
      const decodedToken = jwt.decode(token, { complete: true });
      if (decodedToken?.payload.exp) {
        const expirationTime = decodedToken.payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);
        return expirationTime < currentTime;
      }
      return true;
    };

    if (!Array.isArray(tokens)) {
      return [];
    }

    const validTokens = tokens.filter((token) => !isTokenExpired(token));
    return validTokens;
  };

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
  const _this = this;
  const possibleUsername = username + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function (err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * JWT Token Generator
 */
UserSchema.methods.generateJWT = function () {
  const rightNow = new Date();
  const exp = new Date(rightNow);
  // exp.setDate(rightNow.getDate() + 60);
  exp.setMinutes(rightNow.getMinutes() + 1) 
//   exp.setHours(rightNow.getHours() + 2)
  return jwt.sign({
    id: this._id,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000)
  }, "config.tokensecret");
};


UserSchema.methods.toAuthJSON = async function () {
    return {
        _id: this._id,
        numeric_id: this.numeric_id,
        displayName: this.displayName,
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        // token: newToken, // Return the latest token
        city: this.city,
        phone: this.phone,
        created: this.created,
        status: this.status,
        balance: this.balance,
    };
};





var User = mongoose.model('superadmin', UserSchema);
module.exports = User;