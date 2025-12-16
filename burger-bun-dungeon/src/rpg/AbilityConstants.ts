/**
 * Ability Constants
 *
 * Defines all ability parameters in one place for easy balancing
 */

export const ABILITIES = {
  POISON_STRIKE: {
    ID: 'poison_strike',
    DAMAGE: 5,
    DURATION: 3,
    NAME: 'Poison Strike',
    DESCRIPTION: '5 damage over 3 turns'
  },
  ONION_TEARS: {
    ID: 'onion_tears',
    HP_COST: 10,
    AOE_DAMAGE: 12,
    NAME: 'Onion Tears',
    DESCRIPTION: '12 AOE damage (costs 10 HP)'
  },
  HEAL: {
    ID: 'heal',
    HP_RESTORED: 20,
    MAX_USES: null, // null = unlimited
    NAME: 'Special Sauce',
    DESCRIPTION: 'Restore 20 HP (unlimited)'
  }
} as const
