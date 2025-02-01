const express = require('express');
const cors = require('cors');
const axios = require('axios'); // To make HTTP requests
const app = express();
const port = 5000;

app.use(cors()); // Allow CORS for all domains

// Proxy route that fetches data from the target URL
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = 'https://api.jsonserve.com/Uw5CrX'; // Your target URL
    const response = await axios.get(targetUrl);
    res.json(response.data); // Send the data back to the client
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get("/favicon.ico", (req, res) =>
    res.sendStatus(204)); // 204 means "No Content"


app.listen(5000, () => {
  console.log(`CORS proxy running on http://localhost:${5000}`);
});
