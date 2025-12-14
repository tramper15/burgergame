import { useState, useCallback } from 'react'
import BurgerGame from './components/BurgerGame'
import RPGGame from './components/RPGGame'
import { GameMenu } from './components/GameMenu'
import type { LayoutType } from './components/layouts'
import { ToastProvider } from './components/ToastProvider'
import { AchievementProvider, useAchievements } from './components/AchievementProvider'
import { SCENE_IDS } from './constants/gameConstants'
import './App.css'

type GameMode = 'adventure' | 'rpg' | null

function AppContent() {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1')
  const [currentSceneId, setCurrentSceneId] = useState<string>(SCENE_IDS.START)
  const [resetGameFn, setResetGameFn] = useState<(() => void) | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('adventure')
  const { progress } = useAchievements()

  // Show clear button only on first and last screens
  const showClearButton = currentSceneId === SCENE_IDS.START || currentSceneId === SCENE_IDS.ENDING

  const handleResetGame = () => {
    if (resetGameFn) {
      resetGameFn()
    }
  }

  const handleRegisterResetFn = useCallback((fn: () => void) => {
    setResetGameFn(() => () => fn())
  }, [])

  const handleStartTrashOdyssey = () => {
    setGameMode('rpg')
  }

  return (
    <div className="app">
      <div className={`layout-switcher theme-${currentLayout}`}>
        <GameMenu
          showClearButton={showClearButton}
          onResetGame={handleResetGame}
          onStartTrashOdyssey={handleStartTrashOdyssey}
          trashOdysseyUnlocked={progress.trashOdysseyUnlocked}
        />

        <button
          className={`layout-btn ${currentLayout === 'layout1' ? 'active' : ''}`}
          onClick={() => setCurrentLayout('layout1')}
        >
          Classic Diner
        </button>
        <button
          className={`layout-btn ${currentLayout === 'layout2' ? 'active' : ''}`}
          onClick={() => setCurrentLayout('layout2')}
        >
          Modern Minimal
        </button>
        <button
          className={`layout-btn ${currentLayout === 'layout3' ? 'active' : ''}`}
          onClick={() => setCurrentLayout('layout3')}
        >
          Playful Cartoon
        </button>
      </div>

      {gameMode === 'adventure' ? (
        <BurgerGame layout={currentLayout} onSceneChange={setCurrentSceneId} onResetGame={handleRegisterResetFn} />
      ) : gameMode === 'rpg' ? (
        <RPGGame
          layout={currentLayout}
          ingredientsFromAct1={['avocado']} // TODO: Get from completed Act 1 game
          onBackToMenu={() => setGameMode('adventure')}
        />
      ) : null}
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AchievementProvider>
        <AppContent />
      </AchievementProvider>
    </ToastProvider>
  )
}

export default App
