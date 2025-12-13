import type { Choice } from '../../types/game'

export interface LayoutProps {
  sceneText: string
  availableChoices: Choice[]
  selectedChoice: number
  onChoiceChange: (index: number) => void
  onSubmit: () => void
}
