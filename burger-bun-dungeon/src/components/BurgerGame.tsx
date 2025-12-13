import { useState } from 'react'
import './Layout1.css'
import './Layout2.css'
import './Layout3.css'
import scenesData from '../data/scenes.json'
import ingredientsData from '../data/ingredients.json'
import type { ScenesData, IngredientsData, Scene, Choice, GameState } from '../types/game'

const scenes = scenesData as ScenesData
const ingredients = ingredientsData as IngredientsData

interface BurgerGameProps {
  layout: 'layout1' | 'layout2' | 'layout3'
}

const BurgerGame = ({ layout }: BurgerGameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    currentSceneId: 'kitchen_counter',
    bunIngredients: [],
    visitedScenes: ['kitchen_counter']
  })
  const [selectedChoice, setSelectedChoice] = useState<number>(-1)

  // Get current scene
  const currentScene = getCurrentScene()

  // Generate dynamic scenes (reflection, ingredient added, ending)
  function getCurrentScene(): Scene {
    // Check if we need to generate a reflection scene
    if (gameState.currentSceneId === 'REFLECT') {
      return generateReflectionScene()
    }

    // Check if we need to generate an ending scene
    if (gameState.currentSceneId === 'ENDING') {
      return generateEndingScene()
    }

    // Return static scene from JSON
    return scenes[gameState.currentSceneId]
  }

  function generateReflectionScene(): Scene {
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
      const synergyText = calculateSynergyText()
      if (synergyText) {
        text += synergyText + "\n\n"
      }

      text += "You are becoming something. But you don't know what yet."
    }

    return {
      text,
      choices: [
        { label: 'Return', next: gameState.visitedScenes[gameState.visitedScenes.length - 2] || 'kitchen_counter' }
      ]
    }
  }

  function calculateSynergyText(): string {
    const synergies: string[] = []
    const processedPairs = new Set<string>()

    // Check each pair of ingredients
    for (let i = 0; i < gameState.bunIngredients.length; i++) {
      for (let j = i + 1; j < gameState.bunIngredients.length; j++) {
        const ing1Id = gameState.bunIngredients[i]
        const ing2Id = gameState.bunIngredients[j]
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

  function generateEndingScene(): Scene {
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
    let synergyScore = 0
    const synergyMessages: string[] = []
    const processedPairs = new Set<string>()

    for (let i = 0; i < gameState.bunIngredients.length; i++) {
      for (let j = i + 1; j < gameState.bunIngredients.length; j++) {
        const ing1Id = gameState.bunIngredients[i]
        const ing2Id = gameState.bunIngredients[j]
        const pairKey = [ing1Id, ing2Id].sort().join('-')

        if (processedPairs.has(pairKey)) continue
        processedPairs.add(pairKey)

        const ing1 = ingredients[ing1Id]
        const ing2 = ingredients[ing2Id]

        if (ing1.reactions[ing2Id]) {
          synergyMessages.push(ing1.reactions[ing2Id])

          // Calculate points
          if (ing1.likes.includes(ing2Id)) {
            synergyScore += 2
            synergyMessages[synergyMessages.length - 1] += "     +2"
          } else if (ing1.dislikes.includes(ing2Id)) {
            synergyScore -= 2
            synergyMessages[synergyMessages.length - 1] += "     -2"
          }
        }
      }
    }

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

  const handleChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChoice(parseInt(e.target.value))
  }

  const handleSubmit = () => {
    if (selectedChoice < 0) return

    const choice = currentScene.choices[selectedChoice]
    processChoice(choice)
  }

  function processChoice(choice: Choice) {
    // Handle reflection
    if (choice.reflect) {
      setGameState(prev => ({
        ...prev,
        currentSceneId: 'REFLECT',
        visitedScenes: [...prev.visitedScenes, 'REFLECT']
      }))
      setSelectedChoice(-1)
      return
    }

    // Handle ending
    if (choice.end) {
      setGameState(prev => ({
        ...prev,
        currentSceneId: 'ENDING'
      }))
      setSelectedChoice(-1)
      return
    }

    // Handle taking ingredient
    if (choice.take) {
      const ingredient = ingredients[choice.take]
      const ingredientAddedText = ingredient.onAdd

      // Get synergy reactions
      let synergyText = ''
      gameState.bunIngredients.forEach(existingIngId => {
        const existingIng = ingredients[existingIngId]
        if (existingIng.reactions[choice.take!]) {
          synergyText += '\n' + existingIng.reactions[choice.take!]
        }
      })

      // Show ingredient added message
      alert(ingredientAddedText + synergyText)

      setGameState(prev => ({
        ...prev,
        bunIngredients: [...prev.bunIngredients, choice.take!],
        currentSceneId: choice.next || prev.currentSceneId,
        visitedScenes: [...prev.visitedScenes, choice.next || prev.currentSceneId]
      }))
      setSelectedChoice(-1)
      return
    }

    // Handle normal navigation
    if (choice.next) {
      // Check if we're starting over (from ending screen)
      if (gameState.currentSceneId === 'ENDING' && choice.next === 'kitchen_counter') {
        setGameState({
          currentSceneId: 'kitchen_counter',
          bunIngredients: [],
          visitedScenes: ['kitchen_counter']
        })
        setSelectedChoice(-1)
        return
      }

      setGameState(prev => ({
        ...prev,
        currentSceneId: choice.next!,
        visitedScenes: [...prev.visitedScenes, choice.next!]
      }))
      setSelectedChoice(-1)
      return
    }
  }

  // Layout 1: Classic Diner Style
  if (layout === 'layout1') {
    return (
      <div className="game-container layout1">
        <div className="game-header">
          <h1 className="game-title">🍔 Burger Bun Dungeon 🍔</h1>
        </div>

        <div className="game-content">
          <div className="story-box">
            <p className="story-text" style={{ whiteSpace: 'pre-wrap' }}>{currentScene.text}</p>
          </div>

          <div className="choice-section">
            <label className="choice-label">What will you do?</label>
            <select
              className="choice-dropdown"
              value={selectedChoice}
              onChange={handleChoiceChange}
            >
              <option value="-1">-- Choose your path --</option>
              {currentScene.choices.map((choice, index) => (
                <option key={index} value={index}>
                  {choice.label}
                </option>
              ))}
            </select>
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={selectedChoice < 0}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Layout 2: Modern Minimalist Style
  if (layout === 'layout2') {
    return (
      <div className="game-container layout2">
        <div className="minimalist-wrapper">
          <h1 className="minimal-title">Burger Bun Dungeon</h1>

          <div className="minimal-story">
            <p style={{ whiteSpace: 'pre-wrap' }}>{currentScene.text}</p>
          </div>

          <div className="minimal-choices">
            <select
              className="minimal-select"
              value={selectedChoice}
              onChange={handleChoiceChange}
            >
              <option value="-1">Select an action...</option>
              {currentScene.choices.map((choice, index) => (
                <option key={index} value={index}>
                  {choice.label}
                </option>
              ))}
            </select>
            <button
              className="minimal-button"
              onClick={handleSubmit}
              disabled={selectedChoice < 0}
            >
              →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Layout 3: Playful Cartoon Style
  return (
    <div className="game-container layout3">
      <div className="cartoon-wrapper">
        <div className="cartoon-header">
          <div className="burger-emoji">🍔</div>
          <h1 className="cartoon-title">Burger Bun Dungeon!</h1>
          <div className="burger-emoji">🍔</div>
        </div>

        <div className="cartoon-bubble">
          <div className="bubble-content">
            <p className="cartoon-text" style={{ whiteSpace: 'pre-wrap' }}>{currentScene.text}</p>
          </div>
        </div>

        <div className="cartoon-choices">
          <div className="choice-box">
            <label className="cartoon-label">🎯 Pick your adventure!</label>
            <select
              className="cartoon-select"
              value={selectedChoice}
              onChange={handleChoiceChange}
            >
              <option value="-1">🤔 What should I do?</option>
              {currentScene.choices.map((choice, index) => (
                <option key={index} value={index}>
                  {choice.label}
                </option>
              ))}
            </select>
            <button
              className="cartoon-button"
              onClick={handleSubmit}
              disabled={selectedChoice < 0}
            >
              Let's Go! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BurgerGame
