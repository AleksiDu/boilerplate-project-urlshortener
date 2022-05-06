require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const lookup = require('dns-lookup');
const validUrl = require("valid-url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
// Server conection 
mongoose.connect(process.env.MONGO_URI);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


// #3 URL Shortener Microservice
// Mongoose Model & Schema
const schema = new mongoose.Schema({
  short_url: String,
  original_url: String,
  suffix: String
});
const ShortURL = mongoose.model('ShortURL', schema);

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/api/shorturl/', (req, res) => {
  let client_req_url = validUrl.isWebUri(req.body.url);
  if (client_req_url != undefined) {
    let suffix = shortid.generate();
    let newShortURL = suffix;
    let newURL = new ShortURL({
      short_url: __dirname + "/api/shorturl/" + newShortURL,
      original_url: client_req_url,
      suffix: suffix
    });
    newURL.save((err, doc) => {
      if (err) return console.error(err);
      res.json({
        "saved": true,
        "short_url": newURL.short_url,
        "original_url": newURL.original_url,
        "suffix": newURL.suffix
      });
    });
  } else {
    res.json({"error":"invalid URL"});
  }
});

app.get('/api/shorturl/:short', (req, res) => {
  let userGeneratedSuffix = req.params.short;
  ShortURL.find({ short: userGeneratedSuffix }).then((foundUrls) => {
    let urlForRederect = foundUrls[0];
    res.redirect(urlForRederect.original_url);
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});