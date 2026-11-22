import { EVENT_STATUS, ROLE_LABEL } from '@/utils/constants'

export function Badge({ tone, children, className = '' }) {
  return <span className={`badge ${tone ? `badge--${tone}` : ''} ${className}`}>{children}</span>
}

export function StatusBadge({ status, archived }) {
  if (archived) return <Badge>Diarsipkan</Badge>
  const s = EVENT_STATUS[status] || { label: status, tone: '' }
  return <Badge tone={s.tone === 'neutral' ? '' : s.tone}>{s.label}</Badge>
}

export function RoleBadge({ role }) {
  const tone = { admin: 'coral', organizer: 'plum', user: '' }[role]
  return <Badge tone={tone}>{ROLE_LABEL[role] || role}</Badge>
}
