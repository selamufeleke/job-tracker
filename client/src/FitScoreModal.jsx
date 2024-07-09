import { useState } from "react";
import api from "./api";
import { useToast } from "./Toast";

function FitScoreModal({ app, onClose }) {
  const [jobDescription, setJobDescription] = useState("");
  const [userBackground, setUserBackground] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleCheck() {
    if (!jobDescription.trim()) {
      showToast("Paste a job description first", "error");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post("/ai/fit-score", {
        company: app.company,
        role: app.role,
        jobDescription,
        userBackground,
      });
      setResult(response.data);
    } catch (err) {
      showToast("Could not calculate fit score", "error");
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score) {
    if (score >= 75) return "#16a34a";
    if (score >= 50) return "#b45309";
    return "#dc2626";
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box cover-letter-box">
        <h3>AI Job Fit Score</h3>
        <p className="modal-subtitle">
          For <strong>{app.role}</strong> at <strong>{app.company}</strong>
        </p>

        <label className="modal-label">Job description</label>
        <textarea
          rows={4}
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <label className="modal-label">Your background (optional)</label>
        <textarea
          rows={2}
          placeholder="e.g. Recent CS graduate, skilled in React and Node.js..."
          value={userBackground}
          onChange={(e) => setUserBackground(e.target.value)}
        />

        <button
          className="btn-primary"
          onClick={handleCheck}
          disabled={loading}
          style={{ marginTop: "10px" }}
        >
          {loading ? "Analyzing..." : "Check Fit Score"}
        </button>

        {result && (
          <div className="fit-score-result">
            <div
              className="fit-score-circle"
              style={{ borderColor: scoreColor(result.score) }}
            >
              <span style={{ color: scoreColor(result.score) }}>
                {result.score}
              </span>
              <small>/ 100</small>
            </div>

            <div className="fit-score-section">
              <h4>Strengths</h4>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="fit-score-section">
              <h4>Gaps</h4>
              <ul>
                {result.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="fit-score-advice">
              <strong>Advice:</strong> {result.advice}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FitScoreModal;
