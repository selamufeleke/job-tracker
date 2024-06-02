function StatsCards({ applications }) {
  const total = applications.length;
  const interview = applications.filter((a) => a.status === "interview").length;
  const offer = applications.filter((a) => a.status === "offer").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const stats = [
    { label: "Total Applications", value: total, className: "stat-total" },
    { label: "Interviews", value: interview, className: "stat-interview" },
    { label: "Offers", value: offer, className: "stat-offer" },
    { label: "Rejected", value: rejected, className: "stat-rejected" },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div key={s.label} className={`stat-card ${s.className}`}>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
