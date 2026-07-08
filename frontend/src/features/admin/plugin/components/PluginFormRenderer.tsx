import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { PluginScriptLoader } from './PluginScriptLoader'

interface PluginFormRendererProps {
  html: string
  scripts?: string[]
  onSubmit?: (data: Record<string, any>) => void
}

export function PluginFormRenderer({ html, scripts = [], onSubmit }: PluginFormRendererProps) {
  const sanitized = DOMPurify.sanitize(html)

  useEffect(() => {
    if (!onSubmit) return
    const handler = (e: Event) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const data = new FormData(form)
      const obj: Record<string, any> = {}
      data.forEach((value, key) => { obj[key] = value })
      onSubmit(obj)
    }
    const form = document.querySelector('.plugin-form')
    form?.addEventListener('submit', handler)
    return () => form?.removeEventListener('submit', handler)
  }, [html, onSubmit])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
      {scripts.length > 0 && <PluginScriptLoader scripts={scripts} />}
    </>
  )
}
