import { useState } from "react";
import api from "../api";
import { useToast } from "./Toast";

function CoverLetterModal({ app, onClose }) {
  const [jobDescription, setJobDescription] = useState("");
  const [userBackground, setUserBackground] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleGenerate() {
    setLoading(true);
    setCoverLetter("");
    try {
      const response = await api.post("/ai/cover-letter", {
        company: app.company,
        role: app.role,
        jobDescription,
        userBackground,
      });
      setCoverLetter(response.data.coverLetter);
    } catch (err) {
      showToast("Could not generate cover letter", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(coverLetter);
    showToast("Copied to clipboard!");
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box cover-letter-box">
        <h3>Generate Cover Letter</h3>
        <p className="modal-subtitle">
          For <strong>{app.role}</strong> at <strong>{app.company}</strong>
        </p>

        <label className="modal-label">Job description (optional)</label>
        <textarea
          rows={3}
          placeholder="Paste the job description here for a more tailored letter..."
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
          onClick={handleGenerate}
          disabled={loading}
          style={{ marginTop: "10px" }}
        >
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>

        {coverLetter && (
          <div className="cover-letter-result">
            <textarea rows={10} value={coverLetter} readOnly />
            <button
              className="btn-secondary"
              onClick={handleCopy}
              style={{ marginTop: "8px" }}
            >
              Copy to Clipboard
            </button>
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

export default CoverLetterModal;
