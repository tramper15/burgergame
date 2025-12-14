import { useState } from 'react'
import BurgerGame from './components/BurgerGame'
import { GameMenu } from './components/GameMenu'
import type { LayoutType } from './components/layouts'
import { ToastProvider } from './components/ToastProvider'
import { AchievementProvider } from './components/AchievementProvider'
import { SCENE_IDS } from './constants/gameConstants'
import './App.css'

function App() {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1')
  const [currentSceneId, setCurrentSceneId] = useState<string>(SCENE_IDS.START)

  // Show clear button only on first and last screens
  const showClearButton = currentSceneId === SCENE_IDS.START || currentSceneId === SCENE_IDS.ENDING

  return (
    <ToastProvider>
      <AchievementProvider>
        <div className="app">
          <div className={`layout-switcher theme-${currentLayout}`}>
            <GameMenu showClearButton={showClearButton} />

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

          <BurgerGame layout={currentLayout} onSceneChange={setCurrentSceneId} />
        </div>
      </AchievementProvider>
    </ToastProvider>
  )
}

export default App
