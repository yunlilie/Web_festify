import { Music, GraduationCap, Frame, Hammer, Drama, Trophy, UtensilsCrossed, Cpu, Users, PartyPopper, Sparkles } from 'lucide-react'

const MAP = { musik: Music, edukasi: GraduationCap, pameran: Frame, workshop: Hammer, 'seni-budaya': Drama, olahraga: Trophy, kuliner: UtensilsCrossed, teknologi: Cpu, komunitas: Users, festival: PartyPopper }
const COLORS = ['#be3496', '#6a0dad', '#f28c1c', '#f43f5e', '#8433cc', '#15803d', '#d92d4c', '#1d4ed8', '#b45309']

export const categoryColor = (cat) => cat?.color || COLORS[(cat?.id || 0) % COLORS.length]

export default function CategoryIcon({ slug, ...props }) {
  const Icon = MAP[slug] || Sparkles
  return <Icon aria-hidden="true" {...props} />
}
