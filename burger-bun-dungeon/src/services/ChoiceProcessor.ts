import type { Choice, GameState, IngredientsData } from '../types/game'
import { SCENE_IDS } from '../constants/gameConstants'
import { SynergyCalculator } from './SynergyCalculator'

export class ChoiceProcessor {
  static processReflection(
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    setGameState(prev => ({
      ...prev,
      currentSceneId: SCENE_IDS.REFLECT,
      visitedScenes: [...prev.visitedScenes, SCENE_IDS.REFLECT]
    }))
    setSelectedChoice(-1)
  }

  static processEnding(
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    setGameState(prev => ({
      ...prev,
      currentSceneId: SCENE_IDS.ENDING
    }))
    setSelectedChoice(-1)
  }

  static processIngredientPickup(
    choice: Choice,
    gameState: GameState,
    ingredients: IngredientsData,
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    if (!choice.take) return

    const ingredient = ingredients[choice.take]
    const ingredientAddedText = ingredient.onAdd

    // Get synergy reactions
    const synergyText = SynergyCalculator.calculateIngredientAddedSynergy(
      choice.take,
      gameState.bunIngredients,
      ingredients
    )

    // Show ingredient added message
    alert(ingredientAddedText + synergyText)

    setGameState(prev => ({
      ...prev,
      bunIngredients: [...prev.bunIngredients, choice.take!],
      currentSceneId: choice.next || prev.currentSceneId,
      visitedScenes: [...prev.visitedScenes, choice.next || prev.currentSceneId]
    }))
    setSelectedChoice(-1)
  }

  static processNavigation(
    choice: Choice,
    gameState: GameState,
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    if (!choice.next) return

    // Check if we're starting over (from ending screen)
    if (gameState.currentSceneId === SCENE_IDS.ENDING && choice.next === SCENE_IDS.START) {
      setGameState(() => ({
        currentSceneId: SCENE_IDS.START,
        bunIngredients: [],
        visitedScenes: [SCENE_IDS.START]
      }))
      setSelectedChoice(-1)
      return
    }

    setGameState(prev => ({
      ...prev,
      currentSceneId: choice.next!,
      visitedScenes: [...prev.visitedScenes, choice.next!]
    }))
    setSelectedChoice(-1)
  }

  static processChoice(
    choice: Choice,
    gameState: GameState,
    ingredients: IngredientsData,
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    // Handle reflection
    if (choice.reflect) {
      this.processReflection(setGameState, setSelectedChoice)
      return
    }

    // Handle ending
    if (choice.end) {
      this.processEnding(setGameState, setSelectedChoice)
      return
    }

    // Handle taking ingredient
    if (choice.take) {
      this.processIngredientPickup(choice, gameState, ingredients, setGameState, setSelectedChoice)
      return
    }

    // Handle normal navigation
    if (choice.next) {
      this.processNavigation(choice, gameState, setGameState, setSelectedChoice)
      return
    }
  }
}
