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
}
