import { useQuery } from '@tanstack/react-query'

export interface ImportStatus {
  status: string | null
  startTime: string | null
  endTime: string | null
  error: string | null
}

export function useImportStatus() {
  return useQuery<ImportStatus>({
    queryKey: ['admin', 'import', 'status'],
    queryFn: async () => {
      const res = await fetch('/admin/import')
      const html = await res.text()
      return {
        status: extractMatch(html, /<b>Current Status:<\/b>\s*(.*?)\s*<\//),
        startTime: extractMatch(html, /id="start-time">(.*?)<\//),
        endTime: extractMatch(html, /id="end-time">(.*?)<\//),
        error: extractError(html),
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.endTime && data.endTime !== 'None') return false
      return 5000
    },
  })
}

function extractMatch(html: string, regex: RegExp): string | null {
  const m = html.match(regex)
  return m ? m[1].trim() : null
}

function extractError(html: string): string | null {
  const m = html.match(/<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/)
  return m ? m[1].trim().replace(/<[^>]*>/g, '') : null
}
