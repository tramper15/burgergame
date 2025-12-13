import type { LayoutProps } from './types'
import '../css/ClassicDiner.css'

const ClassicDinerLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange
}: LayoutProps) => {
  return (
    <div className="game-container layout1">
      <div className="game-header">
        <h1 className="game-title">🍔 The Buns Journey 🍔</h1>
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
        </div>
      </div>
    </div>
  )
}

export default ClassicDinerLayout
