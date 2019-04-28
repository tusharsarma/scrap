const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const readline = require('readline');


function scraping(options, filename, website) {
  const output = [];
  var oneFlightData = [];
  var flightInformation;


  axios.get(options)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        const scrapDetails = website.toString() == "DEL" ? $('.flights_scroll_nou #flight_detail') : $('div.x21n .x7b tbody tr');
        scrapDetails.each((i, flightRow) => {
          oneFlightData = [];
          const inner = website.toString() == "DEL" ? 'div#flight_detail_junt div, div#flight_detail_junt2 div' : 'td,th';
          $(flightRow).find(inner).each((l, data) => {
            flightInformation = $(data).text().split('(')[0];

            oneFlightData.push(flightInformation);
          });
          if (oneFlightData.length > 0) {
            output.push(oneFlightData.join(','));
          }
        });


        fs.writeFileSync(filename, output.join(os.EOL));
        console.log(filename, "  CREATED");
      }
    }).catch(error => console.log(error));

}


const departure = `http://www.bengaluruairport.com/bial/faces/pages/flightInformation/departures.jspx`;

const arrival = `http://www.bengaluruairport.com/flightInformation/arrivals.jspx`;

const delhiURL = `https://www.delhiairport.com/igi-indira-gandhi-arrivals`;

const fileArrival = path.join(__dirname, 'arrival.csv');
const fileDeparture = path.join(__dirname, 'departure.csv');
const delhiData = path.join(__dirname, 'delhi.csv');


var standard_input = process.stdin;

standard_input.setEncoding('utf-8');
console.log('Please enter "BA" for BEN arrival data, "BD" for BEN Departure and "D" for Delhi data: ');

standard_input.on('data', function (data) {

  if (data.trim().toString().toUpperCase() == 'BA') {
    scraping(arrival, fileArrival, "BEN");
  } else if (data.trim().toString().toUpperCase() == 'BD') {

    scraping(departure, fileDeparture, "BEN");
  } else if (data.trim().toString().toUpperCase() == 'D') {

    scraping(delhiURL, delhiData, "DEL");
  } else {

    console.log('INVALID INPUT');
    process.exit();
  }
});
