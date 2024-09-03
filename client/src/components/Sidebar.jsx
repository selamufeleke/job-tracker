import { useNavigate } from "react-router-dom";

function Sidebar({ view, setView, onLogout }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">JT</div>
        <span>Job Tracker</span>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${view === "table" ? "active" : ""}`}
          onClick={() => setView("table")}
        >
          <span className="sidebar-icon">☰</span> Applications
        </button>
        <button
          className={`sidebar-link ${view === "kanban" ? "active" : ""}`}
          onClick={() => setView("kanban")}
        >
          <span className="sidebar-icon">▦</span> Kanban Board
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
