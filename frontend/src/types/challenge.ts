export interface Challenge {
  id: number
  type: string
  name: string
  description: string
  attribution: string
  connection_info: string | null
  next_id: number | null
  max_attempts: number
  value: number
  category: string
  state: 'visible' | 'hidden'
  solves: number | null
  solved_by_me: boolean
  attempts: number
  files: string[]
  tags: string[]
  hints: Partial<Hint>[]
  view: string
  template: string
  script: string
  solution_id: number | null
  solution_state: 'hidden' | 'visible' | 'solved'
  rating: { value: number; review: string } | null
  ratings: { up: number; down: number; count: number } | null
}

export interface Hint {
  id: number
  type: 'standard' | 'paid'
  challenge_id: number
  content: string
  cost: number
  requirements: { prerequisites: number[] }
}

export interface ChallengeAttempt {
  challenge_id: number
  submission: string
}

export interface AttemptResponse {
  status: 'correct' | 'incorrect' | 'already_solved' | 'ratelimited' | 'paused'
  message: string
}
