import { useState } from 'react'
import type { LayoutType } from './layouts'
import type { RPGState } from '../types/game'
import { RPGStateManager } from '../rpg/RPGStateManager'
import { CombatProcessor, type CombatAction } from '../rpg/CombatProcessor'
import { BattleSceneGenerator } from '../rpg/BattleSceneGenerator'
import { layouts } from './layouts'
import rpgScenesData from '../data/rpgScenes.json'
import rpgEnemiesData from '../data/rpgEnemies.json'

const rpgScenes = rpgScenesData as Record<string, any>
const rpgEnemies = rpgEnemiesData as Record<string, any>

interface RPGGameProps {
  layout: LayoutType
  ingredientsFromAct1: string[]
  onBackToMenu: () => void
}

type CombatPhase = 'exploration' | 'combat' | 'victory' | 'defeat' | 'fled'

/**
 * RPGGame - Main component for Trash Odyssey (Act 2) RPG mode
 * Separate from BurgerGame to keep concerns separated
 */
export default function RPGGame({ layout, ingredientsFromAct1, onBackToMenu }: RPGGameProps) {
  const [rpgState, setRpgState] = useState<RPGState>(() =>
    RPGStateManager.createInitialState(ingredientsFromAct1)
  )

  const [selectedChoice, setSelectedChoice] = useState<number>(-1)
  const [combatPhase, setCombatPhase] = useState<CombatPhase>('exploration')
  const [combatLog, setCombatLog] = useState<CombatAction[]>([])
  const [lastEnemyName, setLastEnemyName] = useState<string>('')
  const [victoryData, setVictoryData] = useState<{
    enemyName: string
    xpGained: number
    currencyGained: number
    itemsLooted: string[]
    leveledUp: boolean
    newLevel?: number
  } | null>(null)

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

  // Start combat with a specific enemy
  const startCombat = (enemyId: string) => {
    const enemyData = rpgEnemies[enemyId]
    if (!enemyData) {
      console.error(`Enemy ${enemyId} not found`)
      return
    }

    const newState = CombatProcessor.startCombat(rpgState, enemyData)
    setRpgState(newState)
    setLastEnemyName(enemyData.name)
    setCombatPhase('combat')
    setCombatLog([])
    setSelectedChoice(-1)
  }

  // Handle combat action
  const handleCombatAction = (action: 'attack' | 'defend' | 'item' | 'flee') => {
    const result = CombatProcessor.processTurn(rpgState, action)

    setRpgState(result.newState)
    setCombatLog(result.actions)
    setSelectedChoice(-1)

    // Handle combat outcome
    if (result.outcome === 'victory') {
      // Capture enemy name before endCombat clears it
      const enemyName = lastEnemyName || 'Enemy'
      const oldLevel = rpgState.level
      const endResult = CombatProcessor.endCombat(result.newState, true)
      const leveledUp = endResult.newState.level > oldLevel

      setRpgState(endResult.newState)
      setVictoryData({
        enemyName,
        xpGained: endResult.xpGained,
        currencyGained: endResult.currencyGained,
        itemsLooted: endResult.itemsLooted,
        leveledUp,
        newLevel: endResult.newState.level
      })
      setCombatPhase('victory')
    } else if (result.outcome === 'defeat') {
      setCombatPhase('defeat')
    } else if (result.outcome === 'fled') {
      const endResult = CombatProcessor.endCombat(result.newState, false)
      setRpgState(endResult.newState)
      setCombatPhase('fled')
    }
  }

  // Handle exploration choices
  const handleChoiceChange = (index: number) => {
    setSelectedChoice(index)

    const choice = availableChoices[index]
    if (!choice) return

    // Handle different choice types
    if (choice.label.includes('Back to Main Menu')) {
      onBackToMenu()
    } else if (choice.action === 'fight') {
      // Start combat
      const enemyId = choice.enemyId || 'slime_mold'
      startCombat(enemyId)
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

  // Determine what to display based on combat phase
  let displayText = sceneText
  let displayChoices = availableChoices
  let onChoiceChange = handleChoiceChange

  if (combatPhase === 'combat') {
    // In combat - show battle scene
    displayText = BattleSceneGenerator.generateBattleScene(rpgState, combatLog)
    displayChoices = [
      { label: '⚔️ Attack', action: 'attack' },
      { label: '🛡️ Defend', action: 'defend' },
      { label: '🎒 Use Item', action: 'item' },
      { label: '🏃 Flee', action: 'flee' }
    ]
    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const action = ['attack', 'defend', 'item', 'flee'][index] as 'attack' | 'defend' | 'item' | 'flee'
      handleCombatAction(action)
    }
  } else if (combatPhase === 'victory' && victoryData) {
    // Victory screen
    displayText = BattleSceneGenerator.generateVictoryScreen(
      victoryData.enemyName,
      victoryData.xpGained,
      victoryData.currencyGained,
      victoryData.itemsLooted,
      victoryData.leveledUp,
      victoryData.newLevel
    )
    displayChoices = [
      { label: '→ Continue', action: 'continue' }
    ]
    onChoiceChange = () => {
      setCombatPhase('exploration')
      setVictoryData(null)
      setCombatLog([])
      setSelectedChoice(-1)
      setLastEnemyName('')
    }
  } else if (combatPhase === 'defeat') {
    // Defeat screen
    displayText = BattleSceneGenerator.generateDefeatScreen()
    displayChoices = [
      { label: '→ Respawn at Checkpoint', action: 'respawn' },
      { label: '← Back to Main Menu', action: 'menu' }
    ]
    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      if (index === 0) {
        // Respawn - restore HP to max
        setRpgState({
          ...rpgState,
          hp: rpgState.maxHp,
          inCombat: false,
          currentEnemy: undefined
        })
        setCombatPhase('exploration')
        setCombatLog([])
      } else {
        onBackToMenu()
      }
    }
  } else if (combatPhase === 'fled') {
    // Fled screen - use captured enemy name
    displayText = BattleSceneGenerator.generateFleeScreen(lastEnemyName || 'enemy')
    displayChoices = [
      { label: '→ Continue', action: 'continue' }
    ]
    onChoiceChange = () => {
      setCombatPhase('exploration')
      setCombatLog([])
      setSelectedChoice(-1)
      setLastEnemyName('')
    }
  }

  return (
    <LayoutComponent
      sceneText={displayText}
      availableChoices={displayChoices}
      selectedChoice={selectedChoice}
      onChoiceChange={onChoiceChange}
      onSubmit={handleSubmit}
    />
  )
}
