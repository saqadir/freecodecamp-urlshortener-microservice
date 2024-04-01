require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns'); 
const urlLib = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// this solution does not store short URLs on disk or db
const urlMap = new Map();
var count = 1;

const options = { 
  all:true, 
}; 

app.post('/api/shorturl', (req, res) => {
  console.log(JSON.stringify(req.body));
  const url = req.body.url;
  const hostname = urlLib.parse(url).hostname;

  dns.lookup(hostname, options, (err, address, family) => {
    if (err || !hostname) {
      res.json({ "error": "Invalid URL" });
    } else {
      urlMap.set(count, url);
      count++;
      res.json({ "original_url" : url, "short_url" : count - 1})
    }
  });
});

app.get('/api/shorturl/:num', (req, res) => {
  const num = Number(req.params.num);

  if (!isNaN(num)) {
    if (urlMap.has(num)) {
      res.redirect(urlMap.get(num));
    } else {
      res.json({ "error": "No short URL found for the given input" });
    }
  } else {
    res.json({ "error": "Wrong format" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
