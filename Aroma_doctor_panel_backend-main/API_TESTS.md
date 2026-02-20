# Aroma Backend API Test Examples

## Sample API Test Commands

### 1. Health Check
```bash
curl https://aroma-db-six.vercel.app/health
```

### 2. Add Doctor
```bash
curl -X POST https://aroma-db-six.vercel.app/api/admin/addDoctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@hospital.com",
    "phone": "+1-555-0123",
    "specialization": "Endocrinology",
    "licenseNumber": "MD123456"
  }'
```

### 3. Get All Doctors
```bash
curl https://aroma-db-six.vercel.app/api/admin/doctors
```

### 4. Create Medical Condition
```bash
curl -X POST https://aroma-db-six.vercel.app/api/condition/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diabetes Type 2",
    "description": "Non-insulin-dependent diabetes mellitus",
    "macros": {
      "calories": 1800,
      "protein": 100,
      "carbs": 200,
      "fat": 60,
      "fiber": 25
    },
    "micros": {
      "sodium": 2300,
      "potassium": 3500,
      "calcium": 1000,
      "magnesium": 400
    }
  }'
```

### 5. Submit Public Recipe
```bash
curl -X POST https://aroma-db-six.vercel.app/api/public/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Diabetic-Friendly Salmon Bowl",
    "description": "Low-carb, high-protein meal perfect for diabetes management",
    "ingredients": [
      "6 oz grilled salmon",
      "2 cups spinach",
      "1/2 cup quinoa",
      "1/4 avocado",
      "Cherry tomatoes",
      "Olive oil",
      "Lemon juice"
    ],
    "nutrition": {
      "calories": 450,
      "protein": 35,
      "carbs": 25,
      "fat": 22,
      "fiber": 8,
      "sodium": 320,
      "potassium": 850
    },
    "conditionTags": ["Diabetes Type 2", "Heart Health"],
    "uploadedBy": "Chef Maria"
  }'
```

### 6. Assign Recipe to Doctor
```bash
# First get the recipe ID and doctor ID from previous responses, then:
curl -X POST https://aroma-db-six.vercel.app/api/admin/assignRecipe \
  -H "Content-Type: application/json" \
  -d '{
    "recipeId": "RECIPE_ID_HERE",
    "doctorId": "DOCTOR_ID_HERE",
    "conditionTag": "Diabetes Type 2",
    "note": "Please review for diabetic patients"
  }'
```

### 7. Doctor Reviews Recipe
```bash
# Use assignment ID from previous response:
curl -X POST https://aroma-db-six.vercel.app/api/doctor/review \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "ASSIGNMENT_ID_HERE",
    "status": "approved",
    "doctorComment": "Excellent nutritional profile for diabetic patients. Approved for recommendation."
  }'
```

### 8. Get Doctor Assignments
```bash
curl "https://aroma-db-six.vercel.app/api/doctor/assignments/DOCTOR_ID_HERE"
```

### 9. Browse Public Recipes
```bash
# All recipes
curl "https://aroma-db-six.vercel.app/api/public/recipes"

# Filtered by condition
curl "https://aroma-db-six.vercel.app/api/public/recipes?conditionTag=Diabetes"

# Verified recipes only
curl "https://aroma-db-six.vercel.app/api/public/recipes?verified=true"
```

### 10. List All Conditions
```bash
curl "https://aroma-db-six.vercel.app/api/condition/list"
```

## Socket.IO Testing

### JavaScript Frontend Example
```javascript
// Connect to socket
const socket = io('https://aroma-db-six.vercel.app');

// Join admin room
socket.emit('join_admin');

// Listen for recipe reviews
socket.on('recipe_review_update', (data) => {
  console.log('Recipe review update:', data);
  // Handle real-time notification
});

// Listen for admin room join confirmation
socket.on('admin_joined', (data) => {
  console.log('Admin connected:', data.message);
});
```

### Using Socket.IO Client CLI
```bash
# Install socket.io-client globally
npm install -g socket.io-client

# Test connection
npx socket.io-client https://aroma-db-six.vercel.app
```

## Complete Workflow Test

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Add a doctor** (copy the returned ID)
3. **Create a condition** 
4. **Submit a recipe** (copy the returned ID)
5. **Assign recipe to doctor** (copy assignment ID)
6. **Doctor reviews the recipe** (triggers Socket.IO notification)
7. **Check updated assignment status**

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error description"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Notes

- Replace `RECIPE_ID_HERE`, `DOCTOR_ID_HERE`, etc. with actual IDs from responses
- All timestamps are in ISO 8601 format
- Socket.IO events are emitted to 'admin_room' for real-time notifications
- Use pagination parameters (`page`, `limit`) for large data sets