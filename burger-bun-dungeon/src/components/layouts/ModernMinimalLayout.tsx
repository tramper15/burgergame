import type { LayoutProps } from './types'
import '../Layout2.css'

const ModernMinimalLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange
}: LayoutProps) => {
  return (
    <div className="game-container layout2">
      <div className="minimalist-wrapper">
        <h1 className="minimal-title">The Buns Journey</h1>

        <div className="minimal-story">
          <p style={{ whiteSpace: 'pre-wrap' }}>{sceneText}</p>
        </div>

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
          <option value="-2">🔄 Restart Game</option>
        </select>
      </div>
    </div>
  )
}

export default ModernMinimalLayout
