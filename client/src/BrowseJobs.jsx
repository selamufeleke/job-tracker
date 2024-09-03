import { useState, useEffect, useMemo } from "react";
import api from "./api";
import { useToast } from "./Toast";

function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const showToast = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (err) {
      showToast("Could not load jobs", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToTracker(job) {
    try {
      await api.post("/applications", {
        company: "Via Freelance Ethiopia (Telegram)",
        role: job.title,
        status: "applied",
        notes: `Source: Telegram - freelance_ethio. Deadline: ${job.deadline || "N/A"}`,
      });
      showToast("Added to your tracker!");
    } catch (err) {
      showToast("Could not add to tracker", "error");
    }
  }

  const visibleJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.job_type?.toLowerCase().includes(q),
    );
  }, [jobs, search]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Browse Jobs</h1>
      </div>

      <p style={{ color: "#667085", marginTop: "-8px" }}>
        Live job postings from Telegram — click a listing to view full details
        and apply directly in Telegram.
      </p>

      <div className="toolbar">
        <input
          placeholder="Search by title, location, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : visibleJobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="job-list">
          {visibleJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-main">
                <h3>{job.title}</h3>
                <div className="job-card-meta">
                  {job.job_type && <span>{job.job_type}</span>}
                  {job.location && <span>📍 {job.location}</span>}
                  {job.salary && <span>💰 {job.salary}</span>}
                  {job.deadline && <span>⏳ Deadline: {job.deadline}</span>}
                </div>
                {job.description && (
                  <p className="job-card-description">
                    {job.description.slice(0, 180)}
                    {job.description.length > 180 ? "..." : ""}
                  </p>
                )}
              </div>
              <div className="job-card-actions">
                <a
                  href="https://t.me/afriworkapplicantbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary job-apply-link"
                >
                  View Details & Apply
                </a>
                <button
                  className="btn-secondary"
                  onClick={() => handleAddToTracker(job)}
                >
                  Add to Tracker
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseJobs;
