import * as React from 'react'
import * as PortalPrimitive from '@radix-ui/react-portal'

interface PortalProps {
  children: React.ReactNode
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return null
  }

  return <PortalPrimitive.Root>{children}</PortalPrimitive.Root>
}
