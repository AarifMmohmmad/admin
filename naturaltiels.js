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



//loges request
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
// var privateKey = fs.readFileSync('ssl.key', 'utf8');
// var certificate = fs.readFileSync('ssl.cert', 'utf8');
// var bundle = fs.readFileSync('ssl.ca', 'utf8');
// var server = https.createServer({
//     key: privateKey,
//     cert: certificate,
//     ca: bundle
//   }, app);
// app.use(session({
//     secret: 'your_secret_key', // Change this to your secret key
//     resave: false,
//     saveUninitialized: true
// }));


// app.use('/app', express.static(path.join(__dirname, 'public', 'app')));
// app.use(express.static(path.join(__dirname, 'public')));

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





// const isAuthenticated = (req, res, next) => {
//     if (req.session && req.session.loggedIn) {
//         next(); 
//     } else {
//         res.redirect('/login');
//     }
// };


const apiRouter = require('./routes/apiRouter');
const adminRouter = require('./routes/adminRouter');


// Middleware for authentication (admin routes)
// app.use((req, res, next) => {
//     if (!req.path.startsWith('/api')) {
//         console.log("Admin middleware",req.path);
//         service.authenticateAdmin(req,res,next)
//     } else {
//         next();
//     }
// });
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
process.on('unhandledRejection', function(err) {
    console.log("ERR",err);
});

/**
 *	Server bootup section
 **/ 
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
