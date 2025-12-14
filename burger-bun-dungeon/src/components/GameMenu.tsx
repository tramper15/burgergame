import { useState } from 'react'
import { AchievementPanel } from './AchievementPanel'
import { useAchievements } from './AchievementProvider'
import './GameMenu.css'

interface GameMenuProps {
  showClearButton: boolean
  onResetGame?: () => void
}

export const GameMenu = ({ showClearButton, onResetGame }: GameMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const { progress, clearProgress } = useAchievements()

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all achievement progress? This cannot be undone.')) {
      clearProgress()
      setIsMenuOpen(false)
    }
  }

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? Your current progress will be lost.')) {
      onResetGame?.()
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      <div className="game-menu">
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰ Menu
        </button>

        {isMenuOpen && (
          <div className="menu-dropdown">
            <button
              className="menu-item"
              onClick={() => {
                setShowAchievements(true)
                setIsMenuOpen(false)
              }}
            >
              🏆 Achievements
            </button>

            <button
              className="menu-item"
              onClick={handleResetGame}
            >
              🔄 Reset Game
            </button>

            {showClearButton && (
              <button
                className="menu-item danger"
                onClick={handleClearProgress}
              >
                🗑️ Clear Progress
              </button>
            )}
          </div>
        )}
      </div>

      {showAchievements && (
        <AchievementPanel
          progress={progress}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </>
  )
}
