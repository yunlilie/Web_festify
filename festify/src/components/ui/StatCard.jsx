export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="stat">
      <span className="stat__label">
        {Icon && (
          <span className="stat__icon"><Icon aria-hidden="true" /></span>
        )}
        {label}
      </span>
      <span className="stat__value">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  )
}
