'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Button } from '@components/ui/button'

// Simple global flag that the Supabase client can set
let globalSetDown: ((down: boolean) => void) | null = null

export function setSupabaseDown(down: boolean) {
  globalSetDown?.(down)
}

const MaintenanceContext = createContext({ isDown: false })

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [isDown, setIsDown] = useState(false)

  // Register the global setter
  globalSetDown = setIsDown

  const handleRetry = useCallback(() => {
    setIsDown(false)
    window.location.reload()
  }, [])

  if (isDown) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          {/* Animated icon */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
          </div>

          <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
            Service Maintenance
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            We&apos;ll be back shortly
          </h1>
          
          <p className="text-gray-400 max-w-md mb-8">
            Our database is undergoing maintenance. This usually takes just a few minutes. 
            Please try again shortly.
          </p>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRetry}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Error: 503 Service Unavailable
          </p>
        </div>
      </div>
    )
  }

  return (
    <MaintenanceContext.Provider value={{ isDown }}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export function useMaintenance() {
  return useContext(MaintenanceContext)
}

