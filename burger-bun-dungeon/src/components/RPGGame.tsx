import { useState, useEffect, useRef } from 'react'
import type { LayoutType } from './layouts'
import type { RPGState, Equipment } from '../types/game'
import { RPGStateManager } from '../rpg/RPGStateManager'
import { CombatProcessor, type CombatAction } from '../rpg/CombatProcessor'
import { BattleSceneGenerator } from '../rpg/BattleSceneGenerator'
import { InventoryManager } from '../rpg/InventoryManager'
import { ShopProcessor } from '../rpg/ShopProcessor'
import { ItemDatabase } from '../rpg/ItemDatabase'
import { AchievementService } from '../services/AchievementService'
import { useAchievements } from './AchievementProvider'
import { useToast } from './ToastProvider'
import { layouts } from './layouts'
import rpgScenesData from '../data/rpgScenes.json'
import rpgEnemiesData from '../data/rpgEnemies.json'

const rpgScenes = rpgScenesData as Record<string, any>
const rpgEnemies = rpgEnemiesData as Record<string, any>

interface RPGGameProps {
  layout: LayoutType
  ingredientsFromAct1: string[]
  onBackToMenu: () => void
  onResetGame?: (resetFn: () => void) => void
}

type CombatPhase = 'exploration' | 'combat' | 'item_menu' | 'ability_menu' | 'inventory_view' | 'unequip_menu' | 'victory' | 'defeat' | 'fled' | 'shop_buy' | 'shop_sell'

/**
 * RPGGame - Main component for Trash Odyssey (Act 2) RPG mode
 * Separate from BurgerGame to keep concerns separated
 */
