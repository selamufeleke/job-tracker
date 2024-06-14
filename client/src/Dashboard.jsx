import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useToast } from "./Toast";
import ConfirmModal from "./ConfirmModal";
import StatsCards from "./StatsCards";
import KanbanBoard from "./KanbanBoard";
import CoverLetterModal from "./CoverLetterModal";
import Sidebar from "./Sidebar";

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [view, setView] = useState("table"); // "table" or "kanban"

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [coverLetterApp, setCoverLetterApp] = useState(null);

  const navigate = useNavigate();
  const showToast = useToast();

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
      showToast("Application added!");
    } catch (err) {
      showToast("Could not add application", "error");
    }
  }

  function requestDelete(id) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    try {
      await api.delete(`/applications/${deleteTarget}`);
      fetchApplications();
      showToast("Application deleted");
    } catch (err) {
      showToast("Could not delete application", "error");
    } finally {
      setDeleteTarget(null);
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
      showToast("Application updated!");
    } catch (err) {
      showToast("Could not update application", "error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Filter, search, and sort — recalculated whenever any of these change
  const visibleApplications = useMemo(() => {
    let result = [...applications];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (valA === null) valA = "";
      if (valB === null) valB = "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, search, statusFilter, sortKey, sortDir]);

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>My Applications</h1>
          </div>

          <StatsCards applications={applications} />

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
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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

          <div className="toolbar">
            <input
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : visibleApplications.length === 0 ? (
            <p>No applications match your search/filter.</p>
          ) : view === "kanban" ? (
            <KanbanBoard
              applications={visibleApplications}
              onEdit={startEdit}
              onDelete={requestDelete}
            />
          ) : (
            <table className="applications-table">
              <thead>
                <tr>
                  <th
                    className="sortable-header"
                    onClick={() => toggleSort("company")}
                  >
                    Company{" "}
                    {sortKey === "company" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => toggleSort("role")}
                  >
                    Role {sortKey === "role" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => toggleSort("status")}
                  >
                    Status{" "}
                    {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => toggleSort("applied_date")}
                  >
                    Date{" "}
                    {sortKey === "applied_date" &&
                      (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((app) =>
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
                          className="btn-small"
                          onClick={() => setCoverLetterApp(app)}
                        >
                          AI Letter
                        </button>
                        <button
                          className="btn-small btn-danger"
                          onClick={() => requestDelete(app.id)}
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

          <ConfirmModal
            open={deleteTarget !== null}
            title="Delete this application?"
            message="This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />

          {coverLetterApp && (
            <CoverLetterModal
              app={coverLetterApp}
              onClose={() => setCoverLetterApp(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
