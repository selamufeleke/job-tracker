const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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
// Upload/replace a CV for a specific application
router.post("/:id/cv", upload.single("cv"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res
      .status(400)
      .json({ error: "Only PDF or Word documents are allowed" });
  }

  try {
    const result = await pool.query(
      `UPDATE applications
       SET cv_filename = $1, cv_filetype = $2, cv_data = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, cv_filename, cv_filetype`,
      [
        req.file.originalname,
        req.file.mimetype,
        req.file.buffer,
        req.params.id,
        req.userId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download/view the CV for a specific application
router.get("/:id/cv", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT cv_filename, cv_filetype, cv_data FROM applications WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId],
    );

    if (result.rows.length === 0 || !result.rows[0].cv_data) {
      return res
        .status(404)
        .json({ error: "No CV found for this application" });
    }

    const { cv_filename, cv_filetype, cv_data } = result.rows[0];
    res.set({
      "Content-Type": cv_filetype,
      "Content-Disposition": `inline; filename="${cv_filename}"`,
    });
    res.send(cv_data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


