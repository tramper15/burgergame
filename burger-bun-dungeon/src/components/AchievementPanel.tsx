import { AchievementService } from '../services/AchievementService'
import type { AchievementProgress } from '../types/game'
import './AchievementPanel.css'

interface AchievementPanelProps {
  progress: AchievementProgress
  onClose: () => void
}

export const AchievementPanel = ({ progress, onClose }: AchievementPanelProps) => {
  const allAchievements = AchievementService.getAllAchievements()
  const totalCount = AchievementService.getTotalCount()
  const unlockedCount = progress.unlockedAchievements.length

  return (
    <div className="achievement-panel-overlay" onClick={onClose}>
      <div className="achievement-panel" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-panel-header">
          <h2>Achievements</h2>
          <div className="achievement-progress">
            {unlockedCount} / {totalCount} Unlocked
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="achievement-list">
          {Object.entries(allAchievements).map(([id, achievement]) => {
            const isUnlocked = progress.unlockedAchievements.includes(id)

            return (
              <div
                key={id}
                className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {isUnlocked ? '✓' : '?'}
                </div>
                <div className="achievement-content">
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
