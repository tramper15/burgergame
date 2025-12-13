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

  static processSilence(
    gameState: GameState,
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    // Determine which message to show (prioritize unseen ones)
    const totalMessages = 5
    const unseenMessages = Array.from({ length: totalMessages }, (_, i) => i)
      .filter(i => !gameState.seenSilenceMessages.includes(i))

    let messageIndex: number
    if (unseenMessages.length > 0) {
      messageIndex = unseenMessages[Math.floor(Math.random() * unseenMessages.length)]
    } else {
      messageIndex = Math.floor(Math.random() * totalMessages)
    }

    setGameState(prev => ({
      ...prev,
      currentSceneId: SCENE_IDS.LINGER_SILENCE,
      visitedScenes: [...prev.visitedScenes, SCENE_IDS.LINGER_SILENCE],
      seenSilenceMessages: prev.seenSilenceMessages.includes(messageIndex)
        ? prev.seenSilenceMessages
        : [...prev.seenSilenceMessages, messageIndex]
    }))
    setSelectedChoice(-1)
  }

  static processRestart(
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    setGameState(() => ({
      currentSceneId: SCENE_IDS.START,
      bunIngredients: [],
      visitedScenes: [SCENE_IDS.START],
      seenSilenceMessages: []
    }))
    setSelectedChoice(-1)
  }

  static processEnding(
    gameState: GameState,
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    // Check if player has meat patty
    const hasMeatPatty = gameState.bunIngredients.includes('meat_patty')

    setGameState(prev => ({
      ...prev,
      currentSceneId: hasMeatPatty ? SCENE_IDS.ENDING : SCENE_IDS.NOT_A_REAL_BURGER_ENDING
    }))
    setSelectedChoice(-1)
  }

  static processIngredientPickup(
    choice: Choice,
    gameState: GameState,
    ingredients: IngredientsData,
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void,
    showToast: (message: string) => void
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
    showToast(ingredientAddedText + synergyText)

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
    setGameState: (updater: (prev: GameState) => GameState) => void,
    setSelectedChoice: (value: number) => void
  ): void {
    if (!choice.next) return

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
    setSelectedChoice: (value: number) => void,
    showToast: (message: string) => void
  ): void {
    // Handle reflection
    if (choice.reflect) {
      this.processReflection(setGameState, setSelectedChoice)
      return
    }

    // Handle silence
    if (choice.silence) {
      this.processSilence(gameState, setGameState, setSelectedChoice)
      return
    }

    // Handle restart
    if (choice.restart) {
      this.processRestart(setGameState, setSelectedChoice)
      return
    }

    // Handle ending
    if (choice.end) {
      this.processEnding(gameState, setGameState, setSelectedChoice)
      return
    }

    // Handle taking ingredient
    if (choice.take) {
      this.processIngredientPickup(choice, gameState, ingredients, setGameState, setSelectedChoice, showToast)
      return
    }

    // Handle normal navigation
    if (choice.next) {
      this.processNavigation(choice, setGameState, setSelectedChoice)
      return
    }
  }
}
