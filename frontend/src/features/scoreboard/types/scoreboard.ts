export interface ScoreboardEntry {
  pos: number
  account_id: number
  account_url: string
  account_type: 'users' | 'teams'
  oauth_id: number | null
  name: string
  score: number
  bracket_id: number | null
  bracket_name: string | null
  members?: { id: number; name: string; score: number }[]
}

export interface ScoreboardDetailEntry {
  id: number
  account_url: string
  name: string
  score: number
  bracket_id: number | null
  bracket_name: string | null
  solves: { challenge_id: number; value: number; date: string }[]
}

export interface Bracket {
  id: number
  name: string
  description: string | null
  type: 'users' | 'teams'
}
