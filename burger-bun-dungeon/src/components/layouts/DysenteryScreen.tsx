import '../css/DysenteryScreen.css'

interface DysenteryScreenProps {
  onReset: () => void
}

export const DysenteryScreen = ({ onReset }: DysenteryScreenProps) => {
  return (
    <div className="dysentery-screen">
      <div className="dysentery-content">
        <h1 className="dysentery-title">YOU DIED OF DYSENTERY</h1>

        <div className="dysentery-message">
          <p>The questionable water has taken its toll.</p>
          <p>Your journey ends here.</p>
          <p>There is no adventure for you.</p>
        </div>

        <button className="dysentery-reset-btn" onClick={onReset}>
          Reset Act 1
        </button>
      </div>
    </div>
  )
}
