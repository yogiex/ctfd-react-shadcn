import { useEffect, useRef } from 'react'

interface PluginScriptLoaderProps {
  scripts: string[]
  onLoaded?: () => void
}

export function PluginScriptLoader({ scripts, onLoaded }: PluginScriptLoaderProps) {
  const loaded = useRef<Set<string>>(new Set())

  useEffect(() => {
    const loadScripts = async () => {
      const promises = scripts.map((src) => {
        if (loaded.current.has(src)) return Promise.resolve()
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = src
          script.onload = () => {
            loaded.current.add(src)
            resolve()
          }
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
          document.body.appendChild(script)
        })
      })
      await Promise.allSettled(promises)
      onLoaded?.()
    }
    loadScripts()
    return () => {
      scripts.forEach((src) => {
        const el = document.querySelector(`script[src="${src}"]`)
        if (el) el.remove()
      })
    }
  }, [scripts.join(',')])

  return null
}
