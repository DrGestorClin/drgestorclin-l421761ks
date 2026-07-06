import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Index from './pages/Index'
import DoctorsPage from './pages/doctors/DoctorsPage'
import PatientsPage from './pages/patients/PatientsPage'
import AgendaPage from './pages/agenda/AgendaPage'
import ConsultationPage from './pages/consultation/ConsultationPage'
import LoginPage from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/consultation/:id" element={<ConsultationPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
