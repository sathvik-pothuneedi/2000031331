const express = require('express');
const axios = require('axios');
const moment = require('moment');

const app = express();
const port = 3001;


const ACCESS_CODE = 'nNPGsi';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODY1NTQzMzUsImNvbXBhbnlOYW1lIjoiVHJhaW4gQ2VudHJhbCIsImNsaWVudElEIjoiMzFiNDRlMWUtOTM4Mi00ZjE3LWFmZWQtNDI3ZGVlNThjOGE1Iiwib3duZXJOYW1lIjoiIiwib3duZXJFbWFpbCI6IiIsInJvbGxObyI6IjIwMDAwMzEzMzEifQ.SY6Ih6ceuH3A-c5pyY-m6RTFqIQTOJVfpDRmKe1VsZM';


async function authenticate() {
  try {
    const response = await axios.post('http://104.211.219.98/train/auth', {
      accessCode: nNPGsi,
    });
    AUTH_TOKEN = response.data.token;
    console.log('Authentication successful');
  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
}


async function fetchTrainData() {
  try {
    const response = await axios.get(
      'http://104.211.219.98/train/trains',
      {
        headers: {
          Authorization: Bearer `${AUTH_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    return [];
  }
}


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


app.get('/trains', async (req, res) => {
  const trainData = await fetchTrainData();
  const processedData = processTrainData(trainData);
  res.json(processedData);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  authenticate();
});