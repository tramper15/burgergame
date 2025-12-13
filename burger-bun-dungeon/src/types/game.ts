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
}
