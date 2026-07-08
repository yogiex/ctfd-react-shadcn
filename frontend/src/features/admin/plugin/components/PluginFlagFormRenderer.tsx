import DOMPurify from 'dompurify'

interface PluginFlagFormRendererProps {
  html: string
}

export function PluginFlagFormRenderer({ html }: PluginFlagFormRendererProps) {
  return (
    <div
      className="plugin-flag-form"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}
