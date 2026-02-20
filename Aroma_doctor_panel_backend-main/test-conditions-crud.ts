/**
 * Test script to verify Conditions CRUD operations with the backend
 * Run this with: npx ts-node test-conditions-crud.ts
 */

import { createCondition, fetchConditions, updateCondition, deleteCondition } from './lib/api/conditions'

async function testConditionsCRUD() {
  console.log('🧪 Testing Conditions CRUD Operations')
  console.log('=' .repeat(50))

  try {
    // Test 1: Get existing conditions
    console.log('\n📋 Test 1: Fetching existing conditions...')
    const listResult = await fetchConditions()
    console.log('Result:', listResult)

    // Test 2: Create a new test condition
    console.log('\n➕ Test 2: Creating a new test condition...')
    const createResult = await createCondition({
      conditionName: 'Test Hypertension',
      description: 'Test condition for blood pressure management',
      macronutrients: {
        calories: 2000,
        protein: 80,
        carbs: 250,
        fat: 65,
        fiber: 25
      },
      micronutrients: {
        sodium: 1500, // Low sodium for hypertension
        potassium: 4700,
        calcium: 1000,
        magnesium: 400
      }
    })
    console.log('Create Result:', createResult)

    if (createResult.success && createResult.data) {
      const conditionId = createResult.data.id

      // Test 3: Update the condition
      console.log('\n✏️  Test 3: Updating the test condition...')
      const updateResult = await updateCondition(conditionId, {
        conditionName: 'Test Hypertension - Updated',
        description: 'Updated test condition for blood pressure management with enhanced guidelines',
        macronutrients: {
          calories: 1800, // Reduced calories
          protein: 90,    // Increased protein
          carbs: 200,     // Reduced carbs
          fat: 55,        // Reduced fat
          fiber: 35       // Increased fiber
        },
        micronutrients: {
          sodium: 1200,   // Further reduced sodium
          potassium: 5000, // Increased potassium
          calcium: 1200,  // Increased calcium
          magnesium: 450  // Increased magnesium
        }
      })
      console.log('Update Result:', updateResult)

      // Test 4: Delete the condition
      console.log('\n🗑️  Test 4: Deleting the test condition...')
      const deleteResult = await deleteCondition(conditionId)
      console.log('Delete Result:', deleteResult)

      // Test 5: Verify deletion by checking the list again
      console.log('\n✅ Test 5: Verifying deletion...')
      const finalListResult = await fetchConditions()
      console.log('Final conditions count:', finalListResult.success ? finalListResult.data?.length : 'Error')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }

  console.log('\n🏁 Test completed!')
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConditionsCRUD()
}

export { testConditionsCRUD }