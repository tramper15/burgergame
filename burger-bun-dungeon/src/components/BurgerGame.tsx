import { useState } from 'react'
import scenesData from '../data/scenes.json'
import ingredientsData from '../data/ingredients.json'
import type { ScenesData, IngredientsData, Scene, Choice, GameState } from '../types/game'
import { layouts, type LayoutType } from './layouts'
import { SceneGenerator } from '../services/SceneGenerator'
import { ChoiceProcessor } from '../services/ChoiceProcessor'
import { SCENE_IDS, NO_CHOICE_SELECTED } from '../constants/gameConstants'
import { useToast } from './ToastProvider'

const scenes = scenesData as ScenesData
const ingredients = ingredientsData as IngredientsData

interface BurgerGameProps {
  layout: LayoutType
}

const BurgerGame = ({ layout }: BurgerGameProps) => {
  const { showToast } = useToast()
  const [gameState, setGameState] = useState<GameState>({
    currentSceneId: SCENE_IDS.START,
    bunIngredients: [],
    visitedScenes: [SCENE_IDS.START],
    seenSilenceMessages: []
  })
  const [selectedChoice, setSelectedChoice] = useState<number>(NO_CHOICE_SELECTED)

  // Get current scene
  const getCurrentScene = (): Scene => {
    // Check if we need to generate a reflection scene
    if (gameState.currentSceneId === SCENE_IDS.REFLECT) {
      return SceneGenerator.generateReflectionScene(gameState, ingredients)
    }

    // Check if we need to generate a silence scene
    if (gameState.currentSceneId === SCENE_IDS.LINGER_SILENCE) {
      return SceneGenerator.generateSilenceScene(gameState, ingredients)
    }

    // Check if we need to generate an ending scene
    if (gameState.currentSceneId === SCENE_IDS.ENDING) {
      return SceneGenerator.generateEndingScene(gameState, ingredients)
    }

    // Return static scene from JSON
    return scenes[gameState.currentSceneId]
  }

  const currentScene = getCurrentScene()

  // Filter out choices for ingredients already picked
  const getAvailableChoices = (): Choice[] => {
    return currentScene.choices.filter(choice => {
      // If choice takes an ingredient, check if we already have it
      if (choice.take) {
        return !gameState.bunIngredients.includes(choice.take)
      }
      // Keep all non-ingredient choices
      return true
    })
  }

  const availableChoices = getAvailableChoices()

  const handleChoiceChange = (index: number) => {
    setSelectedChoice(index)

    // Auto-submit when a valid choice is selected
    if (index >= 0) {
      const choice = availableChoices[index]
      ChoiceProcessor.processChoice(choice, gameState, ingredients, setGameState, setSelectedChoice, showToast)
    }
  }

  const handleSubmit = () => {
    if (selectedChoice < 0) return

    const choice = availableChoices[selectedChoice]
    ChoiceProcessor.processChoice(choice, gameState, ingredients, setGameState, setSelectedChoice, showToast)
  }

  // Get the layout component
  const LayoutComponent = layouts[layout]

  return (
    <LayoutComponent
      sceneText={currentScene.text}
      availableChoices={availableChoices}
      selectedChoice={selectedChoice}
      onChoiceChange={handleChoiceChange}
      onSubmit={handleSubmit}
    />
  )
}

export default BurgerGame
