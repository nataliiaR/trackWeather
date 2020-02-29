var services = require('./src/services/weather')
var express = require('express');

var PORT = process.env.PORT || 3000

var app = express();

app.get('/get-weather', function(req, res){ 
  // example: /get-weather?lat=XXX&lon=ZZZ&dates=[20200220,20200224]
  // only 4 symbols are important in coord decimal part, ie 35.0164
  
  // var r = services.get_weather(req.query.lat, req.query.lon, JSON.parse(req.query.dates)) 
  services
    .get_weather(req.query.lat, req.query.lon, JSON.parse(req.query.dates)) 
    .then(r => {
      if( r ) {
        console.log(r)
        res.status(200)
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(r))
      } else {
        res.status(404).send("Not found")
      }
    })
  

});

var server=app.listen(3000, () => {
  console.log(`Server is listening on port ${PORT}`);
})