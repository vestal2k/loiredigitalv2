export interface Client {
  _id: string
  email: string
  name: string
  company?: string
  phone?: string
  passwordHash: string
  createdAt: string
}

export interface ClientProject {
  _id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  client: {
    _ref: string
  }
  mockups?: Mockup[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Mockup {
  _key: string
  title: string
  image?: any
  status: 'pending' | 'approved' | 'revision'
  feedback?: string
  version: number
}
