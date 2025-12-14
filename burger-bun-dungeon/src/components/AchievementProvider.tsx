import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAchievementStorage } from '../hooks/useAchievementStorage'
import type { AchievementProgress } from '../types/game'

interface AchievementContextType {
  progress: AchievementProgress
  unlockAchievement: (achievementId: string) => void
  clearProgress: () => void
}

const AchievementContext = createContext<AchievementContextType | null>(null)

export function AchievementProvider({ children }: { children: ReactNode }) {
  const achievementStorage = useAchievementStorage()

  return (
    <AchievementContext.Provider value={achievementStorage}>
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider')
  }
  return context
}
