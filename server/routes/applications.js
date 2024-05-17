const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Every route below this line requires a valid token
router.use(authMiddleware);

// GET all applications for the logged-in user
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new application
router.post("/", async (req, res) => {
  const { company, role, status, applied_date, notes } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: "Company and role are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO applications (user_id, company, role, status, applied_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.userId,
        company,
        role,
        status || "applied",
        applied_date || null,
        notes || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (edit) an existing application
router.put("/:id", async (req, res) => {
  const { company, role, status, applied_date, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE applications
       SET company = $1, role = $2, status = $3, applied_date = $4, notes = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [company, role, status, applied_date, notes, req.params.id, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an application
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
