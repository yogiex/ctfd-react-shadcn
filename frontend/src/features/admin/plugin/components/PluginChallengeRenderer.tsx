import { useRef } from 'react'
import DOMPurify from 'dompurify'
import { PluginScriptLoader } from './PluginScriptLoader'

interface PluginChallengeRendererProps {
  html: string
  scripts?: string[]
}

export function PluginChallengeRenderer({ html, scripts = [] }: PluginChallengeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sanitized = DOMPurify.sanitize(html)

  return (
    <>
      <div
        ref={containerRef}
        className="plugin-content"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
      {scripts.length > 0 && <PluginScriptLoader scripts={scripts} />}
    </>
  )
}
