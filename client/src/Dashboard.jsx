import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for adding a new application
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [notes, setNotes] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const response = await api.get("/applications");
      setApplications(response.data);
    } catch (err) {
      setError("Could not load applications");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddApplication(e) {
    e.preventDefault();
    try {
      await api.post("/applications", {
        company,
        role,
        status,
        applied_date: appliedDate || null,
        notes,
      });
      // Clear the form
      setCompany("");
      setRole("");
      setStatus("applied");
      setAppliedDate("");
      setNotes("");
      // Refresh the list
      fetchApplications();
    } catch (err) {
      setError("Could not add application");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/applications/${id}`);
      fetchApplications();
    } catch (err) {
      setError("Could not delete application");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>My Applications</h1>
        <button onClick={handleLogout}>Log Out</button>
      </div>

      {/* Add new application form */}
      <form
        onSubmit={handleAddApplication}
        style={{
          margin: "20px 0",
          padding: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Add Application</h3>
        <div style={{ marginBottom: "8px" }}>
          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            style={{ padding: "6px", marginRight: "8px" }}
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            style={{ padding: "6px", marginRight: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "8px" }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: "6px", marginRight: "8px" }}
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            style={{ padding: "6px" }}
          />
        </div>
        <div style={{ marginBottom: "8px" }}>
          <input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ padding: "6px", width: "300px" }}
          />
        </div>
        <button type="submit" style={{ padding: "6px 16px" }}>
          Add
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* List of applications */}
      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <p>No applications yet. Add one above.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Company</th>
              <th style={{ padding: "8px" }}>Role</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px" }}>Date</th>
              <th style={{ padding: "8px" }}>Notes</th>
              <th style={{ padding: "8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{app.company}</td>
                <td style={{ padding: "8px" }}>{app.role}</td>
                <td style={{ padding: "8px" }}>{app.status}</td>
                <td style={{ padding: "8px" }}>
                  {app.applied_date
                    ? new Date(app.applied_date).toLocaleDateString()
                    : "-"}
                </td>
                <td style={{ padding: "8px" }}>{app.notes || "-"}</td>
                <td style={{ padding: "8px" }}>
                  <button onClick={() => handleDelete(app.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
