// constants
const port = process.env.PORT || 80;

// modules
const express = require('express');
const session = require('express-session');
const mysqlsession = require('express-mysql-session')(session);
const mysql = require("./models/mysql");
const https = require('https');
const fs = require('fs');
const passport = require("./passport/setup");
const multer = require("multer");
var bodyParser = require('body-parser');

// routes
const app = express();

const api = require("./routes/api");
const apiCreate = require("./routes/create");
const apiUpdate = require("./routes/update");
const apiDelete = require("./routes/delete");

const pages = require("./routes/pages");

app.use(session({
  secret: 'classbot_secret',
  resave: false,
  saveUninitialized: false,
  store: new mysqlsession(mysql.options)
}));

app.use(passport.initialize());
app.use(passport.session());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.username + '.' + file.mimetype.split("/")[1])
  }
});


app.set('view engine', 'pug');

app.use(multer({storage: storage}).single("image"))
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
app.use(pages);
app.use(express.static('public'));
app.use("/api", api);
app.use("/api", apiCreate);
app.use("/api", apiUpdate);
app.use("/api", apiDelete);

app.listen(port);
var server = https.createServer({
  key: fs.readFileSync(__dirname + '/keys/selfsigned.key'),
  cert: fs.readFileSync(__dirname + '/keys/selfsigned.crt')
}, app);

server.listen(443, function() {
  console.log("Starting secure server on port 443");
});

module.exports = app;
