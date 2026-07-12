import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShieldAlert, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createUser } from '@/services/users'
import { findOrCreateEstablishment } from '@/services/establishments'
import { getDoctors, type Doctor } from '@/services/doctors'
import { validatePassword, passwordRules } from '@/lib/password-validation'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'

type UserType = 'admin' | 'doctor' | 'staff' | 'patient'

const LGPD_TEXT =
  'O tratamento de dados e o sigilo jurídico das informações são de responsabilidade dos médicos e profissionais de saúde, em estrita conformidade com a LGPD (Lei Geral de Proteção de Dados).'

export function UserCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [userType, setUserType] = useState<UserType>('staff')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [crm, setCrm] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [estType, setEstType] = useState<'Clínica' | 'Consultório'>('Clínica')
  const [estName, setEstName] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open)
      getDoctors()
        .then(setDoctors)
        .catch(() => {})
  }, [open])

  const resetForm = () => {
    setUserType('staff')
    setName('')
    setEmail('')
    setPassword('')
    setCrm('')
    setSpecialty('')
    setPhone('')
    setBirthDate('')
    setEstType('Clínica')
    setEstName('')
    setSelectedDoctor('')
  }

  const isPatient = userType === 'patient'
  const needsEstablishment = userType !== 'admin'
  const needsPassword = !isPatient
  const passwordValid = validatePassword(password)
  const canSubmit = Boolean(
    name.trim() &&
    email.trim() &&
    (isPatient || passwordValid) &&
    (userType !== 'doctor' || (crm.trim() && specialty.trim())) &&
    (!needsEstablishment || estName.trim()) &&
    (!isPatient || selectedDoctor),
  )

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      let estId: string | undefined
      if (needsEstablishment && estName.trim()) {
        const est = await findOrCreateEstablishment(estName.trim(), estType)
        estId = est.id
      }

      if (isPatient) {
        await pb.collection('patients').create({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          birth_date: birthDate || null,
          doctor: selectedDoctor,
          establishment_ref: estId,
        })
      } else if (userType === 'doctor') {
        const doctor = await pb.collection('doctors').create({
          name: name.trim(),
          crm: crm.trim(),
          specialty: specialty.trim(),
          email: email.trim(),
          phone: phone.trim(),
          active: true,
          establishment_ref: estId,
        })
        await createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role: 'doctor',
          doctor_ref: doctor.id,
          establishment_ref: estId,
        })
      } else {
        await createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role: userType,
          establishment_ref: estId,
        })
      }

      toast({ title: 'Sucesso', description: 'Usuário criado com sucesso.' })
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{LGPD_TEXT}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo de Usuário</Label>
            <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="doctor">Médico</SelectItem>
                <SelectItem value="staff">Atendente</SelectItem>
                <SelectItem value="patient">Paciente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          {needsPassword && (
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="space-y-1 rounded-lg bg-muted/50 p-2">
                {passwordRules.map((rule, i) => {
                  const passed = rule.test(password)
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      {passed ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                      )}
                      <span className={passed ? 'text-green-700' : 'text-muted-foreground'}>
                        {rule.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {userType === 'doctor' && (
            <>
              <div className="space-y-1.5">
                <Label>CRM</Label>
                <Input
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  placeholder="00000/UF"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Especialidade</Label>
                <Input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ex: Cardiologia"
                />
              </div>
            </>
          )}

          {(userType === 'doctor' || isPatient) && (
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          )}

          {isPatient && (
            <>
              <div className="space-y-1.5">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Médico Responsável</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {needsEstablishment && (
            <>
              <div className="space-y-1.5">
                <Label>Tipo de Estabelecimento</Label>
                <Select
                  value={estType}
                  onValueChange={(v) => setEstType(v as 'Clínica' | 'Consultório')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clínica">Clínica</SelectItem>
                    <SelectItem value="Consultório">Consultório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nome do Estabelecimento</Label>
                <Input
                  value={estName}
                  onChange={(e) => setEstName(e.target.value)}
                  placeholder="Ex: Clínica Vida Saudável"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="bg-[#3B9169] hover:bg-[#28533D]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
