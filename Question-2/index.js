const express = require('express');
const request = require('request');

const app = express();
const port = 3000;
const TIMEOUT = 500; 

app.get('/interview/numbers', (req, res) => {
  const urls = req.query.url || [];
  const numbers = new Set();
  let remaining = urls.length;

 
  urls.forEach(url => {
    request({ url, json: true, timeout: TIMEOUT }, (err, response, body) => {
      if (err) {
        console.error(`Error retrieving data from ${url}:`, err);
      } else if (response.statusCode !== 200) {
        console.error(`Unexpected status code ${response.statusCode} when retrieving data from ${url}`);
      } else {
   
        const data = body.numbers || [];
        data.forEach(item => {
          const num = parseInt(item);
          if (!isNaN(num)) {
            numbers.add(num);
          }
        });
      }

      remaining--;
      if (remaining === 0) {

        res.json({ numbers: Array.from(numbers).sort((a, b) => a - b) });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Number management service listening at http://localhost:${port}`);
}); 