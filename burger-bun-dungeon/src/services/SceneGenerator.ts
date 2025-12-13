import type { Scene, GameState, IngredientsData } from '../types/game'
import { SynergyCalculator } from './SynergyCalculator'
import { EndingFactory } from './EndingFactory'
import { TOTAL_UNIQUE_SILENCE_MESSAGES } from '../constants/gameConstants'

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

  static generateSilenceScene(
    gameState: GameState,
    _ingredients: IngredientsData,
    messageIndex?: number
  ): Scene {
    const sadTexts = [
      "You sit in the quiet.\n\nThe weight of what you carry feels heavy. Each ingredient—a choice you made, a piece of yourself you picked up along the way.",
      "Silence wraps around you.\n\nYou think about the empty shelf where the cheese was. The forgotten lettuce. All the things left behind in dark places.",
      "You linger here, unmoving.\n\nWhat does it mean to be complete? What does it mean to be whole? You don't know if you'll ever know.",
      "The stillness is overwhelming.\n\nYou are more than bread now, but less than what you imagined. Somewhere between empty and full.",
      "You close your eyes—or you would, if you had eyes.\n\nIn the darkness behind the darkness, you feel the cold of the freezer, the dust under the table, the shadows behind the couch."
    ]

    let text = ""

    if (gameState.bunIngredients.length === 0) {
      text = "You sit in silence.\n\nYou are just bread. Two halves pressed together with nothing between.\n\nThe emptiness echoes.\n\nYou wonder if you were always meant to be this hollow."
    } else {
      // Pick a random sad reflection that hasn't been seen yet if possible
      let selectedIndex: number
      if (messageIndex !== undefined) {
        selectedIndex = messageIndex
      } else {
        const unseenMessages = sadTexts
          .map((_, i) => i)
          .filter(i => !gameState.seenSilenceMessages.includes(i))

        if (unseenMessages.length > 0) {
          selectedIndex = unseenMessages[Math.floor(Math.random() * unseenMessages.length)]
        } else {
          selectedIndex = Math.floor(Math.random() * sadTexts.length)
        }
      }

      text = sadTexts[selectedIndex]

      text += "\n\n"

      // List what you carry, but make it melancholic
      if (gameState.bunIngredients.length === 1) {
        text += "You carry only one thing. It feels lonely."
      } else if (gameState.bunIngredients.length <= 3) {
        text += "You carry so little. Is it enough? Will it ever be?"
      } else {
        text += "You carry so much. Does any of it matter?"
      }
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
    // Check for empty burger first
    if (gameState.bunIngredients.length === 0) {
      return EndingFactory.generateEmptyBurgerEnding(gameState, ingredients)
    }

    // Check for dysentery (after empty check)
    const hasQuestionableWater = gameState.bunIngredients.includes('questionable_water')
    if (hasQuestionableWater) {
      return EndingFactory.generateDysenteryEnding(gameState, ingredients)
    }

    // Check for no meat patty
    const hasMeatPatty = gameState.bunIngredients.includes('meat_patty')
    if (!hasMeatPatty) {
      return EndingFactory.generateNotARealBurgerEnding(gameState, ingredients)
    }

    const lingeredInAllSilences =
      gameState.seenSilenceMessages.length >= TOTAL_UNIQUE_SILENCE_MESSAGES
    const hasAvocado = gameState.bunIngredients.includes('avocado')

    // Route to appropriate ending based on game state
    if (lingeredInAllSilences) {
      return hasAvocado
        ? EndingFactory.generateGoodSilentEnding(gameState, ingredients)
        : EndingFactory.generateBadSilentEnding(gameState, ingredients)
    }

    return EndingFactory.generateDefaultEnding(gameState, ingredients)
  }
}
