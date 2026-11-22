import { initials } from '@/utils/format'

export default function Avatar({ src, name, size }) {
  return (
    <span className={`avatar ${size ? `avatar--${size}` : ''}`} aria-hidden={!name}>
      {src ? <img src={src} alt={name ? `Foto ${name}` : ''} loading="lazy" /> : initials(name)}
    </span>
  )
}
