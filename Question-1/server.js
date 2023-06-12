const express = require('express');
const axios = require('axios');
const moment = require('moment');

const app = express();
const port = 3000;


const ACCESS_CODE = 'nNPGsi';
let AUTH_TOKEN = '';


async function authenticate() {
  try {
    const response = await axios.post('https://api.johndoerailways.com/auth', {
      accessCode: nNPGsi,
    });
    AUTH_TOKEN = response.data.token;
    console.log('Authentication successful');
  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
}

// Fetch train data from John Doe Railways API
async function fetchTrainData() {
  try {
    const response = await axios.get(
      'https://api.johndoerailways.com/trains',
      {
        headers: {
          Authorization: Bearer ${AUTH_TOKEN},
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    return [];
  }
}

// Process and filter train data based on the given criteria
function processTrainData(trainData) {
  const currentTime = moment();
  const twelveHoursLater = moment().add(12, 'hours');

  const filteredTrains = trainData.filter((train) => {
    const departureTime = moment(train.departureTime);
    const timeDifference = departureTime.diff(currentTime, 'minutes');
    return timeDifference >= 30 && departureTime.isBefore(twelveHoursLater);
  });

  filteredTrains.sort((a, b) => {
    if (a.price === b.price) {
      if (a.tickets < b.tickets) return 1;
      if (a.tickets > b.tickets) return -1;
      return moment(b.departureTime).diff(moment(a.departureTime));
    }
    return a.price - b.price;
  });

  return filteredTrains;
}

// Route handler for '/trains' endpoint
app.get('/trains', async (req, res) => {
  const trainData = await fetchTrainData();
  const processedData = processTrainData(trainData);
  res.json(processedData);
});

// Initialize the server
app.listen(port, () => {
  console.log(Server is running on port ${port});
  authenticate();
});