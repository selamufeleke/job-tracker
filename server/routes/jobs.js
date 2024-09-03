const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jobs ORDER BY posted_at DESC LIMIT 100",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
