const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

let results = [];

axios.get('https://denverpioneers.com') // homepage
  .then(response => {
    const $ = cheerio.load(response.data);

    let scriptText = '';

    // Find the script containing "type":"events"
    $('script').each((i, el) => {
      const text = $(el).html();
      if (text && text.includes('"type":"events"')) {
        scriptText = text;
      }
    });

    if (!scriptText) {
      console.log('Events object not found.');
      return;
    }

    // Extract the JS object
    const match = scriptText.match(/var\s+obj\s*=\s*({[\s\S]*?});/);

    if (!match) {
      console.log('Could not extract object.');
      return;
    }

    const obj = JSON.parse(match[1]);

    obj.data.forEach(item => {
      results.push({
        duTeam: item.sport?.title || 'Denver',
        opponent: item.opponent?.title || 'TBD',
        date: item.date
      });
    });

    fs.writeFileSync('results/athletic_events.json', JSON.stringify({ events: results }, null, 2));
    console.log('Saved to athletic_events.json');

  })
  .catch(error => {
    console.error('Error fetching and parsing the page:', error.message);
  });