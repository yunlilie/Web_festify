export default function Tabs({ tabs, value, onChange, label = 'Tab' }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" className="tabs__btn" aria-selected={value === t.value} onClick={() => onChange(t.value)}>
          {t.label}
          {t.count != null && <span className="tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
