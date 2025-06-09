// components/ui/separator.tsx
import * as React from 'react'
import { Separator as RadixSeparator } from '@radix-ui/react-separator'

export function Separator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSeparator>) {
  return (
    <RadixSeparator
      className={`bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px ${className}`}
      {...props}
    />
  )
}
