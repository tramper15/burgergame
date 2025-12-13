import type { Scene, GameState, IngredientsData } from '../types/game'
import { SynergyCalculator } from './SynergyCalculator'

export class SceneGenerator {
  static generateReflectionScene(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    let text = "You look inward. You feel:\n\n"

    if (gameState.bunIngredients.length === 0) {
      text = "You look inward. You are just bread. Two halves, pressed together. There is nothing else. You feel incomplete."
    } else {
      // List each ingredient
      gameState.bunIngredients.forEach(ingredientId => {
        const ingredient = ingredients[ingredientId]
        text += `${ingredient.name}. ${ingredient.description}\n`
      })

      text += "\n"

      // Show synergy interactions
      const synergyText = SynergyCalculator.calculateSynergyText(
        gameState.bunIngredients,
        ingredients
      )
      if (synergyText) {
        text += synergyText + "\n\n"
      }

      text += "You are becoming something. But you don't know what yet."
    }

    return {
      text,
      choices: [
        {
          label: 'Return',
          next: gameState.visitedScenes[gameState.visitedScenes.length - 2] || 'kitchen_counter'
        }
      ]
    }
  }

  static generateEndingScene(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    let text = "You have become:\n\n"
    text += "🍞 Bun\n"

    let baseScore = 0
    gameState.bunIngredients.forEach(ingredientId => {
      const ingredient = ingredients[ingredientId]
      text += `${ingredient.name}        +${ingredient.points}\n`
      baseScore += ingredient.points
    })

    text += "\n"

    // Calculate synergies
    const { score: synergyScore, messages: synergyMessages } =
      SynergyCalculator.calculateSynergyScore(gameState.bunIngredients, ingredients)

    if (synergyMessages.length > 0) {
      text += "Reflections:\n"
      text += synergyMessages.join('\n') + "\n\n"
    }

    text += `Base score:     ${baseScore}\n`
    text += `Synergies:      ${synergyScore >= 0 ? '+' : ''}${synergyScore}\n`
    text += `Total:          ${baseScore + synergyScore}\n\n`
    text += "You are not what you were meant to be.\nBut you are something."

    return {
      text,
      choices: [
        { label: 'Start Over', next: 'kitchen_counter' }
      ]
    }
  }
}