export default function RPGGame({ layout, ingredientsFromAct1, onBackToMenu, onResetGame }: RPGGameProps) {
  const { showToast } = useToast()
  const { progress, unlockAchievement } = useAchievements()
  const achievementsChecked = useRef(false)

  const [rpgState, setRpgState] = useState<RPGState>(() =>
    RPGStateManager.createInitialState(ingredientsFromAct1)
  )

  const [selectedChoice, setSelectedChoice] = useState<number>(-1)
  const [combatPhase, setCombatPhase] = useState<CombatPhase>('exploration')
  const [combatLog, setCombatLog] = useState<CombatAction[]>([])
  const [lastEnemyName, setLastEnemyName] = useState<string>('')
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null) // For random encounters
  const [victoryData, setVictoryData] = useState<{
    enemyName: string
    xpGained: number
    currencyGained: number
    itemsLooted: string[]
    leveledUp: boolean
    newLevel?: number
  } | null>(null)
  const [shopMessage, setShopMessage] = useState<string>('')

  const LayoutComponent = layouts[layout]

  // Check for achievements when reaching endings or achieving milestones
  const checkAchievements = (endingType: string | null = null) => {
    const newlyUnlocked = AchievementService.checkRPGAchievements(rpgState, endingType, progress)

    // Show toasts for newly unlocked achievements
    newlyUnlocked.forEach((achievementId, index) => {
      const achievement = AchievementService.getAchievement(achievementId)
      if (achievement) {
        // Delay each toast slightly so they show sequentially
        setTimeout(() => {
          showToast(`Achievement Unlocked: ${achievement.title}`)
          unlockAchievement(achievementId)
        }, index * 500) // 500ms between each toast
      }
    })
  }

  // Register reset function with parent component
  useEffect(() => {
    if (onResetGame) {
      onResetGame(() => {
        setRpgState(RPGStateManager.createInitialState(ingredientsFromAct1))
        setCombatPhase('exploration')
        setSelectedChoice(-1)
        setCombatLog([])
        setLastEnemyName('')
        setPendingNavigation(null)
        setVictoryData(null)
        setShopMessage('')
        achievementsChecked.current = false
      })
    }
  }, [onResetGame, ingredientsFromAct1])

  // Check achievements when reaching ending scenes
  useEffect(() => {
    const currentScene = rpgScenes[rpgState.currentLocation]

    if (currentScene && currentScene.type === 'ending' && !achievementsChecked.current) {
      achievementsChecked.current = true
      const endingType = currentScene.endingType
      checkAchievements(endingType)
    }

    // Reset achievement check flag when leaving ending scenes
    if (currentScene && currentScene.type !== 'ending') {
      achievementsChecked.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpgState.currentLocation])

  // Check milestone achievements whenever rpgState changes (level, stats, bosses, currency)
  useEffect(() => {
    // Only check milestones during exploration phase (not during combat)
    if (combatPhase === 'exploration') {
      checkAchievements(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpgState.level, rpgState.stats, rpgState.defeatedBosses, rpgState.currency, combatPhase])

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
  // Show first visit text if this is the first time, otherwise show regular description
  const isFirstVisit = !rpgState.visitedLocations.includes(rpgState.currentLocation)
  let sceneText = 'Location not found'

  if (rpgState.currentLocation === 'garbage_can_start' && isFirstVisit) {
    sceneText = openingCutsceneText
  } else if (currentSceneData) {
    // Check if current location is a checkpoint
    const isCheckpoint = currentSceneData.type === 'checkpoint' || currentSceneData.type === 'safe'
    const checkpointMarker = isCheckpoint ? ' [CHECKPOINT]' : ''

    // Show first visit text if available and this is the first visit
    if (isFirstVisit && currentSceneData.firstVisit) {
      sceneText = `${currentSceneData.name}${checkpointMarker}\n\n${currentSceneData.firstVisit}\n\n---\n\nLevel: ${rpgState.level} | HP: ${rpgState.hp}/${rpgState.maxHp}\nATK: ${rpgState.stats.atk} | DEF: ${rpgState.stats.def} | SPD: ${rpgState.stats.spd}\nCurrency: ${rpgState.currency} Scraps`
    } else {
      sceneText = `${currentSceneData.name}${checkpointMarker}\n\n${currentSceneData.description}\n\n---\n\nLevel: ${rpgState.level} | HP: ${rpgState.hp}/${rpgState.maxHp}\nATK: ${rpgState.stats.atk} | DEF: ${rpgState.stats.def} | SPD: ${rpgState.stats.spd}\nCurrency: ${rpgState.currency} Scraps`
    }
  }

  // Add restart option to all scenes
  const addRestartOption = (choices: any[]) => {
    return [
      ...choices,
      { label: '🔄 Restart Act 2 (Fresh Start)', action: 'restart_act2' }
    ]
  }

  // Add inventory/equipment option to all exploration scenes
  const explorationChoicesWithInventory = (choices: any[]) => {
    return [
      { label: '📦 View Inventory & Equipment', action: 'view_inventory' },
      ...addRestartOption(choices)
    ]
  }

  // Filter out boss battles if the boss has already been defeated
  let availableChoices = currentSceneData?.choices || [
    { label: '← Back to Main Menu' }
  ]

  if (currentSceneData) {
    availableChoices = availableChoices.filter((choice: any) => {
      // If this choice requires a boss to be defeated, check if it is
      if (choice.requiresBossDefeated) {
        return rpgState.defeatedBosses.includes(choice.requiresBossDefeated)
      }

      // If this choice has a condition, check if it's met
      if (choice.condition) {
        // Check for visited location condition (e.g., "visited_trash_bag_depths")
        if (choice.condition.startsWith('visited_')) {
          const locationId = choice.condition.replace('visited_', '')
          return rpgState.visitedLocations.includes(locationId)
        }
        // Check if player has all ingredients from Act 1
        if (choice.condition === 'has_all_ingredients') {
          const ingredientCount = Object.keys(rpgState.ingredientBonuses).length
          // Check if player has at least 5 ingredients (configurable threshold)
          return ingredientCount >= 5
        }
        // Add more condition types here if needed
        return false
      }

      // If this choice leads to a boss battle, check if boss is defeated
      if (choice.next) {
        const nextScene = rpgScenes[choice.next]
        if (nextScene && nextScene.type === 'boss_battle' && nextScene.boss) {
          // Don't show the boss fight option if already defeated
          return !rpgState.defeatedBosses.includes(nextScene.boss)
        }
      }
      return true
    })
  }

  // Start combat with a specific enemy
  const startCombat = (enemyId: string) => {
    const enemyData = rpgEnemies[enemyId]
    if (!enemyData) {
      showToast('Combat error! Returning to safety...')
      setCombatPhase('exploration')
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
  const handleCombatAction = (action: 'attack' | 'defend' | 'item' | 'flee' | 'ability', itemOrAbilityId?: string) => {
    // If action is 'item' but no itemId, show item menu
    if (action === 'item' && !itemOrAbilityId) {
      setCombatPhase('item_menu')
      setSelectedChoice(-1)
      return
    }

    // If action is 'ability' but no abilityId, show ability menu
    if (action === 'ability' && !itemOrAbilityId) {
      setCombatPhase('ability_menu')
      setSelectedChoice(-1)
      return
    }

    const result = CombatProcessor.processTurn(rpgState, action, itemOrAbilityId)

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

      // Check if we defeated a boss and need to progress to next location
      const currentScene = rpgScenes[rpgState.currentLocation]
      let nextStateAfterVictory = endResult.newState

      if (currentScene && currentScene.type === 'boss_battle' && currentScene.onVictory) {
        // Boss defeated - mark it and prepare to navigate to victory location
        const bossId = currentScene.boss
        nextStateAfterVictory = {
          ...endResult.newState,
          defeatedBosses: endResult.newState.defeatedBosses.includes(bossId)
            ? endResult.newState.defeatedBosses
            : [...endResult.newState.defeatedBosses, bossId]
        }
      }

      setRpgState(nextStateAfterVictory)
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
      setPendingNavigation(null) // Clear pending navigation on defeat
      setCombatPhase('defeat')
    } else if (result.outcome === 'fled') {
      setPendingNavigation(null) // Clear pending navigation on flee
      const endResult = CombatProcessor.endCombat(result.newState, false)
      setRpgState(endResult.newState)
      setCombatPhase('fled')
    }
  }

  // Handle exploration choices
  const handleChoiceChange = (index: number) => {
    setSelectedChoice(index)

    // Get the actual displayed choices (with inventory and restart buttons)
    const displayedChoices = explorationChoicesWithInventory(availableChoices)
    const choice = displayedChoices[index]
    if (!choice) return

    // Handle different choice types
    if (choice.action === 'view_inventory') {
      setCombatPhase('inventory_view')
      setSelectedChoice(-1) // Clear selection when entering inventory
    } else if (choice.action === 'restart_act2') {
      // Restart Act 2 with fresh state
      if (window.confirm('Are you sure you want to restart Act 2? All progress in Trash Odyssey will be lost.')) {
        setRpgState(RPGStateManager.createInitialState(ingredientsFromAct1))
        setCombatPhase('exploration')
        setSelectedChoice(-1)
      }
    } else if (choice.label.includes('Back to Main Menu')) {
      onBackToMenu()
    } else if (choice.action === 'fight') {
      // Start combat
      const enemyId = choice.enemyId || 'slime_mold'
      startCombat(enemyId)
    } else if (choice.next) {
      // Navigate to new location
      const nextLocation = choice.next
      const nextSceneData = rpgScenes[nextLocation]

      if (!nextSceneData) {
        showToast('Location not found! Staying here...')
        return
      }

      // Check if this is a boss battle location
      if (nextSceneData.type === 'boss_battle') {
        // Navigate to boss battle location first, then start combat
        setRpgState(prev => RPGStateManager.changeLocation(prev, nextLocation))
        setSelectedChoice(-1)

        // Set pending navigation to where we go after beating the boss
        if (nextSceneData.onVictory) {
          setPendingNavigation(nextSceneData.onVictory)
        }

        // Automatically start the boss fight
        const bossId = nextSceneData.boss
        if (bossId) {
          startCombat(bossId)
        }
      } else {
        // Check for random encounters
        const shouldTriggerEncounter = checkRandomEncounter(nextSceneData)

        if (shouldTriggerEncounter) {
          // Trigger random encounter BEFORE navigating to location
          const enemyId = selectRandomEnemy(nextSceneData.encounterTable)
          if (enemyId) {
            // Store where we want to go after this fight
            setPendingNavigation(nextLocation)
            startCombat(enemyId)
            return
          }
        }

        // Navigate to location and mark as visited
        setRpgState(prev => RPGStateManager.changeLocation(prev, nextLocation))
        setSelectedChoice(-1)
      }
    } else if (choice.action === 'rest') {
      // Rest at checkpoint - heal to full HP and save checkpoint
      setRpgState(prev => RPGStateManager.addCheckpoint(
        { ...prev, hp: prev.maxHp },
        prev.currentLocation
      ))
      setSelectedChoice(-1)
    } else if (choice.action === 'open_shop') {
      // Open shop interface
      setCombatPhase('shop_buy')
      setShopMessage('')
      setSelectedChoice(-1)
    } else if (choice.action) {
      // Will implement other actions in later phases
      alert(`Action ${choice.action} coming in later phases!`)
    }
  }

  // Check if a random encounter should trigger (30% default, or custom rate for risky routes)
  const checkRandomEncounter = (sceneData: any): boolean => {
    if (sceneData.type !== 'combat') return false
    if (!sceneData.encounterTable || sceneData.encounterTable.length === 0) return false

    // Use custom encounter rate if specified (for risky routes), otherwise default 30%
    const encounterRate = sceneData.encounterRate ?? 0.3
    return Math.random() < encounterRate
  }

  // Select a random enemy from the encounter table based on weights
  const selectRandomEnemy = (encounterTable: any[]): string | null => {
    if (!encounterTable || encounterTable.length === 0) return null

    const totalWeight = encounterTable.reduce((sum, entry) => sum + entry.weight, 0)
    let random = Math.random() * totalWeight

    for (const entry of encounterTable) {
      random -= entry.weight
      if (random <= 0) {
        return entry.enemyId
      }
    }

    return encounterTable[0].enemyId // Fallback
  }

  // Determine what to display based on combat phase
  let displayText = sceneText
  let displayChoices = combatPhase === 'exploration'
    ? explorationChoicesWithInventory(availableChoices)
    : availableChoices
  let onChoiceChange = handleChoiceChange

  if (combatPhase === 'inventory_view') {
    // Show inventory and equipment
    const usableItems = InventoryManager.getUsableConsumables(rpgState)
    const equippableItems = InventoryManager.getEquippableItems(rpgState)
    const { weapon, armor, shield, accessory, accessory2 } = rpgState.equipment

    // Build ingredient bonuses display
    const ingredientBonusesText = Object.keys(rpgState.ingredientBonuses).length > 0
      ? Object.entries(rpgState.ingredientBonuses).map(([ingredientId, bonus]) => {
          const bonusParts: string[] = []
          if (bonus.atk) bonusParts.push(`ATK +${bonus.atk}`)
          if (bonus.def) bonusParts.push(`DEF +${bonus.def}`)
          if (bonus.spd) bonusParts.push(`SPD +${bonus.spd}`)
          if (bonus.maxHp) bonusParts.push(`MaxHP +${bonus.maxHp}`)
          if (bonus.ability) bonusParts.push(`Ability: ${bonus.ability}`)
          return `${ingredientId}: ${bonusParts.length > 0 ? bonusParts.join(', ') : 'Unknown bonus'}`
        }).join('\n')
      : 'None'

    displayText = `═══════════════════════════════════════════
INVENTORY & EQUIPMENT
═══════════════════════════════════════════

--- EQUIPPED ---
Weapon: ${weapon?.name || 'None'} (ATK +${weapon?.stats.atk || 0})
Armor: ${armor?.name || 'None'} (DEF +${armor?.stats.def || 0})
Shield: ${shield?.name || 'None'} (DEF +${shield?.stats.def || 0})
Accessory 1: ${accessory?.name || 'None'}${accessory?.stats ? ` (ATK +${accessory.stats.atk || 0}, DEF +${accessory.stats.def || 0}, SPD +${accessory.stats.spd || 0})` : ''}
Accessory 2: ${accessory2?.name || 'None'}${accessory2?.stats ? ` (ATK +${accessory2.stats.atk || 0}, DEF +${accessory2.stats.def || 0}, SPD +${accessory2.stats.spd || 0})` : ''}

--- INGREDIENT BONUSES (from Act 1) ---
${ingredientBonusesText}

--- EQUIPMENT IN INVENTORY ---
${equippableItems.length > 0
  ? equippableItems.map(item => `${item.name} x${item.quantity} - ${item.description}`).join('\n')
  : 'No equipment in inventory'}

--- CONSUMABLES ---
${usableItems.length > 0
  ? usableItems.map(item => `${item.name} x${item.quantity} - ${item.description}`).join('\n')
  : 'No consumable items'}

--- STATS ---
Level: ${rpgState.level} | HP: ${rpgState.hp}/${rpgState.maxHp}
ATK: ${rpgState.stats.atk} | DEF: ${rpgState.stats.def} | SPD: ${rpgState.stats.spd}
Currency: ${rpgState.currency} Scraps
XP: ${rpgState.xp}/${rpgState.maxXp}
`

    displayChoices = [
      ...equippableItems.map(item => ({
        label: `⚔️ Equip ${item.name}`,
        itemId: item.id,
        action: 'equip'
      })),
      ...usableItems.map(item => ({
        label: `💊 Use ${item.name} (heal ${item.effect?.healHp || 0} HP)`,
        itemId: item.id,
        action: 'use'
      })),
      { label: '🗑️ Unequip Items', action: 'unequip_menu' },
      { label: '← Back', action: 'back' }
    ]

    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const choice = displayChoices[index]

      if (choice.action === 'back') {
        setCombatPhase('exploration')
        setSelectedChoice(-1)
      } else if (choice.action === 'unequip_menu') {
        setCombatPhase('unequip_menu')
        setSelectedChoice(-1)
      } else if (choice.action === 'equip' && choice.itemId) {
        // Equip item
        const equipResult = InventoryManager.equipItem(rpgState, choice.itemId)
        if (equipResult.success) {
          setRpgState(equipResult.newState)
        } else {
          // Show error message if equipping failed
          alert(equipResult.message)
        }
        setSelectedChoice(-1)
      } else if (choice.action === 'use' && choice.itemId) {
        // Use item outside of combat
        const useResult = InventoryManager.useConsumable(rpgState, choice.itemId)
        if (useResult.success) {
          setRpgState(useResult.newState)
        }
        setSelectedChoice(-1)
      }
    }
  } else if (combatPhase === 'unequip_menu') {
    // Unequip menu - show all equipped items that can be unequipped
    const { weapon, armor, shield, accessory, accessory2 } = rpgState.equipment
    const unequippableItems: Array<{ slot: string; item: Equipment }> = []

    if (weapon && !ItemDatabase.isStartingEquipment(weapon.id)) {
      unequippableItems.push({ slot: 'weapon', item: weapon })
    }
    if (armor && !ItemDatabase.isStartingEquipment(armor.id)) {
      unequippableItems.push({ slot: 'armor', item: armor })
    }
    if (shield && !ItemDatabase.isStartingEquipment(shield.id)) {
      unequippableItems.push({ slot: 'shield', item: shield })
    }
    if (accessory) {
      unequippableItems.push({ slot: 'accessory', item: accessory })
    }
    if (accessory2) {
      unequippableItems.push({ slot: 'accessory2', item: accessory2 })
    }

    displayText = `═══════════════════════════════════════════
UNEQUIP ITEMS
═══════════════════════════════════════════

Select an item to unequip:

${unequippableItems.length > 0
  ? unequippableItems.map(({ slot, item }) => {
      const slotName = slot === 'accessory' ? 'Accessory 1' : slot === 'accessory2' ? 'Accessory 2' : slot.charAt(0).toUpperCase() + slot.slice(1)
      return `${slotName}: ${item.name}`
    }).join('\n')
  : 'No items can be unequipped (starting equipment cannot be removed)'}
`

    displayChoices = [
      ...unequippableItems.map(({ slot, item }) => ({
        label: `🗑️ Unequip ${item.name}`,
        slot: slot,
        action: 'unequip'
      })),
      { label: '← Back to Inventory', action: 'back' }
    ]

    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const choice = displayChoices[index]

      if (choice.action === 'back') {
        setCombatPhase('inventory_view')
        setSelectedChoice(-1)
      } else if (choice.action === 'unequip' && choice.slot) {
        // Unequip item from the selected slot
        const unequipResult = InventoryManager.unequipItem(rpgState, choice.slot as any)
        if (unequipResult.success) {
          setRpgState(unequipResult.newState)
        } else {
          alert(unequipResult.message)
        }
        setSelectedChoice(-1)
      }
    }
  } else if (combatPhase === 'combat') {
    // In combat - show battle scene
    displayText = BattleSceneGenerator.generateBattleScene(rpgState, combatLog)

    // Check if player has abilities
    const playerAbilities = RPGStateManager.getPlayerAbilities(rpgState)
    const hasAbilities = playerAbilities.length > 0

    displayChoices = [
      { label: '⚔️ Attack', action: 'attack' },
      { label: '🛡️ Defend', action: 'defend' },
      ...(hasAbilities ? [{ label: '✨ Abilities', action: 'abilities' }] : []),
      { label: '🎒 Use Item', action: 'item' },
      { label: '🏃 Flee', action: 'flee' }
    ]
    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const choice = displayChoices[index]

      if (choice.action === 'abilities') {
        setCombatPhase('ability_menu')
        setSelectedChoice(-1)
      } else if (choice.action === 'item') {
        setCombatPhase('item_menu')
        setSelectedChoice(-1)
      } else {
        const action = choice.action as 'attack' | 'defend' | 'flee'
        handleCombatAction(action)
      }
    }
  } else if (combatPhase === 'item_menu') {
    // Item selection menu
    const usableItems = InventoryManager.getUsableConsumables(rpgState)

    if (usableItems.length === 0) {
      displayText = BattleSceneGenerator.generateBattleScene(rpgState, combatLog) + '\n\n--- INVENTORY ---\n\nYou have no usable items!'
      displayChoices = [
        { label: '← Back to Combat', action: 'back' }
      ]
      onChoiceChange = () => {
        setCombatPhase('combat')
        setSelectedChoice(-1)
      }
    } else {
      displayText = BattleSceneGenerator.generateBattleScene(rpgState, combatLog) + '\n\n--- INVENTORY ---\n\nSelect an item to use:\n'
      displayChoices = [
        ...usableItems.map(item => ({
          label: `${item.name} (${item.quantity}x) - ${item.description}`,
          itemId: item.id
        })),
        { label: '← Back to Combat', action: 'back' }
      ]
      onChoiceChange = (index: number) => {
        setSelectedChoice(index)
        const choice = displayChoices[index]

        if (choice.action === 'back') {
          setCombatPhase('combat')
          setSelectedChoice(-1)
        } else if (choice.itemId) {
          // Use the selected item
          handleCombatAction('item', choice.itemId)
          setCombatPhase('combat')
        }
      }
    }
  } else if (combatPhase === 'ability_menu') {
    // Ability selection menu
    const playerAbilities = RPGStateManager.getPlayerAbilities(rpgState)

    // Define ability descriptions
    const abilityDescriptions: Record<string, string> = {
      poison_strike: 'Poison Strike - 5 damage over 3 turns',
      onion_tears: 'Onion Tears - 12 AOE damage (costs 10 HP)',
      heal: 'Heal - Restore 20 HP (unlimited)'
    }

    displayText = BattleSceneGenerator.generateBattleScene(rpgState, combatLog) + '\n\n--- ABILITIES ---\n\nSelect an ability to use:\n'
    displayChoices = [
      ...playerAbilities.map(abilityId => ({
        label: abilityDescriptions[abilityId] || abilityId,
        abilityId: abilityId
      })),
      { label: '← Back to Combat', action: 'back' }
    ]
    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const choice = displayChoices[index]

      if (choice.action === 'back') {
        setCombatPhase('combat')
        setSelectedChoice(-1)
      } else if (choice.abilityId) {
        // Use the selected ability
        handleCombatAction('ability' as any, choice.abilityId)
        setCombatPhase('combat')
      }
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
      // Check if we just defeated a boss by looking at defeated bosses list
      // If we defeated a boss, use pending navigation (which was set during boss battle setup)
      if (pendingNavigation) {
        // Navigate to the pending location (either after random encounter or boss battle)
        setRpgState(prev => RPGStateManager.changeLocation(prev, pendingNavigation))
        setPendingNavigation(null)
      }

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
        // Respawn at last checkpoint - restore HP to max and return to last checkpoint
        const lastCheckpoint = rpgState.checkpoints[rpgState.checkpoints.length - 1] || 'garbage_can_start'
        setRpgState(prev => RPGStateManager.changeLocation(
          {
            ...prev,
            hp: prev.maxHp,
            inCombat: false,
            currentEnemy: undefined
          },
          lastCheckpoint
        ))
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
  } else if (combatPhase === 'shop_buy') {
    // Shop Buy Interface
    const shopLocation = 'trash_bag_depths'
    const availableItems = ShopProcessor.getAvailableItemsForPlayer(shopLocation, rpgState.currency, rpgState.defeatedBosses)

    displayText = `═══════════════════════════════════════════
COCKROACH MERCHANT'S SHOP
═══════════════════════════════════════════

"Hehehe, welcome, welcome! You look hungry, yes?
I have finest goods in all trash can!"

Your Scraps: ${rpgState.currency}

--- AVAILABLE ITEMS ---

${availableItems.map((shopItem, idx) => {
  const affordSymbol = shopItem.canAfford ? '✓' : '✗'
  return `${idx + 1}. ${shopItem.item.name} - ${shopItem.item.shopPrice} Scraps ${affordSymbol}
   ${shopItem.item.description}`
}).join('\n\n')}

${shopMessage ? `\n${shopMessage}\n` : ''}`

    displayChoices = [
      ...availableItems.map(shopItem => ({
        label: `Buy ${shopItem.item.name} (${shopItem.item.shopPrice} Scraps)`,
        itemId: shopItem.item.id,
        canAfford: shopItem.canAfford
      })),
      { label: '→ Sell Items', action: 'switch_to_sell' },
      { label: '← Leave Shop', action: 'leave_shop' }
    ]

    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const choice = displayChoices[index]

      if (choice.action === 'leave_shop') {
        setCombatPhase('exploration')
        setShopMessage('')
        setSelectedChoice(-1)
      } else if (choice.action === 'switch_to_sell') {
        setCombatPhase('shop_sell')
        setShopMessage('')
        setSelectedChoice(-1)
      } else if (choice.itemId) {
        // Try to buy the item
        const result = ShopProcessor.buyItem(rpgState, choice.itemId, shopLocation)
        if (result.success) {
          setRpgState(result.newState)
          setShopMessage(`✓ ${result.message}`)
        } else {
          setShopMessage(`✗ ${result.message}`)
        }
        setSelectedChoice(-1)
      }
    }
  } else if (combatPhase === 'shop_sell') {
    // Shop Sell Interface
    const sellableItems = ShopProcessor.getSellableItems(rpgState)

    displayText = `═══════════════════════════════════════════
COCKROACH MERCHANT'S SHOP - SELL ITEMS
═══════════════════════════════════════════

"You want to sell? Let me see what you have!"

Your Scraps: ${rpgState.currency}

--- YOUR SELLABLE ITEMS ---

${sellableItems.length > 0
  ? sellableItems.map((sellItem, idx) => {
      return `${idx + 1}. ${sellItem.item.name} x${sellItem.quantity} - ${sellItem.sellPrice} Scraps each
   ${sellItem.item.description}`
    }).join('\n\n')
  : 'You have nothing to sell!'}

${shopMessage ? `\n${shopMessage}\n` : ''}`

    displayChoices = [
      ...sellableItems.map(sellItem => ({
        label: `Sell ${sellItem.item.name} (${sellItem.sellPrice} Scraps)`,
        itemId: sellItem.item.id
      })),
      { label: '→ Buy Items', action: 'switch_to_buy' },
      { label: '← Leave Shop', action: 'leave_shop' }
    ]

    onChoiceChange = (index: number) => {
      setSelectedChoice(index)
      const choice = displayChoices[index]

      if (choice.action === 'leave_shop') {
        setCombatPhase('exploration')
        setShopMessage('')
        setSelectedChoice(-1)
      } else if (choice.action === 'switch_to_buy') {
        setCombatPhase('shop_buy')
        setShopMessage('')
        setSelectedChoice(-1)
      } else if (choice.itemId) {
        // Try to sell the item
        const result = ShopProcessor.sellItem(rpgState, choice.itemId)
        if (result.success) {
          setRpgState(result.newState)
          setShopMessage(`✓ ${result.message}`)
        } else {
          setShopMessage(`✗ ${result.message}`)
        }
        setSelectedChoice(-1)
      }
    }
  }

  // handleSubmit now captures the correct onChoiceChange handler after all phase reassignments
  const handleSubmit = () => {
    if (selectedChoice >= 0 && onChoiceChange) {
      onChoiceChange(selectedChoice)
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
