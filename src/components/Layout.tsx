import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserRound,
  Calendar as CalendarIcon,
  Settings,
  Bell,
  LogOut,
  FileText,
} from 'lucide-react'
import bannerImg from '@/assets/geminigeneratedimage5b1iqv5b1iqv5b1i-49736.png'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Agenda', url: '/agenda', icon: CalendarIcon },
  { title: 'Pacientes', url: '/patients', icon: Users },
  { title: 'Médicos', url: '/doctors', icon: UserRound },
  { title: 'Modelos', url: '/templates', icon: FileText },
  { title: 'Configurações', url: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const { user, signOut, isDoctor } = useAuth()
  const navigate = useNavigate()

  const DOCTOR_HIDDEN = ['Médicos', 'Configurações']
  const navItems = isDoctor
    ? NAV_ITEMS.filter((item) => !DOCTOR_HIDDEN.includes(item.title))
    : NAV_ITEMS

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  const avatarUrl = user?.avatar
    ? `${pb.baseURL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
    : ''

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="relative w-full h-32 md:h-48 overflow-hidden bg-brand-forest shrink-0">
        <img
          src={bannerImg}
          alt="DrGestorClin Banner"
          className="w-full h-full object-cover opacity-90 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/90 via-brand-forest/20 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 flex items-center gap-2 md:gap-3 bg-white/95 backdrop-blur shadow-sm px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-white/20">
          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0 hover:bg-slate-100 transition-colors h-8 w-8 rounded-full hidden sm:flex"
          >
            <Bell className="h-4 w-4 text-brand-forest" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </Button>

          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-1 hover:bg-slate-100 h-auto py-1">
                <Avatar className="h-8 w-8 border border-brand-military/30">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-brand-military/20 text-brand-forest text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-bold text-sm text-brand-forest leading-none">
                    {user?.name || 'Usuário'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {isDoctor ? 'Médico' : 'Administrador'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-medium cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8">
          <h1 className="text-white font-bold text-2xl md:text-3xl drop-shadow-md">DrGestorClin</h1>
          <p className="text-white/80 text-sm md:text-base font-medium drop-shadow hidden sm:block">
            Eficiência em Gestão de Clínicas e Consultórios
          </p>
        </div>
      </header>

      <nav className="bg-brand-military sticky top-0 z-40 shadow-sm">
        <div className="flex items-center overflow-x-auto no-scrollbar max-w-7xl mx-auto w-full px-2 md:px-6">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.url ||
              (item.url !== '/' && location.pathname.startsWith(item.url))
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 md:py-4 text-sm font-bold transition-all border-b-4 whitespace-nowrap',
                  isActive
                    ? 'border-brand-forest text-brand-forest bg-white/20'
                    : 'border-transparent text-brand-forest/70 hover:text-brand-forest hover:bg-white/10',
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
