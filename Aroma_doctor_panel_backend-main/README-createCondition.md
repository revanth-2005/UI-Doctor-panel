# CreateCondition Function Documentation

## Overview
The `createCondition()` function allows doctors to define medical conditions with optional macro and micro nutrient recommendations for the Aroma Diet Plan Manager.

## API Endpoint
**POST** `/api/conditions`

## Request Structure

### Required Fields
- `conditionName`: string - The name of the medical condition (required)

### Optional Fields
- `description`: string - Brief description of the condition
- `macronutrients`: object - Macronutrient recommendations in grams/kcal
  - `protein`: number (grams)
  - `carbs`: number (grams) 
  - `fat`: number (grams)
  - `fiber`: number (grams)
  - `calories`: number (kcal)
- `micronutrients`: object - Micronutrient recommendations in mg/µg/IU
  - `sodium`: number (mg)
  - `potassium`: number (mg)
  - `calcium`: number (mg)
  - `zinc`: number (mg)
  - `magnesium`: number (mg)
  - `iron`: number (mg)
  - `vitamin_b12`: number (µg)
  - `vitamin_d`: number (IU)
  - `vitamin_c`: number (mg)
  - `folate`: number (µg)

## Validation Rules
1. `conditionName` is required and must be a non-empty string
2. All nutrient fields are optional
3. Numeric fields must be >= 0
4. Empty/blank nutrient fields are ignored and omitted from storage
5. String inputs are trimmed and sanitized

## Example Requests

### Minimal Request (Required Only)
```json
{
  "conditionName": "Diabetes Type 2"
}
```

### Complete Request
```json
{
  "conditionName": "Diabetes Type 2",
  "description": "Condition characterized by high blood sugar levels",
  "macronutrients": {
    "protein": 50,
    "carbs": 200,
    "fat": 65,
    "fiber": 30,
    "calories": 2000
  },
  "micronutrients": {
    "sodium": 1500,
    "potassium": 2000,
    "calcium": 1000,
    "vitamin_b12": 2.4
  }
}
```

## Response Format

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "condition_1699776123456_abc123",
    "conditionName": "Diabetes Type 2",
    "description": "Condition characterized by high blood sugar levels",
    "macronutrients": {
      "protein": 50,
      "carbs": 200,
      "fat": 65,
      "fiber": 30,
      "calories": 2000
    },
    "micronutrients": {
      "sodium": 1500,
      "potassium": 2000,
      "calcium": 1000,
      "vitamin_b12": 2.4
    },
    "createdAt": "2023-11-12T10:15:23.456Z",
    "updatedAt": "2023-11-12T10:15:23.456Z"
  },
  "message": "Condition successfully created"
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "conditionName",
      "message": "Condition name is required and must be a string"
    }
  ]
}
```

## Error Handling
- **400 Bad Request**: Validation errors (missing required fields, invalid values)
- **409 Conflict**: Condition name already exists
- **500 Internal Server Error**: Server-side errors

## Frontend Usage

The UI form includes:
1. **Basic Information**: Condition name (required) and description
2. **Macronutrients Section**: Protein, carbs, fat, fiber, calories
3. **Micronutrients Section**: All 10 micronutrients with proper units

### Form Behavior
- Only `conditionName` field shows validation error if empty
- All nutrient fields are optional with placeholder values
- Empty fields are automatically filtered out before API submission
- Form shows loading state during submission
- Success/error toast notifications

## Testing

Run the validation tests:
```bash
node test-conditions.mjs
```

Test the API directly:
```bash
curl -X POST http://localhost:3000/api/conditions \
  -H "Content-Type: application/json" \
  -d '{
    "conditionName": "Test Condition",
    "macronutrients": {
      "protein": 50,
      "calories": 2000
    }
  }'
```

## Implementation Files
- **Types**: `/lib/types/conditions.ts`
- **Validation**: `/lib/validation/conditions.ts`
- **API Route**: `/app/api/conditions/route.ts`
- **UI Component**: `/components/doctor/conditions-management.tsx`