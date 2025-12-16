import { useState, useEffect, useRef, useMemo } from 'react'
import scenesData from '../data/scenes.json'
import ingredientsData from '../data/ingredients.json'
import type { ScenesData, IngredientsData, Choice, GameState } from '../types/game'
import { layouts, type LayoutType } from './layouts'
import { SceneGenerator } from '../services/SceneGenerator'
import { ChoiceProcessor } from '../services/ChoiceProcessor'
import { AchievementService } from '../services/AchievementService'
import { SCENE_IDS, NO_CHOICE_SELECTED } from '../constants/gameConstants'
import { UI } from '../constants/UIConstants'
import { useToast } from './ToastProvider'
import { useAchievements } from './AchievementProvider'

const scenes = scenesData as ScenesData
const ingredients = ingredientsData as IngredientsData

interface BurgerGameProps {
  layout: LayoutType
  onSceneChange?: (sceneId: string) => void
  onResetGame?: (resetFn: () => void) => void
  onStartTrashOdyssey?: () => void
  trashOdysseyUnlocked?: boolean
  onGameEnd?: (ingredients: string[]) => void
}

const BurgerGame = ({ layout, onSceneChange, onResetGame, onStartTrashOdyssey, trashOdysseyUnlocked, onGameEnd }: BurgerGameProps) => {
  const { showToast } = useToast()
  const { progress, unlockAchievement } = useAchievements()
  const [gameState, setGameState] = useState<GameState>({
    currentSceneId: SCENE_IDS.START,
    bunIngredients: [],
    visitedScenes: [SCENE_IDS.START],
    seenSilenceMessages: []
  })
  const [selectedChoice, setSelectedChoice] = useState<number>(NO_CHOICE_SELECTED)
  const [currentEndingType, setCurrentEndingType] = useState<string | null>(null)
  const achievementsChecked = useRef(false)

  // Get current scene - use useMemo to avoid recalculating on every render
  const currentSceneData = useMemo(() => {
    // Check if we need to generate a reflection scene
    if (gameState.currentSceneId === SCENE_IDS.REFLECT) {
      return { scene: SceneGenerator.generateReflectionScene(gameState, ingredients), endingType: null }
    }

    // Check if we need to generate a silence scene
    if (gameState.currentSceneId === SCENE_IDS.LINGER_SILENCE) {
      return { scene: SceneGenerator.generateSilenceScene(gameState, ingredients), endingType: null }
    }

    // Check if we need to generate an ending scene
    if (gameState.currentSceneId === SCENE_IDS.ENDING) {
      const { scene, endingType } = SceneGenerator.generateEndingScene(gameState, ingredients)
      return { scene, endingType }
    }

    // Return static scene from JSON
    return { scene: scenes[gameState.currentSceneId], endingType: null }
  }, [gameState.currentSceneId, gameState.bunIngredients, gameState.seenSilenceMessages])

  const currentScene = currentSceneData.scene

  // Update ending type when it changes
  useEffect(() => {
    if (currentSceneData.endingType) {
      setCurrentEndingType(currentSceneData.endingType)
    }
  }, [currentSceneData.endingType])

  // Notify parent component of scene changes
  useEffect(() => {
    if (onSceneChange) {
      onSceneChange(gameState.currentSceneId)
    }
  }, [gameState.currentSceneId, onSceneChange])

  // Expose reset function to parent via callback
  useEffect(() => {
    if (onResetGame) {
      onResetGame(() => {
        ChoiceProcessor.processRestart(setGameState, setSelectedChoice)
      })
    }
  }, [onResetGame])

  // Check for achievements when ending is reached
  useEffect(() => {
    if (gameState.currentSceneId === SCENE_IDS.ENDING && currentEndingType && !achievementsChecked.current) {
      achievementsChecked.current = true

      const newlyUnlocked = AchievementService.checkAchievements(gameState, currentEndingType, progress)

      // Show toasts for newly unlocked achievements
      newlyUnlocked.forEach((achievementId, index) => {
        const achievement = AchievementService.getAchievement(achievementId)
        if (achievement) {
          // Delay each toast slightly so they show sequentially
          setTimeout(() => {
            showToast(`Achievement Unlocked: ${achievement.title}`)
            unlockAchievement(achievementId)
          }, index * UI.ACHIEVEMENT_TOAST_DELAY_MS)
        }
      })

      // Report ingredients to parent for RPG mode
      if (onGameEnd) {
        onGameEnd(gameState.bunIngredients)
      }
    }

    // Reset flag when leaving ending screen
    if (gameState.currentSceneId !== SCENE_IDS.ENDING) {
      achievementsChecked.current = false
      setCurrentEndingType(null)
    }
  }, [gameState.currentSceneId, currentEndingType, unlockAchievement, showToast, onGameEnd, gameState.bunIngredients])

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
      isEndingScreen={gameState.currentSceneId === SCENE_IDS.ENDING}
      trashOdysseyUnlocked={trashOdysseyUnlocked}
      onStartTrashOdyssey={onStartTrashOdyssey}
    />
  )
}

export default BurgerGame
