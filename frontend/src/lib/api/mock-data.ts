// Types
export interface MockChallenge {
  id: number
  name: string
  category: string
  value: number
  type: string
  state: 'visible' | 'hidden'
  solved_by_me: boolean
  position: number
}

export interface MockChallengeDetail extends MockChallenge {
  description: string
  connection_info: string | null
  next_id: number | null
  hints: { id: number; cost: number; content?: string }[]
  files: { url: string }[]
  tags: { value: string }[]
  view: string
}

export interface MockScoreboardEntry {
  pos: number
  account_id: number
  name: string
  score: number
  member_count?: number
}

export interface MockUser {
  id: number
  name: string
  email?: string
  score: number
  banned: boolean
  hidden: boolean
}

export interface MockTeam {
  id: number
  name: string
  email?: string
  score: number
  banned: boolean
  hidden: boolean
  member_count: number
}

export interface MockNotification {
  id: number
  title: string
  content: string
  date: string
}

export interface MockPage {
  id: number
  title: string
  route: string
  content: string
  format: 'markdown' | 'html'
  auth_required: boolean
  draft: boolean
}

// Mock Data
export const mockChallenges: MockChallenge[] = [
  { id: 1, name: 'SQL Injection 101', category: 'Web Exploitation', value: 100, type: 'standard', state: 'visible', solved_by_me: false, position: 1 },
  { id: 2, name: 'XSS Playground', category: 'Web Exploitation', value: 150, type: 'standard', state: 'visible', solved_by_me: false, position: 2 },
  { id: 3, name: 'Buffer Overflow Basics', category: 'Binary Exploitation', value: 200, type: 'standard', state: 'visible', solved_by_me: false, position: 3 },
  { id: 4, name: 'Steganography 101', category: 'Forensics', value: 100, type: 'standard', state: 'visible', solved_by_me: false, position: 4 },
  { id: 5, name: 'Reverse Engineering 101', category: 'Reverse Engineering', value: 250, type: 'standard', state: 'visible', solved_by_me: false, position: 5 },
  { id: 6, name: 'Cryptography Basics', category: 'Cryptography', value: 150, type: 'standard', state: 'visible', solved_by_me: false, position: 6 },
  { id: 7, name: 'OSINT Challenge', category: 'OSINT', value: 175, type: 'standard', state: 'visible', solved_by_me: false, position: 7 },
  { id: 8, name: 'Privilege Escalation', category: 'Misc', value: 300, type: 'standard', state: 'visible', solved_by_me: false, position: 8 },
]

export const mockChallengeDetail = (id: number): MockChallengeDetail | null => {
  const challenge = mockChallenges.find((c) => c.id === id)
  if (!challenge) return null

  const descriptions: Record<number, string> = {
    1: `<h3>SQL Injection 101</h3><p>Find the SQL injection vulnerability in the login form and extract the admin password.</p><p><strong>Hint:</strong> Try <code>' OR '1'='1</code> as the username.</p>`,
    2: `<h3>XSS Playground</h3><p>Exploit the stored XSS vulnerability in the comment section to steal the admin's cookie.</p>`,
    3: `<h3>Buffer Overflow Basics</h3><p>Analyze the binary and craft a payload to overflow the buffer and call the win function.</p><p>Connection: <code>nc challenge.ctfd.local 1337</code></p>`,
    4: `<h3>Steganography 101</h3><p>An image file contains a hidden message. Use stego tools to extract the flag.</p>`,
    5: `<h3>Reverse Engineering 101</h3><p>Decompile the provided binary and find the hidden flag in the code.</p>`,
    6: `<h3>Cryptography Basics</h3><p>A message was encrypted with a simple substitution cipher. Decrypt it to reveal the flag.</p>`,
    7: `<h3>OSINT Challenge</h3><p>Use open-source intelligence techniques to find the hidden information about the target.</p>`,
    8: `<h3>Privilege Escalation</h3><p>Find and exploit a misconfiguration to escalate privileges on the system.</p>`,
  }

  return {
    ...challenge,
    description: descriptions[id] || '<p>Challenge description not available.</p>',
    connection_info: [3].includes(id) ? 'nc challenge.ctfd.local 1337' : null,
    next_id: id < 8 ? id + 1 : null,
    hints: [
      { id: 1, cost: 0 },
      { id: 2, cost: 50, content: 'Look more carefully at the request parameters.' },
    ],
    files: [],
    tags: [{ value: challenge.category.toLowerCase().replace(' ', '-') }],
    view: '<p>Challenge rendered via plugin.</p>',
  }
}

export const mockScoreboard: MockScoreboardEntry[] = [
  { pos: 1, account_id: 1, name: 'h4ck3r_1', score: 2850 },
  { pos: 2, account_id: 2, name: 'pwn_master', score: 2600 },
  { pos: 3, account_id: 3, name: 'crypto_queen', score: 2400 },
  { pos: 4, account_id: 4, name: 'binary_ninja', score: 2100 },
  { pos: 5, account_id: 5, name: 'root_user', score: 1950 },
]

