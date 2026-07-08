export interface User {
  id: number
  name: string
  email?: string
  website: string | null
  affiliation: string | null
  country: string | null
  bracket_id: number | null
  bracket_name: string | null
  fields: { id: number; value: string; name: string; type: string }[]
  place: number | null
  score: number | null
}

export interface Team {
  id: number
  name: string
  email?: string
  website: string | null
  affiliation: string | null
  country: string | null
  bracket_id: number | null
  bracket_name: string | null
  captain_id: number
  members: { id: number; name: string; score: number }[]
  fields: { id: number; value: string; name: string; type: string }[]
  place: number | null
  score: number | null
}
