import { describe, it, expect } from 'vitest'
import { validateEquipmentStats, createFallbackEquipment, assertEquipmentValid } from './EquipmentValidator'
import type { Equipment } from '../types/game'

describe('EquipmentValidator', () => {
  describe('validateEquipmentStats', () => {
    it('should normalize missing stats to safe defaults', () => {
      const equipment: Equipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment',
        slot: 'weapon',
        stats: {},
        quantity: 1
      }

      const validated = validateEquipmentStats(equipment)

      expect(validated.stats).toEqual({
        atk: 0,
        def: 0,
        spd: 0
      })
    })

    it('should preserve existing valid stats', () => {
      const equipment: Equipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment',
        slot: 'weapon',
        stats: { atk: 10, def: 5, spd: 3 },
        quantity: 1
      }

      const validated = validateEquipmentStats(equipment)

      expect(validated.stats).toEqual({
        atk: 10,
        def: 5,
        spd: 3
      })
    })

    it('should handle missing stats object', () => {
      const equipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment' as const,
        slot: 'weapon' as const,
        quantity: 1
      } as Equipment

      const validated = validateEquipmentStats(equipment)

      expect(validated.stats).toEqual({
        atk: 0,
        def: 0,
        spd: 0
      })
    })

    it('should normalize invalid stat types to 0', () => {
      const equipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment' as const,
        slot: 'weapon' as const,
        stats: { atk: 'invalid' as any, def: null as any, spd: undefined as any },
        quantity: 1
      } as Equipment

      const validated = validateEquipmentStats(equipment)

      expect(validated.stats).toEqual({
        atk: 0,
        def: 0,
        spd: 0
      })
    })
  })

  describe('createFallbackEquipment', () => {
    it('should create valid fallback equipment for weapon', () => {
      const fallback = createFallbackEquipment('weapon', 'missing_weapon')

      expect(fallback).toEqual({
        id: 'missing_weapon',
        name: 'Weapon',
        description: 'Basic weapon (fallback)',
        type: 'equipment',
        slot: 'weapon',
        stats: { atk: 0, def: 0, spd: 0 },
        quantity: 1
      })
    })

    it('should create valid fallback equipment for all slot types', () => {
      const slots: Array<'weapon' | 'armor' | 'shield' | 'accessory'> = ['weapon', 'armor', 'shield', 'accessory']

      slots.forEach(slot => {
        const fallback = createFallbackEquipment(slot, `missing_${slot}`)

        expect(fallback.slot).toBe(slot)
        expect(fallback.type).toBe('equipment')
        expect(fallback.stats).toEqual({ atk: 0, def: 0, spd: 0 })
        expect(fallback.quantity).toBe(1)
      })
    })
  })

  describe('assertEquipmentValid', () => {
    it('should not throw for valid equipment', () => {
      const validEquipment: Equipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment',
        slot: 'weapon',
        stats: { atk: 10, def: 0, spd: 0 },
        quantity: 1
      }

      expect(() => {
        assertEquipmentValid(validEquipment, 'test context')
      }).not.toThrow()
    })

    it('should throw for missing stats object', () => {
      const invalidEquipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment' as const,
        slot: 'weapon' as const,
        quantity: 1
      } as Equipment

      expect(() => {
        assertEquipmentValid(invalidEquipment, 'test context')
      }).toThrow(/Missing stats object/)
    })

    it('should throw for invalid stat types', () => {
      const invalidEquipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment' as const,
        slot: 'weapon' as const,
        stats: { atk: 'invalid' as any, def: 0, spd: 0 },
        quantity: 1
      } as Equipment

      expect(() => {
        assertEquipmentValid(invalidEquipment, 'test context')
      }).toThrow(/Invalid atk stat/)
    })

    it('should throw for invalid slot', () => {
      const invalidEquipment = {
        id: 'test_weapon',
        name: 'Test Weapon',
        description: 'A test weapon',
        type: 'equipment' as const,
        slot: 'invalid_slot' as any,
        stats: { atk: 0, def: 0, spd: 0 },
        quantity: 1
      } as Equipment

      expect(() => {
        assertEquipmentValid(invalidEquipment, 'test context')
      }).toThrow(/Invalid slot/)
    })
  })

  describe('Combat safety integration', () => {
    it('should ensure fallback equipment works with stat calculations', () => {
      const fallback = createFallbackEquipment('weapon', 'missing_weapon')

      // Simulate stat calculation (similar to InventoryManager.recalculateStats)
      const baseAtk = 5
      const totalAtk = baseAtk + (fallback.stats.atk || 0)
      const totalDef = 0 + (fallback.stats.def || 0)
      const totalSpd = 5 + (fallback.stats.spd || 0)

      // Should not produce NaN or undefined
      expect(totalAtk).toBe(5)
      expect(totalDef).toBe(0)
      expect(totalSpd).toBe(5)
      expect(Number.isNaN(totalAtk)).toBe(false)
      expect(Number.isNaN(totalDef)).toBe(false)
      expect(Number.isNaN(totalSpd)).toBe(false)
    })

    it('should ensure validated equipment with missing properties works with stat calculations', () => {
      const equipment = {
        id: 'incomplete_armor',
        name: 'Incomplete Armor',
        description: 'Missing def stat',
        type: 'equipment' as const,
        slot: 'armor' as const,
        stats: { atk: 2 } as any, // Missing def and spd
        quantity: 1
      } as Equipment

      const validated = validateEquipmentStats(equipment)

      // Simulate stat calculation
      const totalAtk = 5 + (validated.stats.atk || 0)
      const totalDef = 3 + (validated.stats.def || 0)
      const totalSpd = 5 + (validated.stats.spd || 0)

      // Should produce valid numbers
      expect(totalAtk).toBe(7)
      expect(totalDef).toBe(3)
      expect(totalSpd).toBe(5)
      expect(Number.isNaN(totalAtk)).toBe(false)
      expect(Number.isNaN(totalDef)).toBe(false)
      expect(Number.isNaN(totalSpd)).toBe(false)
    })
  })
})
