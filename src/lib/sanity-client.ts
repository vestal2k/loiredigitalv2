import { sanityClient } from '@/lib/sanity'

// Types pour les clients
export interface SanityClient {
  _id: string
  _type: 'client'
  email: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  passwordHash: string
  createdAt: string
  isActive: boolean
}

// Types pour les projets clients
export interface SanityClientProject {
  _id: string
  _type: 'clientProject'
  client: {
    _ref: string
  }
  title: string
  description?: string
  pack: 'starter' | 'essentiel' | 'premium' | 'ecommerce'
  status:
    | 'pending-payment'
    | 'design'
    | 'development'
    | 'review'
    | 'completed'
    | 'deployed'
  progress: number
  totalAmount: number
  paidAmount: number
  paymentType?: 'full' | 'deposit'
  stripeSessionId?: string
  startDate?: string
  estimatedDelivery?: string
  deliveryDate?: string
  mockups?: Array<{
    title: string
    image: any
    status: 'pending' | 'approved' | 'revision'
    feedback?: string
    uploadedAt: string
  }>
  invoices?: Array<{
    invoiceNumber: string
    amount: number
    type: 'deposit' | 'balance' | 'full'
    status: 'pending' | 'paid' | 'overdue'
    pdfUrl?: string
    issuedAt: string
    paidAt?: string
  }>
  updates?: Array<{
    message: string
    createdAt: string
  }>
  notes?: string
}

/**
 * Récupérer un client par email
 */
export async function getClientByEmail(email: string): Promise<SanityClient | null> {
  const query = `*[_type == "client" && email == $email][0]`
  const client = await sanityClient.fetch<SanityClient>(query, { email })
  return client || null
}

/**
 * Récupérer un client par ID
 */
export async function getClientById(id: string): Promise<SanityClient | null> {
  const query = `*[_type == "client" && _id == $id][0]`
  const client = await sanityClient.fetch<SanityClient>(query, { id })
  return client || null
}

/**
 * Créer un nouveau client
 */
export async function createClient(data: {
  email: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  passwordHash: string
}): Promise<SanityClient> {
  const doc: Omit<SanityClient, '_id'> = {
    _type: 'client',
    ...data,
    createdAt: new Date().toISOString(),
    isActive: true,
  }

  const result = await sanityClient.create(doc)
  return result as SanityClient
}

/**
 * Mettre à jour le mot de passe d'un client
 */
export async function updateClientPassword(
  clientId: string,
  passwordHash: string,
): Promise<void> {
  await sanityClient.patch(clientId).set({ passwordHash }).commit()
}

/**
 * Récupérer tous les projets d'un client
 */
export async function getClientProjects(clientId: string): Promise<SanityClientProject[]> {
  const query = `*[_type == "clientProject" && client._ref == $clientId] | order(_createdAt desc)`
  const projects = await sanityClient.fetch<SanityClientProject[]>(query, { clientId })
  return projects
}

/**
 * Récupérer un projet par ID
 */
export async function getProjectById(projectId: string): Promise<SanityClientProject | null> {
  const query = `*[_type == "clientProject" && _id == $projectId][0]`
  const project = await sanityClient.fetch<SanityClientProject>(query, { projectId })
  return project || null
}

/**
 * Créer un nouveau projet client
 */
export async function createClientProject(
  clientId: string,
  data: {
    title: string
    description?: string
    pack: 'starter' | 'essentiel' | 'premium' | 'ecommerce'
    totalAmount: number
    paidAmount?: number
    paymentType?: 'full' | 'deposit'
    stripeSessionId?: string
  },
): Promise<SanityClientProject> {
  const doc = {
    _type: 'clientProject',
    client: {
      _type: 'reference',
      _ref: clientId,
    },
    status: 'pending-payment' as const,
    progress: 0,
    paidAmount: data.paidAmount || 0,
    ...data,
  }

  const result = await sanityClient.create(doc)
  return result as SanityClientProject
}

/**
 * Mettre à jour le statut d'un projet
 */
export async function updateProjectStatus(
  projectId: string,
  status: SanityClientProject['status'],
  progress?: number,
): Promise<void> {
  const patch = sanityClient.patch(projectId).set({ status })

  if (progress !== undefined) {
    patch.set({ progress })
  }

  await patch.commit()
}

/**
 * Ajouter une mise à jour à un projet
 */
export async function addProjectUpdate(projectId: string, message: string): Promise<void> {
  const update = {
    message,
    createdAt: new Date().toISOString(),
  }

  await sanityClient
    .patch(projectId)
    .setIfMissing({ updates: [] })
    .append('updates', [update])
    .commit()
}

/**
 * Mettre à jour le feedback d'une maquette
 */
export async function updateMockupFeedback(
  projectId: string,
  mockupIndex: number,
  feedback: string,
  status: 'pending' | 'approved' | 'revision',
): Promise<void> {
  await sanityClient
    .patch(projectId)
    .set({
      [`mockups[${mockupIndex}].feedback`]: feedback,
      [`mockups[${mockupIndex}].status`]: status,
    })
    .commit()
}

/**
 * Ajouter une facture à un projet
 */
export async function addInvoice(
  projectId: string,
  invoice: {
    invoiceNumber: string
    amount: number
    type: 'deposit' | 'balance' | 'full'
    status: 'pending' | 'paid' | 'overdue'
    pdfUrl?: string
    issuedAt: string
  },
): Promise<void> {
  await sanityClient
    .patch(projectId)
    .setIfMissing({ invoices: [] })
    .append('invoices', [invoice])
    .commit()
}

/**
 * Marquer une facture comme payée
 */
export async function markInvoiceAsPaid(
  projectId: string,
  invoiceIndex: number,
): Promise<void> {
  await sanityClient
    .patch(projectId)
    .set({
      [`invoices[${invoiceIndex}].status`]: 'paid',
      [`invoices[${invoiceIndex}].paidAt`]: new Date().toISOString(),
    })
    .commit()
}
