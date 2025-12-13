import { useState } from 'react'
import BurgerGame from './components/BurgerGame'
import type { LayoutType } from './components/layouts'
import { ToastProvider } from './components/ToastProvider'
import './App.css'

function App() {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('layout1')

  return (
    <ToastProvider>
      <div className="app">
        <div className="layout-switcher">
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

        <BurgerGame layout={currentLayout} />
      </div>
    </ToastProvider>
  )
}

export default App
