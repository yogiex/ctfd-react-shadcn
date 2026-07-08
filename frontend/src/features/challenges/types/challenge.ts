export interface ChallengeListItem {
  id: number
  type: string
  name: string
  value: number
  solves: number | null
  solved_by_me: boolean
  category: string
  tags: { value: string }[]
}

export interface ChallengeDetail {
  id: number
  name: string
  value: number
  category: string
  description: string
  connection_info: string | null
  attribution: string | null
  next_id: number | null
  max_attempts: number
  state: 'visible' | 'hidden'
  solves: number | null
  solved_by_me: boolean
  attempts: number
  files: string[]
  tags: string[]
  hints: { id: number; cost: number; title?: string; content?: string }[]
  view: string
  script: string | null
  solution_id: number | null
  solution_state: 'hidden' | 'visible' | 'solved'
  rating: { value: number; review: string } | null
  ratings: { up: number; down: number; count: number } | null
}

export interface ChallengeAttempt {
  challenge_id: number
  submission: string
}

export interface AttemptResponse {
  status: 'correct' | 'incorrect' | 'already_solved' | 'ratelimited' | 'paused'
  message: string
}

export interface ChallengeSolve {
  account_id: number
  account_url: string
  name: string
  date: string
}
