var dto = require('../common/dto')

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000"

/*
on local,
  export AWS_REGION=us-west-2
  export AWS_ACCESS_KEY_ID=fakeMyKeyId
  export AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey
*/

console.log("Region: ", AWS.config.region);

/** 
aws dynamodb create-table \
 --endpoint-url http://localhost:8000 \
 --table-name WeatherRec \
 --attribute-definitions AttributeName=Coord,AttributeType=S AttributeName=Dt,AttributeType=N \
 --key-schema AttributeName=Coord,KeyType=HASH AttributeName=Dt,KeyType=RANGE \
 --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1

 aws dynamodb update-time-to-live \
    --endpoint-url http://localhost:8000 \
    --table-name WeatherRec \
    --time-to-live-specification Enabled=true,AttributeName=Ttl

 aws dynamodb delete-table --endpoint-url http://localhost:8000    --table-name WeatherRec

 aws dynamodb put-item \
    --endpoint-url http://localhost:8000 \
    --table-name WeatherRec \
    --item '{"Coord": {"S": "35.0164;139.0077"}, "Dt": {"N": "20200220"}, "tDay": {"N": "21"}}' 
 
*/

// Create DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', endpoint: DYNAMODB_ENDPOINT});

function db_get_weather(lat, lon, dates) {
    var params = {
        ExpressionAttributeValues: {
          ':c': {S: lat + ';' + lon}
        },
        KeyConditionExpression: 'Coord = :c',
        ProjectionExpression: 'Coord, Dt, tDay, tNight, tMin, tMax, Hum, Pres, Speed',
        TableName: 'WeatherRec'
      };
    console.log("look for "+lat + ';' + lon)  

    // async call
    ddb.query(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            //console.log("Success", data.Items);
            return data.Items
            .filter(function(element){ 
                return dates.includes( parseInt(element.Dt.N) ); 
            })
            .map(function(element) {
                new dto.WeatherInfo(
                    element.Coord.S,
                    element.Dt.N,
                    typeof element.tDay === 'undefined' ? '' : element.tDay.N,
                    typeof element.tNight === 'undefined' ? '' : element.tNight.N,
                    typeof element.tMin === 'undefined' ? '' : element.tMin.N,
                    typeof element.tMax === 'undefined' ? '' : element.tMax.N,
                    typeof element.Hum === 'undefined' ? '' : element.Hum.N,
                    typeof element.Pres === 'undefined' ? '' : element.Pres.N,
                    typeof element.Speed === 'undefined' ? '' : element.Speed.N
                ) 
        
            });
        }
    });  
}

module.exports = {

    // date is seconds from epoch time
    get_weather: function (lat, lon, dates) {
        var w = db_get_weather(lat, lon, dates)
        console.log(w.length)
        if(w && w.length > 0) {
            return w
        } else {
            return undefined
        }
        
    }
}
