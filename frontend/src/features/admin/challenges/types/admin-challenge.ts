export interface AdminChallenge {
  id: number
  name: string
  category: string
  value: number
  type: string
  state: 'visible' | 'hidden'
  solves: number
}

export interface AdminChallengeDetail {
  id: number
  name: string
  category: string
  value: number
  type: string
  state: 'visible' | 'hidden'
  description: string
  connection_info: string | null
  attribution: string | null
  next_id: number | null
  max_attempts: number
  position: number
  solves: number
  solution_id: number | null
  solution_state: 'hidden' | 'visible' | 'solved' | null
  requirements: { prerequisites: number[]; anonymize: boolean } | null
  view: string
  script: string | null
}

export interface ChallengeType {
  id: string
  name: string
  type: string
}

export interface Flag {
  id: number
  challenge_id: number
  type: 'static' | 'regex' | 'token'
  content: string
  data: string
}

export interface FlagFormData {
  challenge_id: number
  type: 'static' | 'regex' | 'token'
  content: string
  data?: string
}

export interface Hint {
  id: number
  challenge_id: number
  type: string
  title: string
  content: string
  cost: number
  requirements: number[]
}

export interface HintFormData {
  challenge_id: number
  type?: string
  title: string
  content: string
  cost: number
  requirements?: number[]
}

export interface ChallengeFile {
  id: number
  challenge_id: number
  location: string
  sha1sum: string
}

export interface Tag {
  id: number
  challenge_id: number
  value: string
}

export interface Topic {
  id: number
  challenge_id: number
  value: string
}

export interface Requirements {
  prerequisites: number[]
  anonymize: boolean
}

export interface Solution {
  id: number
  challenge_id: number
  content: string
  state: 'hidden' | 'visible' | 'solved'
}

export interface SolutionFormData {
  challenge_id: number
  content: string
  state: 'hidden' | 'visible' | 'solved'
}

export interface Comment {
  id: number
  type: string
  content: string
  author: string
  author_id: number
  date: string
}

export interface CommentFormData {
  challenge_id: number
  content: string
  author?: string
  type?: string
}

export interface Rating {
  id: number
  user: string
  user_id: number
  value: number
  review: string
  date: string
}

export interface PaginatedResponse<T> {
  results: T[]
  pagination: {
    page: number
    next: number | null
    prev: number | null
    pages: number
    per_page: number
    total: number
  }
}
