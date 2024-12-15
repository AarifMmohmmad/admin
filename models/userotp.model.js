var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const config = require('../config');
var UserOtpModel = new Schema({
    // mobile_no: {
    //     country_code: {
    //         type: String
    //     },
    //     number: {
    //         type: String,
    //         trim: true
    //     }
    // },
    device_id: {
        type: String,
        trim: true
    },
    email : {
        type: String
    },
    otp: {
        value: {
            type: String
        },
        send_attempts: {
            type: Number,
            default: 0
        },
        continuous_false_attempts: {
            type: Number,
            default: 0
        },
        expired_at: {
            type: String
        }
    },
    otp_reset: {
        value: {
            type: String
        },
        expired_at: {
            type: String
        }
    },
    otp_verified: {
        type: Boolean,
        default: false
    },
});

var UserOtp = mongoose.model('UserOtp', UserOtpModel);

module.exports = UserOtp
