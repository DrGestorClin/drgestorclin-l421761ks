export const passwordRules = [
  { test: (p: string) => p.length >= 8, label: 'Mínimo de 8 caracteres' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Pelo menos uma letra minúscula' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Pelo menos uma letra maiúscula' },
  { test: (p: string) => /[0-9]/.test(p), label: 'Pelo menos um número' },
  {
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
    label: 'Pelo menos um caractere especial',
  },
]

export const validatePassword = (password: string): boolean =>
  passwordRules.every((rule) => rule.test(password))
