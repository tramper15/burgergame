import { useId } from 'react'
import type { LayoutProps } from './types'
import '../css/ModernMinimal.css'

const ModernMinimalLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange,
  isEndingScreen,
  trashOdysseyUnlocked,
  onStartTrashOdyssey
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

            {isEndingScreen && trashOdysseyUnlocked && onStartTrashOdyssey && (
              <button
                className="trash-odyssey-btn"
                onClick={onStartTrashOdyssey}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#d97706',
                  color: 'white',
                  border: '2px solid #92400e',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                ⚔️ Start Trash Odyssey (Act 2)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernMinimalLayout
