import { useState } from 'react'
import BurgerGame from './components/BurgerGame'
import './App.css'

function App() {
  const [currentLayout, setCurrentLayout] = useState<'layout1' | 'layout2' | 'layout3'>('layout1')

  return (
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
  )
}

export default App
