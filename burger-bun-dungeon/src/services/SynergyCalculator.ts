import type { IngredientsData } from '../types/game'
import { SYNERGY_POINTS } from '../constants/gameConstants'

export class SynergyCalculator {
  /**
   * Calculates synergy text between all collected ingredients.
   * Processes each unique pair and retrieves their reaction text.
   * Uses Set to prevent duplicate pair processing (A+B is same as B+A).
   */
  static calculateSynergyText(
    bunIngredients: string[],
    ingredients: IngredientsData
  ): string {
    const synergies: string[] = []
    const processedPairs = new Set<string>()

    // Check each pair of ingredients
    for (let i = 0; i < bunIngredients.length; i++) {
      for (let j = i + 1; j < bunIngredients.length; j++) {
        const ing1Id = bunIngredients[i]
        const ing2Id = bunIngredients[j]
        const pairKey = [ing1Id, ing2Id].sort().join('-')

        if (processedPairs.has(pairKey)) continue
        processedPairs.add(pairKey)

        const ing1 = ingredients[ing1Id]

        // Check if ing1 has a reaction to ing2
        if (ing1.reactions[ing2Id]) {
          synergies.push(ing1.reactions[ing2Id])
        }
      }
    }

    return synergies.join('\n')
  }

  /**
   * Calculates synergy score and messages for ending screen.
   * Returns both the total synergy points and formatted messages with point values.
   */
  static calculateSynergyScore(
    bunIngredients: string[],
    ingredients: IngredientsData
  ): { score: number; messages: string[] } {
    let synergyScore = 0
    const synergyMessages: string[] = []
    const processedPairs = new Set<string>()

    for (let i = 0; i < bunIngredients.length; i++) {
      for (let j = i + 1; j < bunIngredients.length; j++) {
        const ing1Id = bunIngredients[i]
        const ing2Id = bunIngredients[j]
        const pairKey = [ing1Id, ing2Id].sort().join('-')

        if (processedPairs.has(pairKey)) continue
        processedPairs.add(pairKey)

        const ing1 = ingredients[ing1Id]

        if (ing1.reactions[ing2Id]) {
          synergyMessages.push(ing1.reactions[ing2Id])

          // Calculate points
          if (ing1.likes.includes(ing2Id)) {
            synergyScore += SYNERGY_POINTS.LIKE
            synergyMessages[synergyMessages.length - 1] += `     +${SYNERGY_POINTS.LIKE}`
          } else if (ing1.dislikes.includes(ing2Id)) {
            synergyScore += SYNERGY_POINTS.DISLIKE
            synergyMessages[synergyMessages.length - 1] += `     ${SYNERGY_POINTS.DISLIKE >= 0 ? '+' : ''}${SYNERGY_POINTS.DISLIKE}`
          }
        }
      }
    }

    return { score: synergyScore, messages: synergyMessages }
  }

  /**
   * Calculates synergy text when a new ingredient is added.
   * Shows reactions between the new ingredient and existing ones.
   */
  static calculateIngredientAddedSynergy(
    newIngredientId: string,
    existingIngredients: string[],
    ingredients: IngredientsData
  ): string {
    let synergyText = ''

    existingIngredients.forEach(existingIngId => {
      const existingIng = ingredients[existingIngId]
      if (existingIng.reactions[newIngredientId]) {
        synergyText += '\n' + existingIng.reactions[newIngredientId]
      }
    })

    return synergyText
  }
}
