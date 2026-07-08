import { useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'

interface ChallengeDescriptionRendererProps {
  html: string
  scripts?: string[]
}

function cleanLegacyHtml(html: string): string {
  if (!html) return ''

  // Create DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // Remove entire legacy sections
  body.querySelectorAll('form, table, script, style, link, nav, ul.nav, [id="ratings"], [id="comments"]').forEach(el => el.remove())

  // Remove h2/h3 (duplicate title/value from legacy)
  body.querySelectorAll('h2, h3').forEach(el => el.remove())

  // Remove leaf elements that contain ONLY a digit (legacy solve counts)
  body.querySelectorAll('div, span, p, b, strong, small').forEach(el => {
    if (!el.children.length && /^\d+$/.test(el.textContent?.trim() || '')) {
      el.remove()
    }
  })

  // Walk text nodes and remove bare number text
  const walk = document.createNodeIterator(body, 4 /* NodeFilter.SHOW_TEXT */)
  let node: Node | null
  while ((node = walk.nextNode())) {
    if ((node.textContent || '').trim().match(/^\d+$/)) {
      node.parentNode?.removeChild(node)
    }
  }

  // Remove empty wrappers
  body.querySelectorAll('div, span, p').forEach(el => {
    if (!el.textContent?.trim() && !el.querySelector('img, a, br, iframe')) {
      el.remove()
    }
  })

  return body.innerHTML.trim()
}

export function ChallengeDescriptionRenderer({ html, scripts = [] }: ChallengeDescriptionRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanHtml = cleanLegacyHtml(html)
  const sanitized = DOMPurify.sanitize(cleanHtml)

  useEffect(() => {
    if (!containerRef.current || scripts.length === 0) return
    const loaded: HTMLScriptElement[] = []
    scripts.forEach((src) => {
      if (document.querySelector(`script[src="${src}"]`)) return
      const script = document.createElement('script')
      script.src = src
      script.async = true
      document.body.appendChild(script)
      loaded.push(script)
    })
    return () => {
      loaded.forEach((s) => s.remove())
    }
  }, [scripts.join(',')])

  if (!sanitized) {
    return <p className="text-sm text-muted-foreground py-4">No description available.</p>
  }

  return (
    <div
      ref={containerRef}
      className="challenge-description prose prose-sm dark:prose-invert max-w-none [&_input]:hidden [&_button]:hidden [&_form]:hidden [&_table]:hidden"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
