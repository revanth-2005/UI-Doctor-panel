# 🚀 Complete CRUD API Documentation
## Aroma Doctor/Admin Nutrition System Backend

### Base URL: `https://aroma-db-six.vercel.app`

---

## 🩺 **DOCTORS API** (`/api/admin/doctors`)

### **CREATE Doctor**
```http
POST /api/admin/doctors
Content-Type: application/json

{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@hospital.com",
  "phone": "+1-555-0123",
  "specialization": "Endocrinology",
  "licenseNumber": "MD123456",
  "status": "active"
}
```

### **READ Doctors**
```http
# Get all doctors (with pagination, search, filters)
GET /api/admin/doctors?page=1&limit=20&search=Sarah&status=active&specialization=Endocrinology&sortBy=createdAt&sortOrder=desc

# Get specific doctor by ID
GET /api/admin/doctors/{doctorId}
```

### **UPDATE Doctor**
```http
PUT /api/admin/doctors/{doctorId}
Content-Type: application/json

{
  "name": "Dr. Sarah Johnson-Smith",
  "specialization": "Endocrinology & Metabolism",
  "status": "active"
}
```

### **DELETE Doctor**
```http
DELETE /api/admin/doctors/{doctorId}
```

---

## 📋 **RECIPES API** (`/api/public/recipes`)

### **CREATE Recipe**
```http
POST /api/public/recipes
Content-Type: application/json

{
  "title": "Diabetic-Friendly Salmon Bowl",
  "description": "Low-carb, high-protein meal perfect for diabetes management",
  "ingredients": [
    "6 oz grilled salmon",
    "2 cups spinach",
    "1/2 cup quinoa",
    "1/4 avocado",
    "Cherry tomatoes"
  ],
  "nutrition": {
    "calories": 450,
    "protein": 35,
    "carbs": 25,
    "fat": 22,
    "fiber": 8,
    "sodium": 320,
    "potassium": 850,
    "calcium": 150,
    "zinc": 2,
    "magnesium": 80,
    "iron": 3,
    "vitamin_b12": 5.2,
    "vitamin_d": 600,
    "vitamin_c": 30,
    "folate": 120
  },
  "conditionTags": ["Diabetes Type 2", "Heart Health"],
  "uploadedBy": "Chef Maria"
}
```

### **READ Recipes**
```http
# Get all recipes (with pagination, search, filters)
GET /api/public/recipes?page=1&limit=20&search=salmon&conditionTag=Diabetes&verified=true&sortBy=createdAt&sortOrder=desc

# Get specific recipe by ID
GET /api/public/recipes/{recipeId}
```

### **UPDATE Recipe**
```http
PUT /api/public/recipes/{recipeId}
Content-Type: application/json

{
  "title": "Updated Diabetic-Friendly Salmon Bowl",
  "description": "Enhanced with additional micronutrients",
  "verified": true
}
```

### **DELETE Recipe**
```http
DELETE /api/public/recipes/{recipeId}
```

---

## 👤 **PATIENTS API** (`/api/patient`)

### **CREATE Patient**
```http
POST /api/patient
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1-555-0101",
  "userId": "user_001",
  "nutritionLimits": {
    "macros": {
      "calories": 2000,
      "protein": 100,
      "carbs": 250,
      "fat": 70,
      "fiber": 25
    },
    "micros": {
      "sodium": 2300,
      "potassium": 3500,
      "calcium": 1000,
      "zinc": 11,
      "vitamin_b12": 2.4
    }
  }
}
```

### **READ Patients**
```http
# Get all patients (with pagination, search)
GET /api/patient?page=1&limit=20&search=John&sortBy=createdAt&sortOrder=desc

# Get specific patient by ID
GET /api/patient/{patientId}
```

### **UPDATE Patient**
```http
PUT /api/patient/{patientId}
Content-Type: application/json

{
  "name": "John David Doe",
  "nutritionLimits": {
    "macros": {
      "calories": 1800,
      "protein": 90
    }
  }
}
```

### **DELETE Patient**
```http
DELETE /api/patient/{patientId}
```

---

## 🏥 **MEDICAL CONDITIONS API** (`/api/condition`)

### **CREATE Condition**
```http
POST /api/condition/create
Content-Type: application/json

{
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
    "zinc": 11,
    "magnesium": 400,
    "iron": 18,
    "vitamin_b12": 2.4,
    "vitamin_d": 600,
    "vitamin_c": 90,
    "folate": 400
  }
}
```

### **READ Conditions**
```http
# Get all conditions (with pagination, search)
GET /api/condition/list?page=1&limit=50&search=diabetes&sortBy=name&sortOrder=asc

# Get specific condition by ID
GET /api/condition/{conditionId}
```

### **UPDATE Condition**
```http
PUT /api/condition/{conditionId}
Content-Type: application/json

{
  "name": "Diabetes Type 2 - Updated",
  "description": "Updated description with enhanced guidelines",
  "macros": {
    "calories": 1900,
    "protein": 110,
    "carbs": 200,
    "fat": 65,
    "fiber": 30
  },
  "micros": {
    "sodium": 2200,
    "potassium": 3600,
    "calcium": 1100
  }
}
```

### **DELETE Condition**
```http
# Regular delete (fails if condition is used in recipes)
DELETE /api/condition/{conditionId}

# Force delete (removes condition from all recipes)
DELETE /api/condition/{conditionId}?force=true
```

---

## 📝 **RECIPE ASSIGNMENTS API** (`/api/admin/assignments`)

