import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ view, setView, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname === "/dashboard";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">JT</div>
        <span>Job Tracker</span>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${onDashboard && view === "table" ? "active" : ""}`}
          onClick={() => {
            navigate("/dashboard");
            setView("table");
          }}
        >
          <span className="sidebar-icon">☰</span> Applications
        </button>
        <button
          className={`sidebar-link ${onDashboard && view === "kanban" ? "active" : ""}`}
          onClick={() => {
            navigate("/dashboard");
            setView("kanban");
          }}
        >
          <span className="sidebar-icon">▦</span> Kanban Board
        </button>
        <button
          className={`sidebar-link ${location.pathname === "/jobs" ? "active" : ""}`}
          onClick={() => navigate("/jobs")}
        >
          <span className="sidebar-icon">🔍</span> Browse Jobs
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-link" onClick={onLogout}>
          <span className="sidebar-icon">⏻</span> Log Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
