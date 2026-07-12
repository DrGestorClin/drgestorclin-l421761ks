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
  ShieldPlus,
  Stethoscope,
} from 'lucide-react'
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
import { ClinicAssistantChat } from '@/components/clinic-assistant-chat'
import headerBanner from '@/assets/image-70721.png'

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
  const { user, signOut, isDoctor, isAdmin, doctor } = useAuth()
  const navigate = useNavigate()

  const navItems = NAV_ITEMS.filter((item) => {
    if (item.title === 'Configurações' && !isAdmin) return false
    if (item.title === 'Médicos' && isDoctor) return false
    return true
  })

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  const displayName = isDoctor && doctor ? doctor.name : user?.name || 'DrGestorClin Admin'
  const roleName = isDoctor ? 'Médico' : isAdmin ? 'Administrador' : 'Assistente'

  const initials =
    displayName
      ?.split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DA'

  const avatarUrl = user?.avatar
    ? `${pb.baseURL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
    : ''

  return (
    <div className="min-h-screen bg-[#EAF1EC] text-foreground flex flex-col font-sans">
      <header className="relative w-full h-[110px] sm:h-[150px] md:h-[200px] overflow-hidden shrink-0 flex items-center justify-center shadow-inner bg-[#5E806D]">
        <Link to="/" className="absolute inset-0 z-10 block">
          <img
            src={headerBanner}
            alt="DrGestorClin Banner"
            className="w-full h-full object-cover object-center"
          />
        </Link>

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2 sm:gap-3 bg-[#F4F8F6] shadow-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border border-white/60 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0 hover:bg-black/5 transition-colors h-8 w-8 sm:h-9 sm:w-9 rounded-full hidden sm:flex text-[#5A7B68]"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-rose-500 border border-white" />
          </Button>

          <div className="hidden sm:block h-8 w-px bg-black/10" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 sm:gap-3 px-1 hover:bg-black/5 h-auto py-1 rounded-full"
              >
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-[#CDE0D5] shrink-0">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-[#E5EFE9] text-[#4A6455] text-xs sm:text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start pr-2">
                  <span className="font-bold text-sm text-[#2A4434] leading-none">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-[#4A6455] font-medium mt-1">{roleName}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl shadow-floating border-border/60"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-medium cursor-pointer rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav className="bg-[#668A75] px-2 sm:px-4 shadow-sm relative z-40 border-b border-[#5E806D]/30">
        <div className="flex items-end gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar max-w-7xl mx-auto w-full px-1 sm:px-2 pt-3">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.url ||
              (item.url !== '/' && location.pathname.startsWith(item.url))
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all rounded-t-xl whitespace-nowrap',
                  isActive
                    ? 'bg-[#EAF1EC] text-[#2A4434]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                <item.icon
                  className={cn('h-4 w-4 sm:h-4 sm:w-4', isActive ? 'stroke-[2.5px]' : 'stroke-2')}
                />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in pb-20">
        <Outlet />
      </main>

      <ClinicAssistantChat />

      {/* FAB - purely visual as per AC, standard pointer-events so it acts like a normal floating element */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-[#3B9169] hover:bg-[#28533D] shadow-lg shadow-[#3B9169]/30 text-white"
        >
          <Stethoscope className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
