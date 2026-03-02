const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let results = [];
axios.get('https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext')
    .then(response => {
        const $ = cheerio.load(response.data);
        // Extract data using jQuery-like selectors
        $('.courseblock').each((index, element) => {
            const fulltitle = $(element).find('.courseblocktitle').text().trim();
            const desc = $(element).find('.courseblockdesc').text().trim();
            const parts = fulltitle.split(' ');
            const coursePre = parts[0].split(/\s+/);
            // get the course and title
            const course = `${coursePre[0]}-${coursePre[1]}`;
            const title = parts.slice(1).join(' ').replace(/\(.*?\)/, '').trim();
            console.log(course, title);

            if (parseInt(coursePre[1]) >= 3000 && !desc.includes("Prerequisite") && coursePre[0]!="GAME") {
                // add to JSON file
                results.push({
                    course: course,
                    title: title
                });
            }
        })
        fs.writeFileSync(
            'results/bulletin.json',
            JSON.stringify({courses: results}, null, 2)
        );
    })
    .catch(error => {
        console.error('Error fetching and parsing the page:', error);
    });
