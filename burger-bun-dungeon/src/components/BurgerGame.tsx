import { useState } from 'react'
import './Layout1.css'
import './Layout2.css'
import './Layout3.css'

export interface GameState {
  text: string
  choices: { label: string; value: string }[]
}

interface BurgerGameProps {
  layout: 'layout1' | 'layout2' | 'layout3'
}

const BurgerGame = ({ layout }: BurgerGameProps) => {
  const [selectedChoice, setSelectedChoice] = useState('')

  const gameState: GameState = {
    text: "You are a bun. Just a bun. You're alone on a counter in a kitchen. You feel as if you're missing parts of yourself. Someone has taken your ingredients, and now you are really alone. Should you go look for them?",
    choices: [
      { label: 'Get off the plate and look around', value: 'A' },
      { label: 'Reflect on your Ingredients', value: 'B' }
    ]
  }

  const handleChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChoice(e.target.value)
  }

  const handleSubmit = () => {
    if (selectedChoice) {
      console.log('Selected:', selectedChoice)
      // Add game logic here
    }
  }

  // Layout 1: Classic Diner Style
  if (layout === 'layout1') {
    return (
      <div className="game-container layout1">
        <div className="game-header">
          <h1 className="game-title">🍔 Burger Bun Dungeon 🍔</h1>
        </div>

        <div className="game-content">
          <div className="story-box">
            <p className="story-text">{gameState.text}</p>
          </div>

          <div className="choice-section">
            <label className="choice-label">What will you do?</label>
            <select
              className="choice-dropdown"
              value={selectedChoice}
              onChange={handleChoiceChange}
            >
              <option value="">-- Choose your path --</option>
              {gameState.choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!selectedChoice}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Layout 2: Modern Minimalist Style
  if (layout === 'layout2') {
    return (
      <div className="game-container layout2">
        <div className="minimalist-wrapper">
          <h1 className="minimal-title">Burger Bun Dungeon</h1>

          <div className="minimal-story">
            <p>{gameState.text}</p>
          </div>

          <div className="minimal-choices">
            <select
              className="minimal-select"
              value={selectedChoice}
              onChange={handleChoiceChange}
            >
              <option value="">Select an action...</option>
              {gameState.choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <button
              className="minimal-button"
              onClick={handleSubmit}
              disabled={!selectedChoice}
            >
              →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Layout 3: Playful Cartoon Style
  return (
    <div className="game-container layout3">
      <div className="cartoon-wrapper">
        <div className="cartoon-header">
          <div className="burger-emoji">🍔</div>
          <h1 className="cartoon-title">Burger Bun Dungeon!</h1>
          <div className="burger-emoji">🍔</div>
        </div>

        <div className="cartoon-bubble">
          <div className="bubble-content">
            <p className="cartoon-text">{gameState.text}</p>
          </div>
        </div>

        <div className="cartoon-choices">
          <div className="choice-box">
            <label className="cartoon-label">🎯 Pick your adventure!</label>
            <select
              className="cartoon-select"
              value={selectedChoice}
              onChange={handleChoiceChange}
            >
              <option value="">🤔 What should I do?</option>
              {gameState.choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <button
              className="cartoon-button"
              onClick={handleSubmit}
              disabled={!selectedChoice}
            >
              Let's Go! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BurgerGame
