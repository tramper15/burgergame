import { useState, useEffect } from 'react'
import type { AchievementProgress } from '../types/game'

const STORAGE_KEY = 'burger_bun_achievements'

const DEFAULT_PROGRESS: AchievementProgress = {
  unlockedAchievements: [],
  unlockedAt: {},
  trashOdysseyUnlocked: false
}

export function useAchievementStorage() {
  const [progress, setProgress] = useState<AchievementProgress>(() => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with default progress to ensure all fields exist
        const merged = {
          ...DEFAULT_PROGRESS,
          ...parsed
        }

        // Migration: If ending_good_silent is unlocked but trashOdysseyUnlocked is not set, fix it
        if (merged.unlockedAchievements.includes('ending_good_silent') && !merged.trashOdysseyUnlocked) {
          merged.trashOdysseyUnlocked = true
        }

        return merged
      }
    } catch (error) {
      console.error('Failed to load achievement progress:', error)
    }
    return DEFAULT_PROGRESS
  })

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (error) {
      console.error('Failed to save achievement progress:', error)
    }
  }, [progress])

  const unlockAchievement = (achievementId: string) => {
    setProgress(prev => {
      // Don't unlock if already unlocked
      if (prev.unlockedAchievements.includes(achievementId)) {
        return prev
      }

      // Check if this is the Avocado Savior achievement - unlocks Trash Odyssey
      const unlockTrashOdyssey = achievementId === 'ending_good_silent'

      return {
        unlockedAchievements: [...prev.unlockedAchievements, achievementId],
        unlockedAt: {
          ...prev.unlockedAt,
          [achievementId]: Date.now()
        },
        trashOdysseyUnlocked: prev.trashOdysseyUnlocked || unlockTrashOdyssey
      }
    })
  }

  const clearProgress = () => {
    setProgress(DEFAULT_PROGRESS)
  }

  return {
    progress,
    unlockAchievement,
    clearProgress
  }
}
