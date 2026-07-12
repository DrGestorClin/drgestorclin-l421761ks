import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  doctor_ref?: string
  force_password_change?: boolean
}

import { getDoctor, type Doctor } from '@/services/doctors'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  isClinica: boolean
  isDoctor: boolean
  doctorId: string | null
  doctor: Doctor | null
  forcePasswordChange: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any; forcePasswordChange?: boolean }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signInWith: (provider: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(
    pb.authStore.isValid ? (pb.authStore.record as unknown as AuthUser) : null,
  )
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.doctor_ref) {
      getDoctor(user.doctor_ref)
        .then(setDoctor)
        .catch(() => setDoctor(null))
    } else {
      setDoctor(null)
    }
  }, [user?.doctor_ref])

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? (record as unknown as AuthUser) : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch((err: any) => {
          if (err?.status === 401 || err?.status === 403) {
            pb.authStore.clear()
          }
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      const record = pb.authStore.record as unknown as AuthUser
      return { error: null, forcePasswordChange: !!record?.force_password_change }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        role: 'Assistente',
      })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signInWith = async (provider: string) => {
    try {
      await pb.collection('users').authWithOAuth2({ provider })
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const isAdmin = user?.role === 'ADM'
  const isClinica = user?.role === 'Clinica'
  const isDoctor = user?.role === 'Medico'
  const doctorId = user?.doctor_ref || null
  const forcePasswordChange = !!user?.force_password_change

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isClinica,
        isDoctor,
        doctorId,
        doctor,
        forcePasswordChange,
        signIn,
        signUp,
        signInWith,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
