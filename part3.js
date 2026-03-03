const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

let results = [];

axios.get('https://www.du.edu/calendar') // DU calendar page
  .then(response => {
    const $ = cheerio.load(response.data);

    $('.event-card').each((i, el) => {
      const title = $(el).find('h3').text().trim();
      const date = $(el).find('p').first().text().trim();

      // time (any <p> containing a colon)
      let time;
      $(el).find('p').each((_, p) => {
        const text = $(p).text().trim();
        if (text.includes(':')) {
          time = text;
        }
      });

      const eventObj = { title, date };
      if (time) eventObj.time = time;

      results.push(eventObj);
    });

    fs.writeFileSync('results/calendar_events.json', JSON.stringify({ events: results }, null, 2));
    console.log('Saved to results/calendar_events.json');
  })
  .catch(error => {
    console.error('Error fetching and parsing the page:', error.message);
  });