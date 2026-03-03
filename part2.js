const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeEvents() {
    try {
        const url = "https://denverpioneers.com"; // homepage

        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let scriptText = "";

        // Find the script containing "type":"events"
        $("script").each((i, el) => {
            const text = $(el).html();
            if (text && text.includes('"type":"events"')) {
                scriptText = text;
            }
        });

        if (!scriptText) {
            console.log("Events object not found.");
            return;
        }

        // Extract the JS object
        const match = scriptText.match(/var\s+obj\s*=\s*({[\s\S]*?});/);

        if (!match) {
            console.log("Could not extract object.");
            return;
        }

        const obj = JSON.parse(match[1]);

        const events = obj.data.map(item => ({
            duTeam: item.sport?.title || "Denver",
            opponent: item.opponent?.title || "TBD",
            date: item.date
        }));

        fs.writeFileSync("results/athletic_events.json", JSON.stringify({ events }, null, 2));

        console.log("Saved to athletic_events.json");

    } catch (err) {
        console.error("Error:", err.message);
    }
}

scrapeEvents();