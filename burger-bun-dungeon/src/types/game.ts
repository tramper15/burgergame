export interface Ingredient {
  name: string
  description: string
  onAdd: string
  points: number
  likes: string[]
  dislikes: string[]
  reactions: Record<string, string>
}

export interface Choice {
  label: string
  next?: string
  take?: string
  reflect?: boolean
  silence?: boolean
  restart?: boolean
  end?: boolean
}

export interface Scene {
  text: string
  ingredient?: string
  choices: Choice[]
}

export type IngredientsData = Record<string, Ingredient>
export type ScenesData = Record<string, Scene>

export interface GameState {
  currentSceneId: string
  bunIngredients: string[]
  visitedScenes: string[]
  seenSilenceMessages: number[]
}

export interface Achievement {
  title: string
  description: string
  criteria: {
    ending?: string
    exactIngredients?: string[]
  }
}

export type AchievementsData = Record<string, Achievement>

export interface AchievementProgress {
  unlockedAchievements: string[]
  unlockedAt: Record<string, number>
  trashOdysseyUnlocked?: boolean
}

// RPG Mode (Act 2: Trash Odyssey) Types

export interface RPGState {
  // Mode
  mode: 'adventure' | 'rpg' | null

  // Character Stats
  level: number
  xp: number
  maxXp: number
  hp: number
  maxHp: number
  stats: {
    atk: number
    def: number
    spd: number
  }

  // Inventory
  inventory: InventoryItem[]
  equipment: {
    weapon: Equipment | null
    armor: Equipment | null
    shield: Equipment | null
    accessory: Equipment | null
  }
  currency: number

  // World Progress
  currentLocation: string
  visitedLocations: string[]
  checkpoints: string[]
  defeatedBosses: string[]

  // Combat State
  inCombat: boolean
  currentEnemy?: Enemy
  playerDefending: boolean

  // Ingredient Powers (from Act 1)
  ingredientBonuses: Record<string, StatBonus>
}

export interface Enemy {
  id: string
  name: string
  description: string
  level: number
  hp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  xpReward: number
  currencyDrop?: { min: number; max: number } // Currency drop range
  lootTable: LootDrop[]
  aiPattern: 'aggressive' | 'defensive' | 'random'
  special?: any // Special abilities data from enemy JSON
  isBoss?: boolean
  isSecretBoss?: boolean
  phases?: any[] // For multi-phase bosses like Hungry Dog
  currentPhase?: number // Track current phase
  turnCounter?: number // For abilities that trigger every N turns
  charging?: boolean // For charge-up abilities like Pounce
  poisonTurns?: number // For poison effects
  constrictTurns?: number // For constrict effects
  minions?: Enemy[] // Summoned minions fighting alongside this enemy
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  type: 'consumable' | 'equipment' | 'key'
  effect?: {
    healHp?: number
    buffAtk?: number
    buffDef?: number
  }
  quantity: number
}

export interface Equipment extends InventoryItem {
  type: 'equipment'
  slot: 'weapon' | 'armor' | 'shield' | 'accessory'
  stats: {
    atk?: number
    def?: number
    spd?: number
  }
}

export interface LootDrop {
  itemId: string
  chance: number
}

export interface StatBonus {
  atk?: number
  def?: number
  spd?: number
  maxHp?: number
  ability?: string
}
