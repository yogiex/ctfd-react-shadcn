export interface InitialData {
  urlRoot: string
  csrfNonce: string
  userMode: 'users' | 'teams'
  userId: number | null
  userName: string | null
  userEmail: string | null
  userVerified: boolean
  teamId: number | null
  teamName: string | null
  start: string | null
  end: string | null
  themeSettings: Record<string, any>
}

export interface PaginationMeta {
  page: number
  next: number | null
  prev: number | null
  pages: number
  per_page: number
  total: number
}
