# Condition CRUD API Test Examples

## Testing Condition UPDATE and DELETE endpoints

### 1. Get All Conditions
```powershell
$conditions = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/list" -Method GET
$conditions.conditions
```

### 2. Get Specific Condition
```powershell
$conditionId = "CONDITION_ID_HERE"
$condition = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$conditionId" -Method GET
$condition.condition
```

### 3. Update Condition
```powershell
$conditionId = "CONDITION_ID_HERE"
$updateBody = @{
    name = "Updated Condition Name"
    description = "Updated description with new information"
    macros = @{
        calories = 2000
        protein = 120
        carbs = 220
        fat = 70
        fiber = 35
    }
    micros = @{
        sodium = 2400
        potassium = 3700
        calcium = 1200
        zinc = 12
        magnesium = 450
        iron = 20
        vitamin_b12 = 3.0
        vitamin_d = 700
        vitamin_c = 100
        folate = 450
    }
} | ConvertTo-Json -Depth 3

$result = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$conditionId" -Method PUT -Body $updateBody -ContentType "application/json"
$result
```

### 4. Create Test Condition for Deletion
```powershell
$newConditionBody = @{
    name = "Test Condition for Deletion"
    description = "This condition will be deleted as a test"
    macros = @{
        calories = 1500
        protein = 80
        carbs = 150
        fat = 50
        fiber = 20
    }
} | ConvertTo-Json -Depth 3

$newCondition = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/create" -Method POST -Body $newConditionBody -ContentType "application/json"
$testConditionId = $newCondition.condition._id
Write-Host "Created test condition with ID: $testConditionId"
```

### 5. Delete Condition (Regular)
```powershell
$testConditionId = "CONDITION_ID_FROM_STEP_4"
$deleteResult = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$testConditionId" -Method DELETE
$deleteResult
```

### 6. Delete Condition with Force (if used in recipes)
```powershell
# If the condition is used in recipes, use force delete
$conditionId = "CONDITION_ID_HERE"
$forceDeleteResult = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$conditionId" + "?force=true" -Method DELETE
$forceDeleteResult
```

## Complete Test Workflow

### Full CRUD Test Script
```powershell
# 1. Create a test condition
Write-Host "Creating test condition..."
$createBody = @{
    name = "Test CRUD Condition"
    description = "Testing all CRUD operations"
    macros = @{
        calories = 1700
        protein = 90
        carbs = 180
        fat = 55
        fiber = 25
    }
} | ConvertTo-Json -Depth 3

$created = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/create" -Method POST -Body $createBody -ContentType "application/json"
$testId = $created.condition._id
Write-Host "Created condition with ID: $testId"

# 2. Read the condition
Write-Host "Reading condition..."
$read = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$testId" -Method GET
Write-Host "Condition name: $($read.condition.name)"

# 3. Update the condition
Write-Host "Updating condition..."
$updateBody = @{
    description = "Updated: Testing all CRUD operations - MODIFIED"
    macros = @{
        calories = 1800
        protein = 95
        carbs = 185
        fat = 60
        fiber = 28
    }
} | ConvertTo-Json -Depth 3

$updated = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$testId" -Method PUT -Body $updateBody -ContentType "application/json"
Write-Host "Updated condition: $($updated.condition.description)"

# 4. Delete the condition
Write-Host "Deleting condition..."
$deleted = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/$testId" -Method DELETE
Write-Host "Deleted condition: $($deleted.deletedCondition.name)"

Write-Host "CRUD test completed successfully!"
```

## Error Handling Examples

### 1. Update Non-existent Condition
```powershell
try {
    $updateBody = @{ name = "Test" } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/nonexistent123" -Method PUT -Body $updateBody -ContentType "application/json"
} catch {
    Write-Host "Expected error: $($_.Exception.Message)"
}
```

### 2. Delete Non-existent Condition
```powershell
try {
    $result = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/nonexistent123" -Method DELETE
} catch {
    Write-Host "Expected error: $($_.Exception.Message)"
}
```

### 3. Update with Duplicate Name
```powershell
# First get an existing condition name
$conditions = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/list" -Method GET
$existingName = $conditions.conditions[0].name

# Try to update another condition with the same name
try {
    $updateBody = @{ name = $existingName } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/DIFFERENT_ID_HERE" -Method PUT -Body $updateBody -ContentType "application/json"
} catch {
    Write-Host "Expected duplicate error: $($_.Exception.Message)"
}
```

## Frontend JavaScript Examples

### React/Next.js Condition CRUD Service
```javascript
const conditionsAPI = {
  // Create
  create: (data) => fetch('/api/condition/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Read All
  getAll: (params = {}) => fetch(`/api/condition/list?${new URLSearchParams(params)}`),
  
  // Read One
  getById: (id) => fetch(`/api/condition/${id}`),
  
  // Update
  update: (id, data) => fetch(`/api/condition/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  // Delete
  delete: (id, force = false) => fetch(`/api/condition/${id}${force ? '?force=true' : ''}`, {
    method: 'DELETE'
  })
};

// Usage example
async function updateCondition(id, formData) {
  try {
    const response = await conditionsAPI.update(id, formData);
    const result = await response.json();
    
    if (result.success) {
      console.log('Condition updated:', result.condition);
    } else {
      console.error('Update failed:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## Notes

- ✅ **UPDATE** endpoint validates condition existence and name uniqueness
- ✅ **DELETE** endpoint checks for recipe dependencies and offers force delete
- ✅ Both endpoints support partial updates (only provided fields are updated)
- ✅ Proper error handling with meaningful messages
- ✅ Input validation and sanitization
- ✅ Maintains data integrity across the system