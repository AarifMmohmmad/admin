const dotenv = require('dotenv');
dotenv.config();

const config = function () {
    this.project_name = process.env.PROJECT_NAME;
    this.port = process.env.PORT;
    this.pre = process.env.PRE;
    this.tokensecret = "someRandomStringWhichIsSecretAndUnique&sdashjdbhbshdcas";
    this.otp_length = 6;
    switch (process.env.NODE_ENV) {
        case 'local':
            this.dbConnectionUrl = process.env.MONGO_LOCAL;
            break;
        case 'staging':
            this.dbConnectionUrl = process.env.MONGO_STAG;
            break;
        case 'production':
            this.dbConnectionUrl = process.env.MONGO_PROD;
            break;
        case 'development':
            this.dbConnectionUrl = process.env.MONGO_DEV;
            break;
        default:
            this.dbConnectionUrl = process.env.MONGO_LOCAL;
    }

    this.apiSecret = 'someRandomStringWhichIsSecretAndUnique&sdashjdbhbshdcas';
    this.payment_modes = { 'PA': 'PA', 'DEBIT_CARD': 'DEBIT_CARD', 'CREDIT_CARD': 'CREDIT_CARD', 'CREDIT_CARD_EMI': 'CREDIT_CARD_EMI', 'NET_BANKING': 'NET_BANKING', 'UPI': 'UPI', 'Paypal': 'Paypal', 'PhonePe': 'PhonePe', 'Paytm': 'Paytm', 'AmazonPay': 'AmazonPay', 'AIRTEL_MONEY': 'AIRTEL_MONEY', 'FreeCharge': 'FreeCharge', 'MobiKwik': 'MobiKwik', 'OLA': 'OLA', 'JioMoney': 'JioMoney', 'ZestMoney': 'ZestMoney', 'Instacred': 'Instacred', 'LazyPay': 'LazyPay', 'WALLET': 'WALLET', 'N/A': 'N/A' };


    this.ADMIN_ROLES = {
        DASHBOARD: 'DASHBOARD',
        USER_MANAGEMENT: 'USER_MANAGEMENT',
        ALL: 'ALL'
    };

    this.ADMIN_ACCESS = {
        NONAUTHORIZED_ONLY: ['/admin/login'],
        FREE_ROUTES: ['/admin/404', '/admin/401'],
        DASHBOARD: [
            '/',
            '/admin',
            'admin/profile',
            '/admin/logout',
            '/admin/adminpass',
            '/admin/genprofile'
        ],
        USER_MANAGEMENT: [
            '/',
            '/admin',
            'admin/profile',
            '/admin/logout',
            '/user',
            '/user/view',
            '/users_ajax',
            '/users/change_status',
            '/admin/users/change_status',
            '/admin/addmoney',
            '/admin/deductmoney',
            '/admin/users/changeuserpass',
            '/admin/adminpass',
            '/admin/genprofile',
            '/admin/users/manually_verify'
        ]
    };

    
}
module.exports = new config();
