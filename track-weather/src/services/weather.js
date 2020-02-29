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
 
aws dynamodb query --table-name WeatherRec \
    --endpoint-url http://localhost:8000 \
    --key-condition-expression "Coord = :c" \
    --expression-attribute-values '{":c" : {"S": "35.0164;139.0077"}}' \
    --projection-expression "Coord, tDay, tNight, tMin"


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

    return new Promise((resolve, reject) => {
        // async call
        ddb.query(params, (err, data) => {
            
            if (err) {
                reject(err);
            } else {
                // console.log("Success", data.Items);
                resolve( 
                    data.Items
                    .filter(function(element){ 
                        return dates.includes( parseInt(element.Dt.N) ); 
                    })
                    .map(function(element, index, arr) {
                        return new dto.WeatherInfo(
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
                
                }) ) // close resolve
            }
        }) // close query
    }) // end Promise
}

module.exports = {

    // date is seconds from epoch time
    get_weather: async function (lat, lon, dates) {
        var w;
        try {
            w = await db_get_weather(lat, lon, dates)            
        } catch(err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2))
        }    
        if(w && w.length > 0) {
            return w
        } else {
            return undefined
        }
        
    }
}
