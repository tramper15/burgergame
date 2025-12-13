import type { LayoutProps } from './types'
import '../Layout3.css'

const PlayfulCartoonLayout = ({
  sceneText,
  availableChoices,
  selectedChoice,
  onChoiceChange,
  onSubmit,
  onRestart
}: LayoutProps) => {
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
            <button
              className="cartoon-button"
              onClick={onSubmit}
              disabled={selectedChoice < 0}
            >
              Let's Go! 🚀
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
    </div>
  )
}

export default PlayfulCartoonLayout
