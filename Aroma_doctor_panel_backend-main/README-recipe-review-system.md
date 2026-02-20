# Doctor Recipe Review System Documentation

## Overview
The Doctor Recipe Dashboard has been refactored from a recipe creation system to a review-based approval workflow. Doctors now review recipes uploaded by admins, add optional comments, and approve or reject them for specific medical conditions.

## Key Changes Made

### ❌ **Removed Features**
- "Add Recipe" button and form
- Recipe creation/editing functionality  
- Recipe deletion capabilities
- Manual recipe input fields

### ✅ **New Features**
- Recipe review and approval workflow
- View detailed recipe information in modal
- Add optional comments (max 500 characters)
- Approve/Reject buttons with loading states
- Advanced filtering (condition, status, search)
- Status badges (pending, approved, rejected)

## API Endpoints

### 1. Fetch Recipes
**GET** `/api/recipes`

**Query Parameters:**
- `condition`: Filter by condition name (optional)
- `status`: Filter by approval status (`pending`, `approved`, `rejected`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64e78acdf812a1b2c3d4e5f6",
      "recipeTitle": "Grilled Chicken Salad",
      "conditionTag": "Diabetes Type 2",
      "shortDescription": "Low-carb, high-protein meal",
      "macronutrients": {
        "protein": 35,
        "carbs": 12,
        "fat": 15,
        "calories": 295
      },
      "estimatedTime": 25,
      "servings": 2,
      "status": "pending"
    }
  ],
  "totalCount": 3
}
```

### 2. Review Recipe (Approve/Reject)
**POST** `/api/recipes/approve`

**Request Body:**
```json
{
  "recipeId": "64e78acdf812a1b2c3d4e5f6",
  "doctorId": "doctor_001",
  "status": "approved", // or "rejected"
  "comment": "Excellent for diabetic patients" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review_001",
    "recipeId": "64e78acdf812a1b2c3d4e5f6",
    "doctorId": "doctor_001",
    "status": "approved",
    "comment": "Excellent for diabetic patients",
    "reviewedAt": "2023-11-12T10:15:23.456Z"
  },
  "message": "Recipe successfully approved"
}
```

## UI Components

### 1. RecipesManagement (Main Component)
**File:** `/components/doctor/recipes-management.tsx`

**Features:**
- Recipe list with search and filtering
- Nutritional information preview
- Comment textarea for pending recipes
- Approve/Reject buttons with loading states
- View Details modal trigger

**Key Props/State:**
- `recipes`: Array of Recipe objects
- `comments`: Object storing comments by recipe ID
- `reviewingRecipeId`: Currently processing recipe ID
- `selectedRecipe`: Recipe selected for details view

### 2. RecipeDetailsModal
**File:** `/components/doctor/recipe-details-modal.tsx`

**Features:**
- Complete recipe information display
- Full ingredients list with amounts/units
- Step-by-step cooking instructions
- Detailed macro and micronutrient breakdown
- Admin metadata (uploaded by, dates)

### 3. Type Definitions
**File:** `/lib/types/recipes.ts`

**Key Interfaces:**
- `Recipe`: Complete recipe data structure
- `RecipeReview`: Review data structure
- `ReviewRecipeRequest`: API request format
- `Ingredient`: Ingredient with amount/unit

## Recipe Card Features

### Visual Elements
- **Status Badges**: Color-coded status indicators
- **Condition Tags**: Purple badges showing medical condition
- **Time & Servings**: Quick stats with icons
- **Nutrition Preview**: Grid showing key macronutrients

### Actions Available
- **View Details**: Opens detailed modal view
- **Approve**: Green button for approving recipes
- **Reject**: Red button for rejecting recipes
- **Add Comment**: Optional textarea (pending recipes only)

### State Management
- **Loading States**: Spinners during API calls
- **Button Disabling**: Prevents double-submissions
- **Real-time Updates**: UI updates after successful review

## Filtering System

### Search Functionality
- **Recipe Title**: Full-text search
- **Condition Tag**: Filter by medical condition
- **Description**: Search in short descriptions

### Filter Options
- **All Conditions / Specific Condition**: Dropdown filter
- **Status Filter**: All Status / Pending / Approved / Rejected
- **Real-time Filtering**: Updates as you type

## Data Flow

1. **Load Recipes**: Fetch from `/api/recipes` with filters
2. **Display Cards**: Show recipes with nutrition preview
3. **Add Comments**: Store locally until review submission
4. **Review Action**: Send to `/api/recipes/approve` endpoint
5. **Update UI**: Reflect new status and clear comments
6. **Toast Feedback**: Show success/error messages

## Validation Rules

### API Validation
- `recipeId` and `doctorId` are required
- `status` must be 'approved' or 'rejected'
- `comment` maximum 500 characters
- Prevent duplicate reviews by same doctor

### UI Validation
- Character counter for comments (500 max)
- Disable buttons during processing
- Form validation before API submission

## Error Handling

### API Errors
- Network errors with retry suggestions
- Validation errors with specific field messages
- Duplicate review prevention
- Server errors with fallback messages

### UI Error States
- Loading spinners during API calls
- Toast notifications for feedback
- Graceful fallbacks for missing data
- Empty states for no results

## Sample Data Structure

```typescript
const sampleRecipe: Recipe = {
  id: "64e78acdf812a1b2c3d4e5f6",
  recipeTitle: "Grilled Chicken Salad",
  conditionTag: "Diabetes Type 2",
  shortDescription: "Low-carb, high-protein meal",
  ingredients: [
    { name: "Chicken breast", amount: "200", unit: "g" },
    { name: "Mixed greens", amount: "100", unit: "g" }
  ],
  instructions: [
    "Season chicken breast with salt and pepper",
    "Grill chicken for 6-8 minutes per side"
  ],
  macronutrients: {
    protein: 35,
    carbs: 12,
    fat: 15,
    calories: 295
  },
  estimatedTime: 25,
  servings: 2,
  uploadedBy: "admin_001",
  status: "pending"
}
```

## Testing Scenarios

1. **Load Recipes**: Test filtering by condition and status
2. **Search Functionality**: Test search across title/description
3. **View Details**: Test modal with complete recipe information
4. **Approve Recipe**: Test approval with and without comments
5. **Reject Recipe**: Test rejection with comment validation
6. **Error Handling**: Test network errors and validation failures
7. **Loading States**: Test UI during API calls
8. **Edge Cases**: Test with no recipes, empty search results

## Implementation Files

- **Types**: `/lib/types/recipes.ts`
- **Main Component**: `/components/doctor/recipes-management.tsx`
- **Details Modal**: `/components/doctor/recipe-details-modal.tsx`
- **Recipes API**: `/app/api/recipes/route.ts`
- **Review API**: `/app/api/recipes/approve/route.ts`