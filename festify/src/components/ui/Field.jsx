import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** Pembungkus label + hint + pesan error. */
export function Field({ label, hint, error, required, children, id, className = '' }) {
  const auto = useId()
  const fid = id || auto
  const describedBy = [hint && `${fid}-hint`, error && `${fid}-err`].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={fid}>
          {label}
          {required && <span className="req" aria-hidden="true">*</span>}
        </label>
      )}
      {children({ id: fid, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {hint && !error && <span id={`${fid}-hint`} className="field__hint">{hint}</span>}
      {error && <span id={`${fid}-err`} className="field__error" role="alert">{error}</span>}
    </div>
  )
}

export function Input({ label, hint, error, required, className, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className} id={props.id}>
      {(a) => <input className="input" {...a} {...props} />}
    </Field>
  )
}

export function Textarea({ label, hint, error, required, className, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className} id={props.id}>
      {(a) => <textarea className="textarea" {...a} {...props} />}
    </Field>
  )
}

export function Select({ label, hint, error, required, className, children, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className} id={props.id}>
      {(a) => (
        <select className="select" {...a} {...props}>
          {children}
        </select>
      )}
    </Field>
  )
}

export function PasswordInput({ label = 'Password', hint, error, required, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} hint={hint} error={error} required={required} id={props.id}>
      {(a) => (
        <div className="input-wrap">
          <input className="input" type={show ? 'text' : 'password'} {...a} {...props} />
          <button type="button" className="input-wrap__btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}
    </Field>
  )
}

export function Checkbox({ children, error, ...props }) {
  return (
    <div className="stack-sm">
      <label className="checkbox">
        <input type="checkbox" {...props} />
        <span>{children}</span>
      </label>
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  )
}
