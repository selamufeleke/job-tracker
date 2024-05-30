import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAppliedDate, setEditAppliedDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

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
      setCompany("");
      setRole("");
      setStatus("applied");
      setAppliedDate("");
      setNotes("");
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

  function startEdit(app) {
    setEditingId(app.id);
    setEditCompany(app.company);
    setEditRole(app.role);
    setEditStatus(app.status);
    setEditAppliedDate(app.applied_date ? app.applied_date.split("T")[0] : "");
    setEditNotes(app.notes || "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id) {
    try {
      await api.put(`/applications/${id}`, {
        company: editCompany,
        role: editRole,
        status: editStatus,
        applied_date: editAppliedDate || null,
        notes: editNotes,
      });
      setEditingId(null);
      fetchApplications();
    } catch (err) {
      setError("Could not update application");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Applications</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <form className="add-form" onSubmit={handleAddApplication}>
        <h3>Add Application</h3>
        <div>
          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
          />
        </div>
        <div>
          <input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>
        <button className="btn-primary" type="submit">
          Add Application
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <p>No applications yet. Add one above.</p>
      ) : (
        <table className="applications-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) =>
              editingId === app.id ? (
                <tr key={app.id}>
                  <td>
                    <input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td>
                    <input
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editAppliedDate}
                      onChange={(e) => setEditAppliedDate(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      style={{ width: "120px" }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => handleSaveEdit(app.id)}
                    >
                      Save
                    </button>
                    <button className="btn-small" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={app.id}>
                  <td>{app.company}</td>
                  <td>{app.role}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    {app.applied_date
                      ? new Date(app.applied_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{app.notes || "-"}</td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => startEdit(app)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(app.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
