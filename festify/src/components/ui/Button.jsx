import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

const cls = ({ variant = 'primary', size, block, icon, className = '' }) =>
  ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', icon && 'btn--icon', className].filter(Boolean).join(' ')

/** Tombol standar. Gunakan `to` untuk navigasi internal, `href` untuk tautan eksternal. */
const Button = forwardRef(function Button({ variant, size, block, icon, loading, className, to, href, children, disabled, type = 'button', ...rest }, ref) {
  const c = cls({ variant, size, block, icon, className })
  const content = (
    <>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </>
  )
  if (to) return <Link ref={ref} to={to} className={c} {...rest}>{content}</Link>
  if (href)
    return (
      <a ref={ref} href={href} className={c} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    )
  return (
    <button ref={ref} type={type} className={c} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  )
})

export default Button
