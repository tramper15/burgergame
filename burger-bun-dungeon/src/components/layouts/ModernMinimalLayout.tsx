import { useId } from 'react'
import type { LayoutProps } from './types'
import '../css/ModernMinimal.css'

const ModernMinimalLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange
}: LayoutProps) => {
  const selectId = useId()

  return (
    <div className="game-container layout2">
      <div className="minimalist-wrapper">
        <div className="minimal-header">
          <h1 className="minimal-title">The Buns Journey</h1>
        </div>

        <div className="minimal-content">
          <div className="minimal-story">
            <p style={{ whiteSpace: 'pre-wrap' }}>{sceneText}</p>
          </div>

          <div className="minimal-choices">
            <label htmlFor={selectId} className="minimal-label">Choose your path:</label>
            <select
              id={selectId}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernMinimalLayout
