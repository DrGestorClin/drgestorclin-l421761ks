import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  UserRound,
  Calendar as CalendarIcon,
  Settings,
  Search,
  Bell,
  LogOut,
  FileText,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import logoUrl from '@/assets/geminigeneratedimagel0e5l0l0e5l0l0e5-7b51d.png'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Agenda', url: '/agenda', icon: CalendarIcon },
  { title: 'Pacientes', url: '/patients', icon: Users },
  { title: 'Médicos', url: '/doctors', icon: UserRound },
  { title: 'Modelos', url: '/templates', icon: FileText },
  { title: 'Configurações', url: '#', icon: Settings },
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

  return (
    <SidebarProvider>
      <Sidebar className="shadow-elevation border-r border-sidebar-border">
        <SidebarHeader className="h-28 flex items-center justify-center border-b border-sidebar-border px-6 py-4 shrink-0 bg-transparent">
          <Link to="/" className="flex items-center justify-center w-full h-full">
            <img
              src={logoUrl}
              alt="DrGestorClin Logo"
              className="max-h-24 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url && item.url !== '#'
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} className="nav-menu-button">
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-center text-muted-foreground">
            Powered by{' '}
            <a
              href="https://www.drgestorclin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              www.drgestorclin.com
            </a>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 lg:px-6">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <div className="flex-1 flex items-center max-w-md relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Busca rápida por paciente ou médico..."
              className="w-full pl-9 bg-muted/50 border-border focus-visible:bg-background transition-colors"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0 hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-medium text-sm">
                    {user?.name || 'Usuário'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-brand-green-light p-4 md:p-6 lg:p-8 transition-colors">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
