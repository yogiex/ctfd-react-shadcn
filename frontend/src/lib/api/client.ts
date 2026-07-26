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
} from './mock-data'
import type { MockUser } from './mock-data'

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

const delay = (ms: number = 300) => new Promise((r) => setTimeout(r, ms))

let submissionCount = 0

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

const data = {
  get challenges() { return mockData.challenges },
  get users() { return mockData.users },
  get teams() { return mockData.teams },
  get notifications() { return mockData.notifications },
}

const api = {
  async get<T>(url: string, config?: ApiConfig): Promise<T> {
    await delay()

    if (url === '/challenges') {
      return (config?.params?.view === 'admin' ? data.challenges : data.challenges) as unknown as T
    }
    if (url.match(/^\/challenges\/(\d+)$/)) {
      const id = parseInt(url.match(/^\/challenges\/(\d+)$/)![1])
      const challenge = mockChallengeDetail(id)
      if (!challenge) throw new ApiError('Challenge not found', 404)
      return challenge as unknown as T
    }
    if (url.match(/^\/challenges\/(\d+)\/solves$/)) return [] as unknown as T
    if (url.match(/^\/challenges\/(\d+)\/ratings$/)) return [] as unknown as T
    if (url === '/scoreboard') return mockScoreboard as unknown as T
    if (url.match(/^\/scoreboard\/top\/(\d+)$/)) {
      const count = parseInt(url.match(/^\/scoreboard\/top\/(\d+)$/)![1])
      return mockScoreboard.slice(0, count) as unknown as T
    }
    if (url.match(/^\/users\/(\d+)$/)) {
      const id = parseInt(url.match(/^\/users\/(\d+)$/)![1])
      const { secret: _secret, ...profile } = mockUserProfile(id) as MockUser & Record<string, unknown>
      void _secret
      return profile as unknown as T
    }
    if (url.match(/^\/users\/(\d+)\/solves$/)) return [] as unknown as T
    if (url.match(/^\/users\/(\d+)\/fails$/)) return [] as unknown as T
    if (url.match(/^\/users\/(\d+)\/awards$/)) return [] as unknown as T
    if (url === '/teams') {
      return { data: data.teams, total: data.teams.length, pages: 1 } as unknown as T
    }
    if (url.match(/^\/teams\/(\d+)$/)) {
      const id = parseInt(url.match(/^\/teams\/(\d+)$/)![1])
      return mockTeamProfile(id) as unknown as T
    }
    if (url.match(/^\/teams\/(\d+)\/solves$/)) return [] as unknown as T
    if (url.match(/^\/teams\/(\d+)\/fails$/)) return [] as unknown as T
    if (url.match(/^\/teams\/(\d+)\/awards$/)) return [] as unknown as T
    if (url.match(/^\/teams\/(\d+)\/members$/)) return [] as unknown as T
    if (url === '/notifications') return data.notifications as unknown as T
    if (url.match(/^\/pages/)) {
      const route = config?.params?.route as string | undefined
      const page = mockPages.find((p) => p.route === route)
      if (page) return page as unknown as T
      return mockPages[0] as unknown as T
    }
    if (url === '/configs') return mockConfigs as unknown as T
    if (url === '/brackets') return mockBrackets as unknown as T
    if (url === '/flags/types') return mockFlagTypes as unknown as T
    if (url === '/challenges/types') return mockChallengeTypes as unknown as T
    if (url === '/awards') return [] as unknown as T
    if (url.match(/^\/comments/)) return [] as unknown as T

    console.warn(`[Mock API] Unhandled GET: ${url}`, config)
    return {} as unknown as T
  },

  async post<T>(url: string, _data?: unknown): Promise<T> {
    await delay()

    if (url === '/challenges/attempt') {
      submissionCount++
      if (submissionCount > 3) {
        submissionCount = 0
        return { status: 'ratelimited' as const, message: 'Too fast!' } as unknown as T
      }
      return { status: 'incorrect' as const, message: 'Incorrect flag. Try again.' } as unknown as T
    }
    if (url === '/unlocks') {
      return { id: 1, content: 'This hint is unlocked!' } as unknown as T
    }

    console.warn(`[Mock API] Unhandled POST: ${url}`)
    return {} as unknown as T
  },

  async patch<T>(url: string, _data?: unknown): Promise<T> {
    await delay()
    console.warn(`[Mock API] Unhandled PATCH: ${url}`)
    return {} as unknown as T
  },

  async put<T>(url: string, _data?: unknown): Promise<T> {
    await delay()
    console.warn(`[Mock API] Unhandled PUT: ${url}`)
    return {} as unknown as T
  },

  async delete(_url: string): Promise<void> {
    await delay()
  },

  async upload<T>(url: string, _formData: FormData): Promise<T> {
    await delay()
    console.warn(`[Mock API] Unhandled UPLOAD: ${url}`)
    return {} as unknown as T
  },
}

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
