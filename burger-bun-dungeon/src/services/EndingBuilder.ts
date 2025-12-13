import type { IngredientsData } from '../types/game'
import { SynergyCalculator } from './SynergyCalculator'

/**
 * Builder class for constructing ending scene text.
 * Provides a fluent API for composing ending narratives with consistent formatting.
 */
export class EndingBuilder {
  private sections: string[] = []

  /**
   * Adds a custom title to the ending
   */
  addTitle(title: string): this {
    this.sections.push(`${title}\n`)
    return this
  }

  /**
   * Adds the standard bun header
   */
  addBunHeader(): this {
    this.sections.push("You have become:\n\n🍞 Bun")
    return this
  }

  /**
   * Adds the list of ingredients with their point values
   */
  addIngredientList(
    bunIngredients: string[],
    ingredients: IngredientsData,
    showPoints: boolean = true
  ): this {
    bunIngredients.forEach(id => {
      const ing = ingredients[id]
      if (showPoints) {
        const sign = ing.points >= 0 ? '+' : ''
        this.sections.push(`${ing.name}        ${sign}${ing.points}`)
      } else {
        this.sections.push(`${ing.name}        +0`)
      }
    })
    this.sections.push("") // blank line
    return this
  }

  /**
   * Adds synergy reflections section
   */
  addSynergyReflections(
    bunIngredients: string[],
    ingredients: IngredientsData
  ): this {
    const { messages } = SynergyCalculator.calculateSynergyScore(
      bunIngredients,
      ingredients
    )

    if (messages.length > 0) {
      this.sections.push("Reflections:")
      this.sections.push(...messages)
      this.sections.push("") // blank line
    }
    return this
  }

  /**
   * Adds the score summary section
   */
  addScoreSummary(
    bunIngredients: string[],
    ingredients: IngredientsData,
    overrideScore?: { base: number; synergy: number; total: number }
  ): this {
    let base = 0
    let synergy = 0

    if (overrideScore) {
      ({ base, synergy } = overrideScore)
    } else {
      base = bunIngredients.reduce((sum, id) => sum + ingredients[id].points, 0)
      const { score: synergyScore } = SynergyCalculator.calculateSynergyScore(
        bunIngredients,
        ingredients
      )
      synergy = synergyScore
    }

    const total = base + synergy
    const synSign = synergy >= 0 ? '+' : ''

    this.sections.push(
      `Base score:     ${base}`,
      `Synergies:      ${synSign}${synergy}`,
      `Total:          ${total}`,
      "" // blank line
    )
    return this
  }

  /**
   * Adds narrative text to the ending
   */
  addNarrative(text: string): this {
    this.sections.push(text)
    return this
  }

  /**
   * Adds a blank line for spacing
   */
  addBlankLine(): this {
    this.sections.push("")
    return this
  }

  /**
   * Builds and returns the final text
   */
  build(): string {
    return this.sections.join('\n')
  }
}
