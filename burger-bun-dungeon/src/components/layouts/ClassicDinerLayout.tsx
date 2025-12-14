import type { LayoutProps } from './types'
import '../css/ClassicDiner.css'

const ClassicDinerLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange,
  isEndingScreen,
  trashOdysseyUnlocked,
  onStartTrashOdyssey
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
  )
}

export default ClassicDinerLayout
