import type { LayoutProps } from './types'
import '../Layout2.css'

const ModernMinimalLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange,
  onSubmit,
  onRestart
}: LayoutProps) => {
  return (
    <div className="game-container layout2">
      <div className="minimalist-wrapper">
        <h1 className="minimal-title">Burger Bun Dungeon</h1>

        <div className="minimal-story">
          <p style={{ whiteSpace: 'pre-wrap' }}>{sceneText}</p>
        </div>

        <div className="minimal-choices">
          <select
            className="minimal-select"
            value={selectedChoice}
            onChange={(e) => onChoiceChange(parseInt(e.target.value))}
          >
            <option value="-1">Select an action...</option>
            {availableChoices.map((choice, index) => (
              <option key={index} value={index}>
                {choice.label}
              </option>
            ))}
          </select>
          <button
            className="minimal-button"
            onClick={onSubmit}
            disabled={selectedChoice < 0}
          >
            →
          </button>
        </div>
        <button
          className="restart-button"
          onClick={onRestart}
          style={{ marginTop: '1rem' }}
        >
          🔄 Restart Game
        </button>
      </div>
    </div>
  )
}

export default ModernMinimalLayout
