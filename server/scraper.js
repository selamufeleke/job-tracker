const cheerio = require("cheerio");
const pool = require("./db");

async function scrapeFreelanceEthio() {
  try {
    const response = await fetch("https://t.me/s/freelance_ethio");
    const html = await response.text();
    const $ = cheerio.load(html);

    let newCount = 0;

    // Each post on the public preview page lives in this wrapper
    const posts = $(".tgme_widget_message_text");

    console.log(`Found ${posts.length} total posts`);

    for (const el of posts.toArray()) {
      const text = $(el).text().trim();

      console.log("---POST START---");
      console.log(text.slice(0, 200)); // print first 200 characters of every post
      console.log("---POST END---");

      if (!text.includes("Job Title:")) continue;

      const title = extractField(text, "Job Title");
      const jobType = extractField(text, "Job Type");
      const location = extractField(text, "Work Location");
      const salary =
        extractField(text, "Salary/Compensation") ||
        extractField(text, "Salary");
      const deadline = extractField(text, "Deadline");
      const description = extractField(text, "Description");

      if (!title) continue;

      try {
        await pool.query(
          `INSERT INTO jobs (title, job_type, location, salary, deadline, description, raw_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (raw_text) DO NOTHING`,
          [title, jobType, location, salary, deadline, description, text],
        );
        newCount++;
      } catch (err) {
        console.error("Error saving job:", err.message);
      }
    }

    console.log(
      `Scraper ran: checked ${posts.length} posts, processed ${newCount} job listings`,
    );
  } catch (err) {
    console.error("Scraper failed:", err.message);
  }
}

// Pulls out the text that comes after a label like "Job Title:" up to the next line break
function extractField(text, label) {
  const regex = new RegExp(label + "\\s*:\\s*(.+)");
  const match = text.match(regex);
  return match ? match[1].trim().split("\n")[0] : null;
}

module.exports = scrapeFreelanceEthio;
