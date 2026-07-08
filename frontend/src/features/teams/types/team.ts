export interface TeamCreateInput {
  name: string
  password: string
  website?: string
  affiliation?: string
  country?: string
  bracket_id?: number
}

export interface TeamJoinInput {
  name: string
  password: string
}
