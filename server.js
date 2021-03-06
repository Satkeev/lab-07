'use strict'

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const pg = require('pg');

require('dotenv').config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
const ERROR404 = 'The page does not exist.';

const sqlClient = new pg.Client(process.env.DATABASE_URL);
sqlClient.on('error', err => console.log(err));

app.get('/location', (request, response) => {
  let city = request.query.city;
  let sqlQuery = `SELECT search_query, formatted_query, latitude, longitude FROM cities WHERE search_query = $1;`;
  const safeValues = [city];

  sqlClient.query(sqlQuery, safeValues)
    .then(sqlResult => {
      console.log(sqlResult.rows);

      if (!sqlResult.search_query) {
        console.log('call superagent');
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
        superagent.get(url)
          .then(resultsFromSuperAgent => {
            let returnObj = new Location(city, resultsFromSuperAgent.body[0])
            let sqlQuery1 = `INSERT INTO cities (search_query, formatted_query, latitude,
              longitude) VALUES ($1, $2, $3, $4);`
            const safeValue = [city,
              returnObj.formatted_query,
              returnObj.latitude,
              returnObj.longitude];

            sqlClient.query(sqlQuery1, safeValue)
              .then(sqlResult => {
                console.log(sqlResult.rows)
              }).catch(err => console.log(err));

            response.status(200).send(returnObj);
            console.log(returnObj);
          }).catch(err => console.log(err));
      } else {
        console.log('send the sqlResult back to the client');
      }
    })
    .catch(err => console.log(err));
})

app.get('/weather', (request, response) => {
  let city = request.query.search_query;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}&days=8`;
  superagent.get(url)
    .then(resultsFromSuperAgent => {
      const weatherArray = resultsFromSuperAgent.body.data.map(day => {
        return new Weather(day);
      })
      response.status(200).send(weatherArray);
    }).catch(err => console.log(err))
})

app.get('/trails', (request, response) => {
  let {latitude, longitude} = request.query;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRIAL_API_KEY}`;
  
  superagent.get(url)
    .then(resultsFromSuperAgent => {
      const trailArr = resultsFromSuperAgent.body.trails.map(trail => {
        return new Trail(trail);
      })
      response.status(200).send(trailArr);
    }).catch(err => console.log(err));
})

function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.trail_url = obj.url;
  this.conditions = `${obj.conditionStatus} ${obj.conditionDetails}`;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_date = obj.conditionDate.slice(12, 19);
}

app.get('*', (request, response) => {
  response.status(404).send(ERROR404);
});

sqlClient.connect().then( () => {
  app.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`);
  })
})