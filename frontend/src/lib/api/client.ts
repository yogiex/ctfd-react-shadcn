import {
  mockChallenges,
  mockChallengeDetail,
  mockScoreboard,
  mockUsers,
  mockUserProfile,
  mockTeams,
  mockTeamProfile,
  mockNotifications,
  mockPages,
  mockConfigs,
  mockBrackets,
  mockFlagTypes,
  mockChallengeTypes,
  type MockUser,
} from './mock-data'

export interface InitialData {
  urlRoot: string
  csrfNonce: string
  userMode: string
  userId: number | null
  userName: string | null
  userEmail: string | null
  userVerified: boolean
  teamId: number | null
  teamName: string | null
  start: string | null
  end: string | null
  themeSettings: Record<string, string>
  isAdmin: boolean
  version: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Simulate network delay
const delay = (ms: number = 300) => new Promise((r) => setTimeout(r, ms))

// Track submission state
let submissionCount = 0

// Mock data store (mutable for mutation simulation)
let mockData = {
  challenges: [...mockChallenges],
  users: [...mockUsers],
  teams: [...mockTeams],
  notifications: [...mockNotifications],
}



interface ApiConfig {
  params?: Record<string, string | number | undefined>
  headers?: Record<string, string>
}

const api = {
  async get<T>(url: string, config?: ApiConfig): Promise<{ data: T }> {
    await delay()

    // Route matching
    if (url === '/challenges' && config?.params?.view === 'admin') {
      return { data: mockData.challenges as unknown as T }
    }
    if (url === '/challenges') {
      return { data: mockData.challenges as unknown as T }
    }
    if (url.match(/^\/challenges\/(\d+)$/)) {
      const id = parseInt(url.match(/^\/challenges\/(\d+)$/)![1])
      const challenge = mockChallengeDetail(id)
      if (!challenge) throw new ApiError('Challenge not found', 404)
      return { data: challenge as unknown as T }
    }
    if (url.match(/^\/challenges\/(\d+)\/solves$/)) {
      return { data: [] as unknown as T }
    }
    if (url.match(/^\/challenges\/(\d+)\/ratings$/)) {
      return { data: [] as unknown as T }
    }
    if (url === '/scoreboard') {
      return { data: mockScoreboard as unknown as T }
    }
    if (url.match(/^\/scoreboard\/top\/(\d+)$/)) {
      return { data: mockScoreboard.slice(0, parseInt(url.match(/^\/scoreboard\/top\/(\d+)$/)![1])) as unknown as T }
    }
    if (url === '/users' && config?.params?.view === 'admin') {
      return { data: { data: mockData.users, total: mockData.users.length, pages: 1 } as unknown as T }
    }
    if (url === '/users') {
      return { data: { data: mockData.users, total: mockData.users.length, pages: 1 } as unknown as T }
    }
    if (url.match(/^\/users\/(\d+)$/)) {
      const id = parseInt(url.match(/^\/users\/(\d+)$/)![1])
      const { secret: _secret, ...profile } = mockUserProfile(id) as MockUser & Record<string, unknown>
      void _secret
      return { data: profile as unknown as T }
    }
    if (url.match(/^\/users\/(\d+)\/solves$/)) return { data: [] as unknown as T }
    if (url.match(/^\/users\/(\d+)\/fails$/)) return { data: [] as unknown as T }
    if (url.match(/^\/users\/(\d+)\/awards$/)) return { data: [] as unknown as T }
    if (url === '/teams' && config?.params?.view === 'admin') {
      return { data: { data: mockData.teams, total: mockData.teams.length, pages: 1 } as unknown as T }
    }
    if (url === '/teams') {
      return { data: { data: mockData.teams, total: mockData.teams.length, pages: 1 } as unknown as T }
    }
    if (url.match(/^\/teams\/(\d+)$/)) {
      const id = parseInt(url.match(/^\/teams\/(\d+)$/)![1])
      return { data: mockTeamProfile(id) as unknown as T }
    }
    if (url.match(/^\/teams\/(\d+)\/solves$/)) return { data: [] as unknown as T }
    if (url.match(/^\/teams\/(\d+)\/fails$/)) return { data: [] as unknown as T }
    if (url.match(/^\/teams\/(\d+)\/awards$/)) return { data: [] as unknown as T }
    if (url.match(/^\/teams\/(\d+)\/members$/)) return { data: [] as unknown as T }
    if (url === '/notifications') {
      return { data: mockData.notifications as unknown as T }
    }
    if (url.match(/^\/pages/)) {
      const route = config?.params?.route as string | undefined
      const page = mockPages.find((p) => p.route === route)
      if (page) return { data: page as unknown as T }
      return { data: mockPages[0] as unknown as T }
    }
    if (url === '/configs') return { data: mockConfigs as unknown as T }
    if (url === '/brackets') return { data: mockBrackets as unknown as T }
    if (url === '/flags/types') return { data: mockFlagTypes as unknown as T }
    if (url === '/challenges/types') return { data: mockChallengeTypes as unknown as T }
    if (url === '/awards') return { data: [] as unknown as T }
    if (url.match(/^\/comments/)) return { data: [] as unknown as T }
    if (url === '/submissions') return { data: { data: [], total: 0, pages: 0 } as unknown as T }

    // Fallback: return empty
    console.warn(`[Mock API] Unhandled GET: ${url}`, config)
    return { data: {} as unknown as T }
  },

  async post<T>(url: string, _data?: unknown): Promise<{ data: T }> {
    await delay()

    if (url === '/challenges/attempt') {
      submissionCount++
      // Simulate rate limiting after 3 attempts
      if (submissionCount > 3) {
        submissionCount = 0
        return { data: { status: 'ratelimited', message: 'Too fast!' } as unknown as T }
      }
      return {
        data: { status: 'incorrect', message: 'Incorrect flag. Try again.' } as unknown as T,
      }
    }
    if (url === '/unlocks') {
      return { data: { id: 1, content: 'This hint is unlocked! The flag is in the source code.' } as unknown as T }
    }

    console.warn(`[Mock API] Unhandled POST: ${url}`)
    return { data: {} as unknown as T }
  },

  async patch<T>(url: string, _data?: unknown): Promise<{ data: T }> {
    await delay()
    console.warn(`[Mock API] Unhandled PATCH: ${url}`)
    return { data: {} as unknown as T }
  },

  async put<T>(url: string, _data?: unknown): Promise<{ data: T }> {
    await delay()
    console.warn(`[Mock API] Unhandled PUT: ${url}`)
    return { data: {} as unknown as T }
  },

  async delete(_url: string): Promise<void> {
    await delay()
    console.warn(`[Mock API] Unhandled DELETE`)
  },

  async upload<T>(url: string, _formData: FormData): Promise<{ data: T }> {
    await delay()
    console.warn(`[Mock API] Unhandled UPLOAD: ${url}`)
    return { data: {} as unknown as T }
  },
}

// Cache init data so it's only "fetched" once
let cachedInitData: InitialData | null = null

export function getInitData(): InitialData {
  if (cachedInitData) return cachedInitData
  cachedInitData = {
    urlRoot: '',
    csrfNonce: 'static-site-csrf-nonce',
    userMode: 'users',
    userId: null,
    userName: null,
    userEmail: null,
    userVerified: false,
    teamId: null,
    teamName: null,
    start: null,
    end: null,
    themeSettings: {},
    isAdmin: false,
    version: '4.0.0-dev',
  }
  return cachedInitData
}

export function getCsrfNonce(): string {
  return getInitData().csrfNonce
}

export async function preloadInitData(): Promise<void> {
  await delay(100)
  getInitData()
}

export { api }
