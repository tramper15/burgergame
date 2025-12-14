import { useState } from 'react'
import { AchievementPanel } from './AchievementPanel'
import { useAchievements } from './AchievementProvider'
import './GameMenu.css'

interface GameMenuProps {
  showClearButton: boolean
}

export const GameMenu = ({ showClearButton }: GameMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const { progress, clearProgress } = useAchievements()

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all achievement progress? This cannot be undone.')) {
      clearProgress()
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
