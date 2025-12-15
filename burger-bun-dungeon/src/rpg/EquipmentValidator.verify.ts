/**
 * Runtime verification script for equipment validation
 * Run with: node -r esbuild-register src/rpg/EquipmentValidator.verify.ts
 * Or import and call verifyEquipmentValidation() during app initialization in dev mode
 */

import { validateEquipmentStats, createFallbackEquipment, assertEquipmentValid } from './EquipmentValidator'
import type { Equipment } from '../types/game'

export function verifyEquipmentValidation(): void {
  console.log('🧪 Running equipment validation verification...\n')

  let passedTests = 0
  let failedTests = 0

  // Test 1: Validate missing stats
  try {
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
    if (validated.stats.atk === 0 && validated.stats.def === 0 && validated.stats.spd === 0) {
      console.log('✅ Test 1 passed: Missing stats normalized to 0')
      passedTests++
    } else {
      console.error('❌ Test 1 failed: Stats not normalized correctly', validated.stats)
      failedTests++
    }
  } catch (error) {
    console.error('❌ Test 1 failed with error:', error)
    failedTests++
  }

  // Test 2: Create fallback equipment
  try {
    const fallback = createFallbackEquipment('weapon', 'missing_weapon')
    if (
      fallback.id === 'missing_weapon' &&
      fallback.slot === 'weapon' &&
      fallback.stats.atk === 0 &&
      fallback.stats.def === 0 &&
      fallback.stats.spd === 0
    ) {
      console.log('✅ Test 2 passed: Fallback equipment created correctly')
      passedTests++
    } else {
      console.error('❌ Test 2 failed: Fallback equipment incorrect', fallback)
      failedTests++
    }
  } catch (error) {
    console.error('❌ Test 2 failed with error:', error)
    failedTests++
  }

  // Test 3: Assert valid equipment passes
  try {
    const validEquipment: Equipment = {
      id: 'test_weapon',
      name: 'Test Weapon',
      description: 'A test weapon',
      type: 'equipment',
      slot: 'weapon',
      stats: { atk: 10, def: 0, spd: 0 },
      quantity: 1
    }
    assertEquipmentValid(validEquipment, 'test context')
    console.log('✅ Test 3 passed: Valid equipment assertion succeeded')
    passedTests++
  } catch (error) {
    console.error('❌ Test 3 failed: Valid equipment should not throw', error)
    failedTests++
  }

  // Test 4: Assert invalid equipment throws
  try {
    const invalidEquipment = {
      id: 'test_weapon',
      name: 'Test Weapon',
      description: 'A test weapon',
      type: 'equipment' as const,
      slot: 'weapon' as const,
      stats: { atk: 'invalid' as any, def: 0, spd: 0 },
      quantity: 1
    } as Equipment
    assertEquipmentValid(invalidEquipment, 'test context')
    console.error('❌ Test 4 failed: Invalid equipment should throw')
    failedTests++
  } catch (error) {
    console.log('✅ Test 4 passed: Invalid equipment assertion threw correctly')
    passedTests++
  }

  // Test 5: Verify combat safety (stat calculations work)
  try {
    const fallback = createFallbackEquipment('weapon', 'missing_weapon')
    const baseAtk = 5
    const totalAtk = baseAtk + (fallback.stats.atk || 0)
    const totalDef = 0 + (fallback.stats.def || 0)
    const totalSpd = 5 + (fallback.stats.spd || 0)

    if (
      totalAtk === 5 &&
      totalDef === 0 &&
      totalSpd === 5 &&
      !Number.isNaN(totalAtk) &&
      !Number.isNaN(totalDef) &&
      !Number.isNaN(totalSpd)
    ) {
      console.log('✅ Test 5 passed: Fallback equipment is combat-safe (no NaN in calculations)')
      passedTests++
    } else {
      console.error('❌ Test 5 failed: Combat calculations produced unexpected results', {
        totalAtk,
        totalDef,
        totalSpd
      })
      failedTests++
    }
  } catch (error) {
    console.error('❌ Test 5 failed with error:', error)
    failedTests++
  }

  // Summary
  console.log(`\n📊 Verification Summary:`)
  console.log(`   Passed: ${passedTests}`)
  console.log(`   Failed: ${failedTests}`)

  if (failedTests === 0) {
    console.log('\n✅ All equipment validation checks passed!')
  } else {
    console.error('\n❌ Some equipment validation checks failed!')
    throw new Error(`Equipment validation verification failed: ${failedTests} test(s) failed`)
  }
}

// Note: Auto-run functionality removed to avoid Node.js dependencies
// Call verifyEquipmentValidation() manually in dev mode if needed
