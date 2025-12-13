import type { LayoutProps } from './types'
import '../css/PlayfulCartoon.css'

const PlayfulCartoonLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayfulCartoonLayout
