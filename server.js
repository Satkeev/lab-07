'use strict';
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');

app.get('/location', (request, response) => {
  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
  
  superagent.get(url)
    .then(resultsFromSuperAgent => {
      let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
      response.status(200).send(finalObj);
    })
  })

app.get('/weather', (request, response) => {
    let search_query = request.query.search_query;
    console.log('stuff I got from the front end on the weather route', search_query);
  
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${process.env.WEATHER_API_KEY}&days=8`;
  
    superagent.get(url)
      .then(resultsFromSuperAgent => {
      let weatherResult = resultsFromSuperAgent.body.data.map(day => {
      return new Weather(day); 
      }) 
      response.status(200).send(weatherResult);
      }).catch(err => console.log(err));
})

app.get('/trail', (request, response) => {
  const { latitude, longitude } = request.query;
  const key = process.env.TRIAL_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key}`;
  
  superagent.get(url)
  .then(resultsFromSuperAgent => {
    const data = resultsFromSuperAgent.body.trails;
    const results = data.map(item => new Trail(item));
    console.log(results);
    response.status(200).send(rsults);
  })
})

function Trail(searchQuery, obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate;
  this.condition_time = obj.conditionDate;
}

const PORT = process.env.PORT || 3001;

function Weather(obj){
    this.forecast = obj.weather.description;
    this.time = obj.valid_date;
}
   
function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})





// 'use strict';

// const express = require('express');
// const cors = require('cors');
// const superagent = require('superagent');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors());

// app.get('/location', (request, response) => {
//   let city = request.query.city;

//   let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

//   superagent.get(url)
//     .then(resultsFromSuperAgent => {
//       let finalObj = new Location(city, resultsFromSuperAgent.body[0]);

//       response.status(200).send(finalObj);
//     })


//   // go to the web and get real information using superagent
//   // run that information through the constructor
//   // send it to the front end
// })

// app.get('/weather', (request, response) => {
//   let search_query = request.query.search_query;
//   console.log('stuff I got from the front end on the weather route', search_query);

//   let url = `https://api.weatherbit.io/v2.0/current?city=${search_query}&key=${process.env.WEATHER_API_KEY}`;

//   superagent.get(url)
//     .then(resultsFromSuperAgent => {
//       console.log(resultsFromSuperAgent.body);
//     }).catch(err => console.log(err));
// })

// function Location(searchQuery, obj){
//   this.search_query = searchQuery;
//   this.formatted_query = obj.display_name;
//   this.latitude = this.lat;
//   this.longitude = this.lon;
// }

// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`);
// })