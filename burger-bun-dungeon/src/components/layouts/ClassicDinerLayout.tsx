import type { LayoutProps } from './types'
import '../Layout1.css'

const ClassicDinerLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange,
  onSubmit,
  onRestart
}: LayoutProps) => {
  return (
    <div className="game-container layout1">
      <div className="game-header">
        <h1 className="game-title">🍔 Burger Bun Dungeon 🍔</h1>
      </div>

      <div className="game-content">
        <div className="story-box">
          <p className="story-text" style={{ whiteSpace: 'pre-wrap' }}>{sceneText}</p>
        </div>

        <div className="choice-section">
          <label className="choice-label">What will you do?</label>
          <select
            className="choice-dropdown"
            value={selectedChoice}
            onChange={(e) => onChoiceChange(parseInt(e.target.value))}
          >
            <option value="-1">-- Choose your path --</option>
            {availableChoices.map((choice, index) => (
              <option key={index} value={index}>
                {choice.label}
              </option>
            ))}
          </select>
          <button
            className="submit-button"
            onClick={onSubmit}
            disabled={selectedChoice < 0}
          >
            Continue
          </button>
          <button
            className="restart-button"
            onClick={onRestart}
          >
            🔄 Restart Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClassicDinerLayout
