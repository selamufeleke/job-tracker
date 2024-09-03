const cheerio = require("cheerio");
const pool = require("./db");

const FIELD_LABELS = [
  "Job Title",
  "Job Type",
  "Work Location",
  "Applicants Needed",
  "Salary/Compensation",
  "Salary",
  "Deadline",
  "Description",
];

async function scrapeFreelanceEthio() {
  try {
    const response = await fetch("https://t.me/s/freelance_ethio");
    const html = await response.text();
    const $ = cheerio.load(html);

    let newCount = 0;
    const posts = $(".tgme_widget_message_text");

    for (const el of posts.toArray()) {
      // Convert <br> tags into real newlines before extracting plain text
      $(el).find("br").replaceWith("\n");
      const text = $(el).text().trim();

      if (!text.includes("Job Title:")) continue;

      const fields = extractLabeledFields(text);

      const title = fields["Job Title"];
      if (!title) continue;

      const jobType = fields["Job Type"] || null;
      const location = fields["Work Location"] || null;
      const salary = fields["Salary/Compensation"] || fields["Salary"] || null;
      const deadline = fields["Deadline"] || null;
      const description = fields["Description"] || null;

      try {
        await pool.query(
          `INSERT INTO jobs (title, job_type, location, salary, deadline, description, raw_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (raw_text) DO NOTHING`,
          [
            title.slice(0, 250),
            jobType ? jobType.slice(0, 95) : null,
            location ? location.slice(0, 250) : null,
            salary ? salary.slice(0, 250) : null,
            deadline ? deadline.slice(0, 95) : null,
            description,
            text,
          ],
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

// Finds each label in the text, and extracts everything up to the NEXT label (or end of text)
function extractLabeledFields(text) {
  const result = {};

  // Find the position of every label that actually appears in this text
  const positions = FIELD_LABELS.map((label) => ({
    label,
    index: text.indexOf(label + ":"),
  }))
    .filter((f) => f.index !== -1)
    .sort((a, b) => a.index - b.index);

  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[i + 1];

    const start = current.index + current.label.length + 1; // +1 skips the colon
    const end = next ? next.index : text.length;

    result[current.label] = text.slice(start, end).trim();
  }

  return result;
}

module.exports = scrapeFreelanceEthio;
