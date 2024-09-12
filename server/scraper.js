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
    let totalChecked = 0;
    let totalProcessed = 0;
    let beforeId = null;

    // Fetch multiple pages, going further back in the channel's history each time
    for (let page = 0; page < 4; page++) {
      const url = beforeId
        ? `https://t.me/s/freelance_ethio?before=${beforeId}`
        : "https://t.me/s/freelance_ethio";

      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      const messageWrappers = $(".tgme_widget_message");
      if (messageWrappers.length === 0) break; // no more pages

      // Track the oldest message id on this page, to request the next page after it
      let oldestId = null;

      for (const wrapper of messageWrappers.toArray()) {
        const dataPost = $(wrapper).attr("data-post"); // e.g. "freelance_ethio/12345"
        if (dataPost) {
          const idNum = parseInt(dataPost.split("/")[1], 10);
          if (!oldestId || idNum < oldestId) oldestId = idNum;
        }

        const textEl = $(wrapper).find(".tgme_widget_message_text");
        if (textEl.length === 0) continue;

        textEl.find("br").replaceWith("\n");
        const text = textEl.text().trim();
        totalChecked++;

        if (!text.includes("Job Title:")) continue;

        const fields = extractLabeledFields(text);
        const title = fields["Job Title"];
        if (!title) continue;

        const jobType = fields["Job Type"] || null;
        const location = fields["Work Location"] || null;
        const salary =
          fields["Salary/Compensation"] || fields["Salary"] || null;
        const deadline = fields["Deadline"] || null;
        const description = fields["Description"] || null;

        try {
          const result = await pool.query(
            `INSERT INTO jobs (title, job_type, location, salary, deadline, description, raw_text)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (raw_text) DO NOTHING
             RETURNING id`,
            [
              title.slice(0, 480),
              jobType ? jobType.slice(0, 95) : null,
              location ? location.slice(0, 480) : null,
              salary ? salary.slice(0, 480) : null,
              deadline ? deadline.slice(0, 95) : null,
              description,
              text,
            ],
          );
          if (result.rows.length > 0) totalProcessed++;
        } catch (err) {
          console.error("Error saving job:", err.message);
        }
      }

      if (!oldestId) break;
      beforeId = oldestId;
    }

    console.log(
      `Scraper ran: checked ${totalChecked} posts across pages, processed ${totalProcessed} new job listings`,
    );
  } catch (err) {
    console.error("Scraper failed:", err.message);
  }
}

function extractLabeledFields(text) {
  const result = {};
  const positions = FIELD_LABELS.map((label) => ({
    label,
    index: text.indexOf(label + ":"),
  }))
    .filter((f) => f.index !== -1)
    .sort((a, b) => a.index - b.index);

  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[i + 1];
    const start = current.index + current.label.length + 1;
    const end = next ? next.index : text.length;
    result[current.label] = text.slice(start, end).trim();
  }

  return result;
}

module.exports = scrapeFreelanceEthio;
