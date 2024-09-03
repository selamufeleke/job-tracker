const express = require("express");
const cors = require("cors");
const pool = require("./db");
const cron = require("node-cron");
const scrapeFreelanceEthio = require("./scraper");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});
// Manual trigger for testing
app.get("/api/scrape-now", async (req, res) => {
  await scrapeFreelanceEthio();
  res.json({ message: "Scrape complete, check server logs" });
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/ai", require("./routes/ai"));
const PORT = process.env.PORT || 5000;
// Run automatically every hour
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled scrape...");
  scrapeFreelanceEthio();
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