export const mockUsers: MockUser[] = [
  { id: 1, name: 'h4ck3r_1', email: 'hacker1@ctfd.local', score: 2850, banned: false, hidden: false },
  { id: 2, name: 'pwn_master', email: 'pwn@ctfd.local', score: 2600, banned: false, hidden: false },
  { id: 3, name: 'crypto_queen', email: 'crypto@ctfd.local', score: 2400, banned: false, hidden: false },
  { id: 4, name: 'binary_ninja', email: 'binary@ctfd.local', score: 2100, banned: false, hidden: false },
  { id: 5, name: 'root_user', email: 'root@ctfd.local', score: 1950, banned: false, hidden: false },
  { id: 6, name: 'zeus', email: 'zeus@ctfd.local', score: 500, banned: true, hidden: false },
  { id: 7, name: 'hidden_player', email: 'hidden@ctfd.local', score: 300, banned: false, hidden: true },
]

export const mockUserProfile = (id: number) => {
  const user = mockUsers.find((u) => u.id === id)
  if (!user) return mockUsers[0]
  return {
    ...user,
    secret: '********',
    website: null,
    affiliation: 'CTF Player',
    country: 'ID',
    bracket: null,
    created: '2025-01-15T08:00:00Z',
  }
}

export const mockTeams: MockTeam[] = [
  { id: 1, name: 'The A Team', email: 'ateam@ctfd.local', score: 5000, banned: false, hidden: false, member_count: 4 },
  { id: 2, name: 'Cyber Warriors', email: 'cw@ctfd.local', score: 4200, banned: false, hidden: false, member_count: 3 },
  { id: 3, name: 'Null Bytes', email: 'null@ctfd.local', score: 3800, banned: false, hidden: false, member_count: 5 },
  { id: 4, name: 'Shell Shocked', score: 3100, banned: false, hidden: false, member_count: 2 },
]

export const mockTeamProfile = (id: number) => {
  const team = mockTeams.find((t) => t.id === id)
  if (!team) return mockTeams[0]
  return {
    ...team,
    website: null,
    affiliation: 'CTF Club',
    country: 'ID',
    bracket: null,
    created: '2025-01-20T10:00:00Z',
    captain_id: 1,
  }
}

export const mockNotifications: MockNotification[] = [
  { id: 1, title: 'Welcome!', content: 'Welcome to the CTFd React Static Demo. This is a showcase of the React frontend refactoring project.', date: '2026-07-26T08:00:00Z' },
  { id: 2, title: 'Challenge Update', content: 'New challenges added: SQL Injection 101, XSS Playground, and more!', date: '2026-07-26T09:00:00Z' },
  { id: 3, title: 'Maintenance Notice', content: 'The platform will be down for maintenance on Sunday at 2:00 AM UTC.', date: '2026-07-26T10:00:00Z' },
]

export const mockPages: MockPage[] = [
  { id: 1, title: 'About', route: 'about', content: '<h2>About CTFd</h2><p>CTFd is a Capture The Flag framework.</p>', format: 'html', auth_required: false, draft: false },
  { id: 2, title: 'Rules', route: 'rules', content: '<h2>Rules</h2><ol><li>No flag sharing</li><li>No DoS attacks</li></ol>', format: 'html', auth_required: false, draft: false },
  { id: 3, title: 'Privacy', route: 'privacy', content: '<h2>Privacy Policy</h2><p>Your data is safe with us.</p>', format: 'html', auth_required: false, draft: false },
]

export const mockConfigs: Record<string, string | boolean | number | null> = {
  ctf_name: 'CTFd Demo',
  ctf_description: 'CTFd React Refactoring Demo',
  user_mode: 'users',
  challenge_visibility: 'public',
  registration_visibility: 'public',
  score_visibility: 'public',
  account_visibility: 'public',
  start: null,
  end: null,
  verify_emails: false,
  team_size: 5,
  num_teams: 0,
  num_users: 7,
  num_challenges: 8,
  num_submissions: 150,
  num_solves: 42,
}

export const mockBrackets = {
  users: { groups: [], brackets: [] },
  teams: { groups: [], brackets: [] },
}

export const mockFlagTypes = [
  { id: 1, name: 'static', templates: { create: '<p>Static flag form</p>' } },
  { id: 2, name: 'regex', templates: { create: '<p>Regex flag form</p>' } },
]

export const mockChallengeTypes = [
  { id: 1, name: 'standard', templates: { create: '<p>Standard challenge form</p>' } },
  { id: 2, name: 'dynamic', templates: { create: '<p>Dynamic challenge form</p>' } },
]
