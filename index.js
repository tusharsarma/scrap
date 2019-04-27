const rp = require('request-promise');
const cheerio = require('cheerio');
const Table = require('cli-table');
const fs = require('fs');
const path = require('path');
const os = require('os');


function scraping(options, filename) {
  const output = [];
  var oneFlightData = [];
  var tableHeader = [];
  var header;
  var flightInformation;

  rp(options)
    .then( $ => {
      
      $('div.x21n .x7b tr th.x7w').each((i, tableRow) => {
        header = $(tableRow).text();
        tableHeader.push(header);
      });
      output.push(tableHeader.join());

      let table = new Table({
        head: tableHeader,
        colWidths: [15, 15, 15, 10, 10, 15]
      })

      $('div.x21n .x7b tr').each((i, flightRow) => {
        oneFlightData = [];
        $(flightRow).find('.x7m').each((l, data) => {
          flightInformation = $(data).text();

          oneFlightData.push(flightInformation);
        });
        if (oneFlightData.length > 0) {
          table.push(oneFlightData);
          output.push(oneFlightData.join());
        }
      });
      console.log(table.toString());

      fs.writeFileSync(filename, output.join(os.EOL))
      console.log(filename, "  CREATED")
    }).catch(err =>
      console.log(err))

}


var departure = {
  url: `http://www.bengaluruairport.com/bial/faces/pages/flightInformation/departures.jspx`,
  transform: body => cheerio.load(body)
}

var arrival = {
  url: `http://www.bengaluruairport.com/flightInformation/arrivals.jspx`,
  transform: body => cheerio.load(body)
}

const fileArrival = path.join(__dirname, 'arrival.csv');
const fileDeparture = path.join(__dirname, 'departure.csv');
scraping(departure, fileDeparture);
scraping(arrival, fileArrival);
