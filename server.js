require('dotenv').config();
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;


//Database Connection

const uri = process.env.MONGO_URI;
mongoose.connect(uri);

// Basic Configuration

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
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const URL = mongoose.model("URL", urlSchema);

app.post('/api/shorturl/new',  async (req, res) => {
  let url = req.body.url_input;
  let urlCode = shortId.generate();

  //If url is valid
  if (!validUrl.isWebUri(url)) {
    res.status(401).json({
      error: 'invalid URL'
    });
  } else {
    try {
      //If its already in the database
      let findOne = await URL.findOne({
        original_url: url
      });
      if (findOne) {
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        });
      } else {
        // if its not exist yet then create new one and response with the result
        findOne = new URL({
          original_url: url,
          short_url: urlCode
        });
        await findOne.save()
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        });
      };
      } catch (err) {
        console.error(err);
        res.status(500).json('Server erorr...');
    }
  }
});

app.get('/api/shorturl/:short_url?', async (req,res) => {
  try {
    let urlParams = await URL.findOne({
      short_url: req.params.short_url
    });
    if (urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json('Server error')
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

