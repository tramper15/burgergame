import { useState } from 'react'
import { AchievementPanel } from './AchievementPanel'
import { useAchievements } from './AchievementProvider'
import type { LayoutType } from './layouts'
import './GameMenu.css'

type GameMode = 'adventure' | 'rpg'

interface GameMenuProps {
  gameMode: GameMode
  currentLayout: LayoutType
  onSwitchToAct1: () => void
  onSwitchToAct2: () => void
  onResetGame: () => void
  onLayoutChange: (layout: LayoutType) => void
  trashOdysseyUnlocked: boolean
}

export const GameMenu = ({
  gameMode,
  currentLayout,
  onSwitchToAct1,
  onSwitchToAct2,
  onResetGame,
  onLayoutChange,
  trashOdysseyUnlocked
}: GameMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const { progress, clearProgress } = useAchievements()

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all achievements? This cannot be undone. (Note: Your game saves will NOT be affected)')) {
      clearProgress()
      setIsMenuOpen(false)
    }
  }

  const handleResetGame = () => {
    const actName = gameMode === 'adventure' ? 'Act 1' : 'Act 2'
    if (window.confirm(`Are you sure you want to reset ${actName}? Your progress in this act will be lost.`)) {
      onResetGame()
      setIsMenuOpen(false)
    }
  }

  const handleSwitchToAct1 = () => {
    onSwitchToAct1()
    setIsMenuOpen(false)
  }

  const handleSwitchToAct2 = () => {
    if (window.confirm('Switch to Trash Odyssey (Act 2)?')) {
      onSwitchToAct2()
      setIsMenuOpen(false)
    }
  }

  const handleThemeChange = (layout: LayoutType) => {
    onLayoutChange(layout)
    setShowThemeMenu(false)
  }

  const currentModeName = gameMode === 'adventure' ? 'Act 1' : 'Act 2'

  const layoutNames: Record<LayoutType, string> = {
    layout1: 'Classic Diner',
    layout2: 'Modern Minimal',
    layout3: 'Playful Cartoon'
  }

  return (
    <>
      <div className="game-menu-bar">
        {/* Main Menu Dropdown */}
        <div className="menu-section">
          <button
            className="menu-btn"
            onClick={() => {
              setIsMenuOpen(prev => !prev)
              setShowThemeMenu(false)
            }}
          >
            ☰ Menu
          </button>

          {isMenuOpen && (
            <div className="menu-dropdown">
              <button
                className={`menu-item ${gameMode === 'adventure' ? 'active' : ''}`}
                onClick={handleSwitchToAct1}
              >
                🎮 Act 1: Bun's Journey
              </button>

              {trashOdysseyUnlocked && (
                <button
                  className={`menu-item ${gameMode === 'rpg' ? 'active' : ''}`}
                  onClick={handleSwitchToAct2}
                >
                  ⚔️ Act 2: Trash Odyssey
                </button>
              )}

              <div className="menu-divider" />

              <button
                className="menu-item"
                onClick={handleResetGame}
              >
                🔄 Reset {currentModeName}
              </button>

              <button
                className="menu-item"
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu)
                }}
              >
                🎨 Change Theme →
              </button>

              {showThemeMenu && (
                <div className="submenu">
                  <button
                    className={`menu-item submenu-item ${currentLayout === 'layout1' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('layout1')}
                  >
                    {currentLayout === 'layout1' ? '✓ ' : ''}Classic Diner
                  </button>
                  <button
                    className={`menu-item submenu-item ${currentLayout === 'layout2' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('layout2')}
                  >
                    {currentLayout === 'layout2' ? '✓ ' : ''}Modern Minimal
                  </button>
                  <button
                    className={`menu-item submenu-item ${currentLayout === 'layout3' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('layout3')}
                  >
                    {currentLayout === 'layout3' ? '✓ ' : ''}Playful Cartoon
                  </button>
                </div>
              )}

              <div className="menu-divider" />

              <button
                className="menu-item danger"
                onClick={handleClearProgress}
              >
                🗑️ Clear Achievements
              </button>
            </div>
          )}
        </div>

        {/* Current Mode Indicator */}
        <div className="mode-indicator">
          Current: {currentModeName}
        </div>

        {/* Theme Button */}
        <button
          className="top-btn theme-btn"
          onClick={() => {
            const layouts: LayoutType[] = ['layout1', 'layout2', 'layout3']
            const currentIndex = layouts.indexOf(currentLayout)
            const nextIndex = (currentIndex + 1) % layouts.length
            onLayoutChange(layouts[nextIndex])
          }}
          title={`Current: ${layoutNames[currentLayout]}`}
        >
          🎨 Theme
        </button>

        {/* Achievements Button */}
        <button
          className="top-btn achievements-btn"
          onClick={() => setShowAchievements(true)}
        >
          🏆 Achievements
        </button>
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
