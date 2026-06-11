function statColor(value) {
  if (value >= 115) return '#5fc9c0';
  if (value >= 85) return '#8fcf7f';
  if (value >= 55) return '#f2b56b';
  return '#ef8a7a';
}

export default function StatBar({ label, value }) {
  // 180 ≈ a very high base stat; anything beyond just fills the bar
  const width = Math.min(100, Math.round((value / 180) * 100));
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-track neu-inset-sm">
        <div className="stat-fill" style={{ width: `${width}%`, background: statColor(value) }} />
      </div>
    </div>
  );
}
