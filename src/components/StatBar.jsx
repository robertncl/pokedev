import { useI18n } from '../i18n/index.js';

function statBand(value) {
  if (value >= 115) return 'teal';
  if (value >= 85) return 'green';
  if (value >= 55) return 'yellow';
  return 'red';
}

// `value` is undefined while the detail data loads: the row keeps its place
// with an empty bar, which then animates to the stat.
export default function StatBar({ label, value }) {
  const { formatNumber } = useI18n();
  const loaded = value != null;
  // 180 ≈ a very high base stat; anything beyond just fills the bar
  const pct = loaded ? Math.min(100, Math.round((value / 180) * 100)) : 0;
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{loaded ? formatNumber(value) : null}</span>
      {/* Decorative: the number beside it carries the information. */}
      <span className="stat-track" aria-hidden="true">
        <span className="stat-fill" data-band={loaded ? statBand(value) : undefined} style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}