### **CREATE Assignment**
```http
POST /api/admin/assignments
Content-Type: application/json

{
  "recipeId": "67890abcdef",
  "doctorId": "12345abcdef",
  "conditionTag": "Diabetes Type 2",
  "note": "Please review for diabetic patients"
}
```

### **READ Assignments**
```http
# Get all assignments (with pagination, filters)
GET /api/admin/assignments?page=1&limit=20&status=pending&doctorId=12345abcdef&conditionTag=Diabetes

# Get assignments for specific doctor
GET /api/doctor/assignments/{doctorId}?page=1&limit=20&status=pending
```

### **UPDATE Assignment (Doctor Review)**
```http
POST /api/doctor/review
Content-Type: application/json

{
  "assignmentId": "assignment123",
  "status": "approved",
  "doctorComment": "Excellent nutritional profile for diabetic patients. Approved for recommendation."
}
```

---

## 🔄 **Common Response Formats**

### **Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Error Response**
```json
{
  "error": "Error Type",
  "message": "Detailed error description"
}
```

---

## 🛠 **PowerShell Testing Examples**

### **Create Doctor**
```powershell
$doctorBody = @{
    name = "Dr. Sarah Johnson"
    email = "sarah.johnson@hospital.com"
    phone = "+1-555-0123"
    specialization = "Endocrinology"
    licenseNumber = "MD123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/doctors" -Method POST -Body $doctorBody -ContentType "application/json"
```

### **Get All Doctors**
```powershell
Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/doctors?page=1&limit=10" -Method GET
```

### **Update Doctor**
```powershell
$updateBody = @{
    specialization = "Endocrinology & Metabolism"
    status = "active"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/admin/doctors/DOCTOR_ID_HERE" -Method PUT -Body $updateBody -ContentType "application/json"
```

### **Create Recipe**
```powershell
$recipeBody = @{
    title = "Diabetic-Friendly Salmon Bowl"
    description = "Low-carb, high-protein meal"
    ingredients = @("6 oz grilled salmon", "2 cups spinach", "1/2 cup quinoa")
    nutrition = @{
        calories = 450
        protein = 35
        carbs = 25
        fat = 22
    }
    conditionTags = @("Diabetes Type 2")
    uploadedBy = "Chef Maria"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/public/recipes" -Method POST -Body $recipeBody -ContentType "application/json"
```

### **Create Patient**
```powershell
$patientBody = @{
    name = "Alice Johnson"
    phone = "+1-555-0104"
    userId = "user_004"
    nutritionLimits = @{
        macros = @{
            calories = 1600
            protein = 80
        }
        micros = @{
            sodium = 2000
            calcium = 1200
        }
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/patient" -Method POST -Body $patientBody -ContentType "application/json"
```

### **Update Condition**
```powershell
$updateConditionBody = @{
    description = "Updated: Enhanced nutrition guidelines for diabetes management"
    macros = @{
        calories = 1900
        protein = 110
        carbs = 200
        fat = 65
        fiber = 30
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/CONDITION_ID_HERE" -Method PUT -Body $updateConditionBody -ContentType "application/json"
```

### **Delete Condition**
```powershell
# Regular delete
Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/CONDITION_ID_HERE" -Method DELETE

# Force delete (removes from recipes too)
Invoke-RestMethod -Uri "https://aroma-db-six.vercel.app/api/condition/CONDITION_ID_HERE?force=true" -Method DELETE
```

---

## 📊 **Database Collections in MongoDB Compass**

After using these APIs, you'll see these collections populated in MongoDB Compass:

1. **`doctors`** - Doctor profiles and specializations
2. **`recipes`** - Recipe database with nutrition information
3. **`patients`** - Patient records with nutrition limits
4. **`conditions`** - Medical conditions with nutrition guidelines
5. **`recipeassignments`** - Assignment tracking between doctors and recipes

---

## 🎯 **Frontend Integration Guide**

### **React/Next.js Example**
```javascript
// API service file
const API_BASE = 'https://aroma-db-six.vercel.app';

export const doctorsAPI = {
  create: (data) => fetch(`${API_BASE}/api/admin/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  getAll: (params) => fetch(`${API_BASE}/api/admin/doctors?${new URLSearchParams(params)}`),
  
  getById: (id) => fetch(`${API_BASE}/api/admin/doctors/${id}`),
  
  update: (id, data) => fetch(`${API_BASE}/api/admin/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  delete: (id) => fetch(`${API_BASE}/api/admin/doctors/${id}`, {
    method: 'DELETE'
  })
};

// Similar patterns for recipes, patients, conditions, assignments
```

### **Usage in Component**
```javascript
import { doctorsAPI } from './api';

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  
  useEffect(() => {
    doctorsAPI.getAll({ page: 1, limit: 20 })
      .then(res => res.json())
      .then(data => setDoctors(data.doctors));
  }, []);
  
  const handleCreateDoctor = async (formData) => {
    const response = await doctorsAPI.create(formData);
    const result = await response.json();
    if (result.success) {
      // Refresh list or add to state
    }
  };
  
  // Render doctors list and forms...
}
```

---

## 🎉 **All CRUD Operations Complete!**

Your backend now supports complete Create, Read, Update, Delete operations for:
- ✅ **Doctors** (Admin management)
- ✅ **Recipes** (Public submissions & admin management)  
- ✅ **Patients** (Patient records)
- ✅ **Conditions** (Medical conditions)
- ✅ **Assignments** (Doctor recipe reviews)

Each endpoint includes:
- ✅ Input validation
- ✅ Error handling
- ✅ Pagination & search
- ✅ Proper HTTP status codes
- ✅ Comprehensive responses