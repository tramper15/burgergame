import { useState, useCallback } from 'react'
import BurgerGame from './components/BurgerGame'
import RPGGame from './components/RPGGame'
import { GameMenu } from './components/GameMenu'
import type { LayoutType } from './components/layouts'
import { ToastProvider } from './components/ToastProvider'
import { AchievementProvider, useAchievements } from './components/AchievementProvider'
import './App.css'

function AppContent() {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1')
  const [resetGameFn, setResetGameFn] = useState<(() => void) | null>(null)
  const [gameMode, setGameMode] = useState<'adventure' | 'rpg'>('adventure')
  const [act1Ingredients, setAct1Ingredients] = useState<string[]>([])
  const { progress } = useAchievements()

  const handleResetGame = () => {
    if (resetGameFn) {
      resetGameFn()
    }
  }

  const handleRegisterResetFn = useCallback((fn: () => void) => {
    setResetGameFn(() => () => fn())
  }, [])

  const handleSwitchToAct1 = () => {
    setGameMode('adventure')
  }

  const handleSwitchToAct2 = () => {
    if (progress.trashOdysseyUnlocked) {
      setGameMode('rpg')
    }
  }

  return (
    <div className="app">
      <GameMenu
        gameMode={gameMode}
        currentLayout={currentLayout}
        onSwitchToAct1={handleSwitchToAct1}
        onSwitchToAct2={handleSwitchToAct2}
        onResetGame={handleResetGame}
        onLayoutChange={setCurrentLayout}
        trashOdysseyUnlocked={progress.trashOdysseyUnlocked || false}
      />

      {gameMode === 'adventure' ? (
        <BurgerGame
          layout={currentLayout}
          onResetGame={handleRegisterResetFn}
          onStartTrashOdyssey={handleSwitchToAct2}
          trashOdysseyUnlocked={progress.trashOdysseyUnlocked}
          onGameEnd={setAct1Ingredients}
        />
      ) : (
        <RPGGame
          layout={currentLayout}
          ingredientsFromAct1={act1Ingredients}
          onBackToMenu={handleSwitchToAct1}
          onResetGame={handleRegisterResetFn}
        />
      )}
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
