import { useEffect, useState } from 'react'
import { getModule } from './data'
import type { Mode } from './types'
import Home from './screens/Home'
import ModuleSetup from './screens/ModuleSetup'
import Play from './screens/Play'
import Tour from './screens/Tour'

// Hash routing so every module and mode is linkable and back works.
// Routes:  #/  ·  #/m/:id  ·  #/m/:id/:mode

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export function navigate(to: string) {
  window.location.hash = to
}

const MODES: Mode[] = ['learn', 'explore', 'drill', 'sprint', 'review']

export default function App() {
  const hash = useHash()
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)

  if (parts[0] === 'tour') {
    return <Tour />
  }
  if (parts[0] === 'm' && parts[1]) {
    const mod = getModule(parts[1])
    if (mod) {
      const mode = parts[2] as Mode | undefined
      if (mode && MODES.includes(mode)) {
        // key forces a clean remount when mode or module changes
        return <Play key={`${mod.id}:${mode}:${parts[3] ?? ''}`} mod={mod} mode={mode} initialItemId={parts[3]} />
      }
      return <ModuleSetup mod={mod} />
    }
  }
  return <Home />
}
