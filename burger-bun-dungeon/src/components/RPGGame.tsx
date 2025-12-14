import { useState } from 'react'
import type { LayoutType } from './layouts'
import type { RPGState } from '../types/game'
import { RPGStateManager } from '../rpg/RPGStateManager'
import { layouts } from './layouts'
import rpgScenesData from '../data/rpgScenes.json'

const rpgScenes = rpgScenesData as Record<string, any>

interface RPGGameProps {
  layout: LayoutType
  ingredientsFromAct1: string[]
  onBackToMenu: () => void
}

/**
 * RPGGame - Main component for Trash Odyssey (Act 2) RPG mode
 * Separate from BurgerGame to keep concerns separated
 */
export default function RPGGame({ layout, ingredientsFromAct1, onBackToMenu }: RPGGameProps) {
  const [rpgState] = useState<RPGState>(() =>
    RPGStateManager.createInitialState(ingredientsFromAct1)
  )

  const [selectedChoice, setSelectedChoice] = useState<number>(-1)
  const LayoutComponent = layouts[layout]

  // Get current scene from JSON data
  const currentSceneData = rpgScenes[rpgState.currentLocation]

  // Build the opening cutscene text
  const openingCutsceneText = `═══════════════════════════════════════════
ACT 2: TRASH ODYSSEY
═══════════════════════════════════════════

You've found meaning. You've collected ingredients.
You've lingered in silence and found peace.

The person lifts you to their mouth...

"Ugh, too much avocado."

THUNK.

You tumble through darkness. Land in wetness.
Coffee grounds. Banana peels. The stench of decay.

The garbage can.

For a moment, you despair.

But then you remember: You have PURPOSE now.
You're not just a bun. You're a COMPLETE bun.

And complete buns don't give up.

Somewhere beyond this trash, beyond the backyard,
there's a shed. And in that shed, a lunchbox.

A place where forgotten foods rest in peace.

You will reach it.

No matter how many monsters stand in your way.

═══════════════════════════════════════════

Level: ${rpgState.level}
HP: ${rpgState.hp}/${rpgState.maxHp}
ATK: ${rpgState.stats.atk} | DEF: ${rpgState.stats.def} | SPD: ${rpgState.stats.spd}

Ingredient Powers Active: ${Object.keys(rpgState.ingredientBonuses).length}
`

  // Use the scene text from JSON
  const sceneText = rpgState.currentLocation === 'garbage_can_start'
    ? openingCutsceneText
    : currentSceneData?.description || 'Location not found'

  const availableChoices = currentSceneData?.choices || [
    { label: '← Back to Main Menu' }
  ]

  const handleChoiceChange = (index: number) => {
    setSelectedChoice(index)

    const choice = availableChoices[index]
    if (!choice) return

    // Handle different choice types
    if (choice.label.includes('Back to Main Menu')) {
      onBackToMenu()
    } else if (choice.next) {
      // Will implement navigation in Phase 3
      alert(`Navigation to ${choice.next} coming in Phase 3!`)
    } else if (choice.action) {
      // Will implement actions in Phase 4-6
      alert(`Action ${choice.action} coming in later phases!`)
    }
  }

  const handleSubmit = () => {
    // Auto-submit handled in handleChoiceChange for now
  }

  return (
    <LayoutComponent
      sceneText={sceneText}
      availableChoices={availableChoices}
      selectedChoice={selectedChoice}
      onChoiceChange={handleChoiceChange}
      onSubmit={handleSubmit}
    />
  )
}
