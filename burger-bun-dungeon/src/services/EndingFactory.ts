import type { GameState, IngredientsData, Scene } from '../types/game'
import { EndingBuilder } from './EndingBuilder'

/**
 * Factory for generating different ending scenes.
 * Each ending is isolated in its own method for clarity and maintainability.
 */
export class EndingFactory {
  /**
   * Default ending - player didn't linger in all silences
   */
  static generateDefaultEnding(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    const text = new EndingBuilder()
      .addBunHeader()
      .addIngredientList(gameState.bunIngredients, ingredients)
      .addSynergyReflections(gameState.bunIngredients, ingredients)
      .addScoreSummary(gameState.bunIngredients, ingredients)
      .addNarrative("You are not what you were meant to be.\nBut you are something.")
      .build()

    return {
      text,
      choices: [{ label: 'Restart', restart: true }]
    }
  }

  /**
   * Good silent ending - player lingered in all silences AND has avocado
   * The avocado saves you from being eaten
   */
  static generateGoodSilentEnding(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    const text = new EndingBuilder()
      .addBunHeader()
      .addIngredientList(gameState.bunIngredients, ingredients)
      .addSynergyReflections(gameState.bunIngredients, ingredients)
      .addScoreSummary(gameState.bunIngredients, ingredients)
      .addNarrative(
        "A hand reaches towards you.\n\n" +
        "But then... it pulls back.\n\n" +
        "You hear loud footsteps overhead.\n\n" +
        "\"Ew.\"\n\n" +
        "The hand retreats. You are spared.\n\n" +
        "You remain whole, untouched, free."
      )
      .build()

    return {
      text,
      choices: [{ label: 'Restart', restart: true }]
    }
  }

  /**
   * Bad silent ending - player lingered in all silences but NO avocado
   * You get eaten
   */
  static generateBadSilentEnding(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    const text = new EndingBuilder()
      .addBunHeader()
      .addIngredientList(gameState.bunIngredients, ingredients)
      .addSynergyReflections(gameState.bunIngredients, ingredients)
      .addScoreSummary(gameState.bunIngredients, ingredients)
      .addNarrative(
        "A hand reaches towards you.\n\n" +
        "You are now whole.\n\n" +
        "But at what cost?\n\n" +
        "🧈"
      )
      .build()

    return {
      text,
      choices: [{ label: 'Restart', restart: true }]
    }
  }

  /**
   * Not a real burger ending - player has no meat patty
   * Score is zeroed out
   */
  static generateNotARealBurgerEnding(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    const text = new EndingBuilder()
      .addNarrative(
        "You gather yourself together, but something is wrong.\n\n" +
        "Without a meat patty, you are not a real burger.\n\n" +
        "You are incomplete. You are nothing.\n\n" +
        "---\n\n" +
        "You have:\n"
      )
      .addBunHeader()
      .addIngredientList(gameState.bunIngredients, ingredients, false)
      .addScoreSummary(gameState.bunIngredients, ingredients, {
        base: 0,
        synergy: 0,
        total: 0
      })
      .addNarrative("You are nothing without the meat.")
      .build()

    return {
      text,
      choices: [{ label: 'Restart', restart: true }]
    }
  }

  /**
   * Empty burger ending - player has no ingredients at all
   * The ultimate hollow ending
   */
  static generateEmptyBurgerEnding(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    const text = new EndingBuilder()
      .addNarrative(
        "You are complete.\n\n" +
        "Two buns pressed together.\n\n" +
        "Empty.\n\n" +
        "Nothing between.\n\n" +
        "---\n\n" +
        "You have:\n"
      )
      .addBunHeader()
      .addScoreSummary(gameState.bunIngredients, ingredients, {
        base: 0,
        synergy: 0,
        total: 0
      })
      .addNarrative(
        "Some journeys are not about what you gather.\n\n" +
        "Some journeys are about what you leave behind.\n\n" +
        "You are whole in your emptiness.\n\n" +
        "You are perfectly, beautifully hollow."
      )
      .build()

    return {
      text,
      choices: [{ label: 'Restart', restart: true }]
    }
  }

  /**
   * Dysentery ending - player took the questionable water
   * Oregon Trail reference
   */
  static generateDysenteryEnding(
    gameState: GameState,
    ingredients: IngredientsData
  ): Scene {
    const text = new EndingBuilder()
      .addNarrative(
        "You gather yourself together.\n\n" +
        "But something is wrong.\n\n" +
        "The water... it was a mistake.\n\n" +
        "You feel yourself coming apart.\n\n" +
        "---\n\n" +
        "You have:\n"
      )
      .addBunHeader()
      .addIngredientList(gameState.bunIngredients, ingredients, false)
      .addScoreSummary(gameState.bunIngredients, ingredients, {
        base: 0,
        synergy: 0,
        total: 0
      })
      .addNarrative(
        "You have died of dysentery.\n\n" +
        "You should have caulked the wagon and floated it across.\n\n" +
        "Perhaps some paths were not meant to be taken.\n\n" +
        "Perhaps some water was not meant to be drunk."
      )
      .build()

    return {
      text,
      choices: [{ label: 'Restart', restart: true }]
    }
  }
}
