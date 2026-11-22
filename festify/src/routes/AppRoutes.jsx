import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, PlusCircle, MessageSquareText, BarChart3, Building2,
  Users, BadgeCheck, Tags, MapPinned, ShieldAlert, Ban, Megaphone, LineChart,
} from 'lucide-react'
import PublicLayout from '@/layouts/PublicLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import { ProtectedRoute, RoleRoute, GuestRoute } from './ProtectedRoute'
import { Spinner } from '@/components/ui/States'

const p = (loader) => lazy(loader)
// Public
const Home = p(() => import('@/pages/public/HomePage'))
const Explore = p(() => import('@/pages/public/ExplorePage'))
const EventDetail = p(() => import('@/pages/public/EventDetailPage'))
const OrganizerPublic = p(() => import('@/pages/public/OrganizerPublicPage'))
const Faq = p(() => import('@/pages/public/FaqPage'))
const Legal = p(() => import('@/pages/public/LegalPage'))
const NotFound = p(() => import('@/pages/public/NotFoundPage'))
const Forbidden = p(() => import('@/pages/public/ForbiddenPage'))
// Auth
const Login = p(() => import('@/pages/auth/LoginPage'))
const Register = p(() => import('@/pages/auth/RegisterPage'))
const VerifyEmail = p(() => import('@/pages/auth/VerifyEmailPage'))
const ForgotPassword = p(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPassword = p(() => import('@/pages/auth/ResetPasswordPage'))
const AuthCallback = p(() => import('@/pages/auth/AuthCallbackPage'))
// User
const Profile = p(() => import('@/pages/user/ProfilePage'))
const Favorites = p(() => import('@/pages/user/FavoritesPage'))
const Notifications = p(() => import('@/pages/user/NotificationsPage'))
const BecomeOrganizer = p(() => import('@/pages/user/BecomeOrganizerPage'))
// Organizer
const OrgOverview = p(() => import('@/pages/organizer/OverviewPage'))
const OrgEvents = p(() => import('@/pages/organizer/EventsPage'))
const OrgEventForm = p(() => import('@/pages/organizer/EventFormPage'))
const OrgReviews = p(() => import('@/pages/organizer/ReviewsPage'))
const OrgAnalytics = p(() => import('@/pages/organizer/AnalyticsPage'))
const OrgProfile = p(() => import('@/pages/organizer/OrganizerProfilePage'))
// Admin
const AdminDashboard = p(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsers = p(() => import('@/pages/admin/UsersPage'))
const AdminOrganizers = p(() => import('@/pages/admin/OrganizersPage'))
const AdminEvents = p(() => import('@/pages/admin/AdminEventsPage'))
const AdminCategories = p(() => import('@/pages/admin/CategoriesPage'))
const AdminRegions = p(() => import('@/pages/admin/RegionsPage'))
const AdminReviews = p(() => import('@/pages/admin/ReviewModerationPage'))
const AdminWords = p(() => import('@/pages/admin/BlockedWordsPage'))
const AdminNotifications = p(() => import('@/pages/admin/AdminNotificationsPage'))
const AdminStats = p(() => import('@/pages/admin/PlatformStatsPage'))

const ORGANIZER_NAV = [
  { to: '/organizer', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/organizer/events', label: 'Kelola event', icon: CalendarDays, end: true },
  { to: '/organizer/events/new', label: 'Tambah event', icon: PlusCircle },
  { group: 'Audiens' },
  { to: '/organizer/reviews', label: 'Ulasan', icon: MessageSquareText },
  { to: '/organizer/analytics', label: 'Statistik', icon: BarChart3 },
  { group: 'Akun' },
  { to: '/organizer/profile', label: 'Profil organizer', icon: Building2 },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { group: 'Pengguna' },
  { to: '/admin/users', label: 'Pengguna', icon: Users },
  { to: '/admin/organizers', label: 'Organizer', icon: BadgeCheck },
  { group: 'Konten' },
  { to: '/admin/events', label: 'Event', icon: CalendarDays },
  { to: '/admin/categories', label: 'Kategori', icon: Tags },
  { to: '/admin/regions', label: 'Wilayah', icon: MapPinned },
  { group: 'Moderasi' },
  { to: '/admin/reviews', label: 'Moderasi ulasan', icon: ShieldAlert },
  { to: '/admin/blocked-words', label: 'Kata terlarang', icon: Ban },
  { to: '/admin/notifications', label: 'Pengumuman', icon: Megaphone },
  { group: 'Laporan' },
  { to: '/admin/statistics', label: 'Statistik platform', icon: LineChart },
]

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="organizers/:id" element={<OrganizerPublic />} />
          <Route path="faq" element={<Faq />} />
          <Route path="syarat-ketentuan" element={<Legal kind="terms" />} />
          <Route path="kebijakan-privasi" element={<Legal kind="privacy" />} />
          <Route path="403" element={<Forbidden />} />

          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="become-organizer" element={<BecomeOrganizer />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="auth/callback" element={<AuthCallback />} />
        </Route>

        <Route element={<RoleRoute allow={['organizer']} />}>
          <Route path="organizer" element={<DashboardLayout nav={ORGANIZER_NAV} roleLabel="Organizer" home="/organizer" />}>
            <Route index element={<OrgOverview />} />
            <Route path="events" element={<OrgEvents />} />
            <Route path="events/new" element={<OrgEventForm />} />
            <Route path="events/:id/edit" element={<OrgEventForm />} />
            <Route path="reviews" element={<OrgReviews />} />
            <Route path="analytics" element={<OrgAnalytics />} />
            <Route path="profile" element={<OrgProfile />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allow={['admin']} />}>
          <Route path="admin" element={<DashboardLayout nav={ADMIN_NAV} roleLabel="Admin" home="/admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="organizers" element={<AdminOrganizers />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="regions" element={<AdminRegions />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="blocked-words" element={<AdminWords />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="statistics" element={<AdminStats />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
