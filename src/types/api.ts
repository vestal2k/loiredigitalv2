export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  client?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  consent: boolean
}
