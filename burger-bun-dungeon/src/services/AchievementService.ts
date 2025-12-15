import achievementsData from '../data/achievements.json'
import type { AchievementsData, AchievementProgress, GameState, RPGState } from '../types/game'

export class AchievementService {
  private static achievements: AchievementsData = achievementsData

  /**
   * Check which achievements are newly unlocked based on game state and ending type
   * @param gameState Current game state with ingredients
   * @param endingType The type of ending reached (e.g., "default", "dysentery", etc.)
   * @param currentProgress Player's current achievement progress
   * @returns Array of newly unlocked achievement IDs
   */
  static checkAchievements(
    gameState: GameState,
    endingType: string,
    currentProgress: AchievementProgress
  ): string[] {
    const newlyUnlocked: string[] = []

    Object.entries(this.achievements).forEach(([achievementId, achievement]) => {
      // Skip if already unlocked
      if (currentProgress.unlockedAchievements.includes(achievementId)) {
        return
      }

      // Check if achievement criteria are met
      const endingMatches = achievement.criteria.ending
        ? achievement.criteria.ending === endingType
        : false

      const ingredientsMatch = achievement.criteria.exactIngredients
        ? this.matchesExactIngredients(gameState.bunIngredients, achievement.criteria.exactIngredients)
        : false

      // Achievement unlocks if ANY criterion is met (OR logic)
      if (endingMatches || ingredientsMatch) {
        newlyUnlocked.push(achievementId)
      }
    })

    return newlyUnlocked
  }

  /**
   * Check if player's ingredients exactly match required ingredients
   * @param playerIngredients Player's current ingredients
   * @param requiredIngredients Required ingredients for achievement
   * @returns True if exact match
   */
  private static matchesExactIngredients(playerIngredients: string[], requiredIngredients: string[]): boolean {
    // Must have same length
    if (playerIngredients.length !== requiredIngredients.length) {
      return false
    }

    // Sort both arrays and compare
    const sortedPlayer = [...playerIngredients].sort()
    const sortedRequired = [...requiredIngredients].sort()

    return sortedPlayer.every((ingredient, index) => ingredient === sortedRequired[index])
  }

  /**
   * Get achievement data by ID
   */
  static getAchievement(achievementId: string) {
    return this.achievements[achievementId]
  }

  /**
   * Get all achievements
   */
  static getAllAchievements(): AchievementsData {
    return this.achievements
  }

  /**
   * Get total achievement count
   */
  static getTotalCount(): number {
    return Object.keys(this.achievements).length
  }

  /**
   * Check which achievements are newly unlocked based on RPG state and ending type
   * @param rpgState Current RPG game state
   * @param endingType The type of ending reached (e.g., "victory", "secret_victory", etc.)
   * @param currentProgress Player's current achievement progress
   * @returns Array of newly unlocked achievement IDs
   */
  static checkRPGAchievements(
    rpgState: RPGState,
    endingType: string | null,
    currentProgress: AchievementProgress
  ): string[] {
    const newlyUnlocked: string[] = []

    Object.entries(this.achievements).forEach(([achievementId, achievement]) => {
      // Skip if already unlocked
      if (currentProgress.unlockedAchievements.includes(achievementId)) {
        return
      }

      // Check if achievement criteria are met
      let criteriaMatches = false

      // Check ending criteria
      if (achievement.criteria.ending && endingType) {
        criteriaMatches = criteriaMatches || achievement.criteria.ending === endingType
      }

      // Check boss defeated criteria
      if (achievement.criteria.bossDefeated) {
        criteriaMatches = criteriaMatches || rpgState.defeatedBosses.includes(achievement.criteria.bossDefeated)
      }

      // Check level criteria
      if (achievement.criteria.minLevel) {
        criteriaMatches = criteriaMatches || rpgState.level >= achievement.criteria.minLevel
      }

      // Check stat criteria
      if (achievement.criteria.minAtk) {
        criteriaMatches = criteriaMatches || rpgState.stats.atk >= achievement.criteria.minAtk
      }

      if (achievement.criteria.minHp) {
        criteriaMatches = criteriaMatches || rpgState.maxHp >= achievement.criteria.minHp
      }

      if (achievement.criteria.minSpd) {
        criteriaMatches = criteriaMatches || rpgState.stats.spd >= achievement.criteria.minSpd
      }

      // Check currency criteria
      if (achievement.criteria.minCurrency) {
        criteriaMatches = criteriaMatches || rpgState.currency >= achievement.criteria.minCurrency
      }

      // Check ingredient count criteria
      if (achievement.criteria.minIngredients) {
        const ingredientCount = Object.keys(rpgState.ingredientBonuses).length
        criteriaMatches = criteriaMatches || ingredientCount >= achievement.criteria.minIngredients
      }

      // Achievement unlocks if ANY criterion is met (OR logic)
      if (criteriaMatches) {
        newlyUnlocked.push(achievementId)
      }
    })

    return newlyUnlocked
  }
}
