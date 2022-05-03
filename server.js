require('dotenv').config();
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

//Database Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  userNewUrlParser: true,
  userUndifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // Timeout afer 10 s instead of 30s
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// #3 URL Shortener Microservice
// const Schema = mongoose.Schema;
app.get('/api/shorturl', (req, res) => {
  var original_url = req.originalUrl;
  console.log(original_url);
  res.json({ 
    original_url: original_url }); 
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

