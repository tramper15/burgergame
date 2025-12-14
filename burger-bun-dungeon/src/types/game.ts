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
  }
  currency: number

  // World Progress
  currentLocation: string
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
  lootTable: LootDrop[]
  aiPattern: 'aggressive' | 'defensive' | 'random'
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
  slot: 'weapon' | 'armor' | 'shield'
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
