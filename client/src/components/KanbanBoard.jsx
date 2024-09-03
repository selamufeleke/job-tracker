const COLUMNS = [
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

function KanbanBoard({
  applications,
  onEdit,
  onDelete,
  onCoverLetter,
  onFitScore,
}) {
  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => (
        <div key={col.key} className="kanban-column">
          <h4 className={`kanban-column-title status-${col.key}`}>
            {col.label} (
            {applications.filter((a) => a.status === col.key).length})
          </h4>
          <div className="kanban-cards">
            {applications
              .filter((a) => a.status === col.key)
              .map((app) => (
                <div key={app.id} className="kanban-card">
                  <div className="kanban-card-company">{app.company}</div>
                  <div className="kanban-card-role">{app.role}</div>
                  {app.applied_date && (
                    <div className="kanban-card-date">
                      {new Date(app.applied_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="kanban-card-actions">
                    <button className="btn-small" onClick={() => onEdit(app)}>
                      Edit
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => onCoverLetter(app)}
                    >
                      AI Letter
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => onFitScore(app)}
                    >
                      Fit Score
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => onDelete(app.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard;
