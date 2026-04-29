'use client'

import * as React from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
  [key: string]: unknown
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  void props
  return <>{children}</>
}
