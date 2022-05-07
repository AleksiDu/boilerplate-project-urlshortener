//Import Libraries
//==================================//
require('dotenv').config(); // Loads environment variables from a .env files into process.env;
const express = require('express'); // Loads Express web framework for Node.js;
const cors = require('cors'); // CORS is a Node.js package for Express middleware that enables Cross-origin resource sharing(CORS);
const mongo = require('mongodb'); // MongoDB is a source-available cross-platform document-oriented database program;
const mongoose = require('mongoose'); // Mongoose is a JavaScript object-oriented programming library that creates a connection between MongoDB and the Express web application framework;
const bodyParser = require('body-parser'); // Node.js body parsing middleware/ Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const shortid = require('shortid'); // ShortId creates short non-sequential url-friendly unique ids;
const nanoid = require('mongoose-nanoid'); // Future update
const validUrl = require("valid-url"); // URI validation functions
const app = express(); //App

// Middleware function(s)
//==================================//
app.use(cors()); // Enable All CORS Requests;
app.use('/public', express.static(`${process.cwd()}/public`)); // Serving static  CSS files in Express;
app.use(bodyParser.urlencoded({ extended: false })); // Parse application/x-www-form-urlencoded;
app.use(bodyParser.json()); // Parse application/json;

// Basic Configuration
//==================================//
const port = process.env.PORT || 3000; //Prot variable declaration (For http://localhost:3000/);

mongoose.connect(process.env.MONGO_URI); // Data Base Connection;

// Data Base Connection Check
let databaseConCeck = mongoose.connection; //Listen for error events on the connection;
databaseConCeck.on('error', console.error.bind(console, 'connection error'));
databaseConCeck.once('open', () => {
  console.log("Connected");
});

// Express application
//==================================//
// Routes HTTP GET requests to the HTML callback functions
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// #3 URL Shortener Microservice
//==================================//
// Mongoose Model & Schema
const schema = new mongoose.Schema({
  original_url: String,
  short_url: String,
  suffix: String
});
const ShortURL = mongoose.model('ShortURL', schema);

// Gets a JSON response with original_url and short_url properties
app.post('/api/shorturl/', (req, res) => {
  let client_req_url = validUrl.isWebUri(req.body.url);
  if (client_req_url != undefined) {
    let suffix = shortid.generate();
    
    let newURL = new ShortURL({
      root_url: __dirname + "/api/shorturl/" + suffix,
      original_url: client_req_url,
      short_url: suffix
    });
    newURL.save((err, doc) => {
      if (err) return console.error(err);
      res.json({
        saved: true,
        short_url: newURL.short_url,
        original_url: newURL.original_url,
        root_url: newURL.root_url
      });
    });
  } else {
    res.json({"error":"invalid URL"});
  }
});

//Redirected to the original URL
app.get('/api/shorturl/:suffix', (req, res) => {
  let userGeneratedSuffix = req.params.suffix;
  ShortURL.find({ short_url: userGeneratedSuffix }).then((foundUrls) => {
    let urlForRederect = foundUrls[0];
    res.redirect(urlForRederect.original_url);
  });
});

// Connections on the host and port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});