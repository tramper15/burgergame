import type { LayoutProps } from './types'
import '../css/PlayfulCartoon.css'

const PlayfulCartoonLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange,
  isEndingScreen,
  trashOdysseyUnlocked,
  onStartTrashOdyssey
}: LayoutProps) => {
  return (
    <div className="game-container layout3">
      <div className="cartoon-wrapper">
        <div className="cartoon-header">
          <div className="burger-emoji">🍔</div>
          <h1 className="cartoon-title">The Buns Journey!</h1>
          <div className="burger-emoji">🍔</div>
        </div>

        <div className="cartoon-bubble">
          <div className="bubble-content">
            <p className="cartoon-text" style={{ whiteSpace: 'pre-wrap' }}>{sceneText}</p>
          </div>
        </div>

        <div className="cartoon-choices">
          <div className="choice-box">
            <label className="cartoon-label">🎯 Pick your adventure!</label>
            <select
              className="cartoon-select"
              value={selectedChoice}
              onChange={(e) => onChoiceChange(parseInt(e.target.value))}
            >
              <option value="-1">🤔 What should I do?</option>
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

export default PlayfulCartoonLayout
