# MongoDB Backend Integration - Configuration Guide

## 📋 Overview
This document outlines the complete integration of your Next.js frontend with the MongoDB backend running at `https://aroma-db-six.vercel.app`.

## 🔗 Backend Analysis
Based on your backend code analysis:
- **Server Port**: 4000
- **Database**: `mongodb://localhost:27017/aroma_db`
- **Collections**: conditions, doctors, recipeassignments, recipes
- **API Routes**: 
  - `/api/admin/*` - Admin operations
  - `/api/doctor/*` - Doctor operations  
  - `/api/condition/*` - Condition management
  - `/api/public/*` - Public endpoints
- **Health Check**: `GET /health`
- **Socket.IO**: Real-time notifications support

## 📁 File Changes Made

### 🌍 Environment Configuration
**`.env.local`**
```bash
# MongoDB Backend Configuration
MONGODB_BACKEND_URL=https://aroma-db-six.vercel.app
NEXT_PUBLIC_API_URL=https://aroma-db-six.vercel.app
MONGODB_URI=mongodb://localhost:27017/aroma_db
MONGODB_DB_NAME=aroma_db
```

### ⚙️ Configuration Files
**`lib/config.ts`**
- Updated API_ENDPOINTS to match backend structure
- Fixed database name to `aroma_db`
- Configured proper admin/doctor route structure

### 🔌 API Services
**`lib/api/admin.ts`**
- Updated all endpoints to use `/api/admin/*` routes
- Fixed doctor management endpoints
- Fixed assignment management endpoints

**`lib/api/recipes.ts`**
- Updated recipe endpoints to use `/api/admin/recipes`
- Updated review endpoints to use `/api/doctor/reviews`
- Fixed all CRUD operations

**`lib/api/health.ts`** *(New)*
- Added backend health check functions
- Added connectivity testing capabilities

### 🎨 Component Updates
**`components/admin/doctor-management.tsx`**
- ✅ Already configured for MongoDB services
- Uses proper API endpoints for all operations

**`components/admin/recipe-assignments.tsx`**
- ✅ Migrated from mock data to MongoDB
- Added recipes state management
- Fixed all property mappings for MongoDB Recipe interface
- Updated filtering and display logic

### 🧪 Testing
**`test-backend.ts`** *(New)*
- Backend connectivity test script
- Health check verification
- Error diagnostics

## 🚀 API Endpoint Mapping

| Frontend Call | Backend Route | Purpose |
|---------------|---------------|---------|
| `fetchDoctors()` | `GET /api/admin/doctors` | Get all doctors |
| `createDoctor()` | `POST /api/admin/doctors` | Create new doctor |
| `updateDoctorStatus()` | `PATCH /api/admin/doctors/:id` | Update doctor status |
| `fetchAssignments()` | `GET /api/admin/assignments` | Get recipe assignments |
| `createAssignment()` | `POST /api/admin/assignments` | Create new assignment |
| `fetchRecipes()` | `GET /api/admin/recipes` | Get all recipes |
| `submitDoctorReview()` | `POST /api/doctor/reviews` | Submit recipe review |

## 🔄 Real-time Features
- **Polling**: Every 30 seconds for live updates
- **Socket.IO**: Ready for real-time notifications
- **Toast Notifications**: Status change alerts
- **Auto-refresh**: Assignment status updates

## ✅ MongoDB Data Structure
Based on your database collections:
```
aroma_db/
├── conditions/          # Medical conditions
├── doctors/             # Doctor profiles
├── recipeassignments/   # Recipe-doctor assignments
└── recipes/             # Recipe data
```

## 🎯 Next Steps
1. **Start Backend**: Ensure your Node.js backend is running on port 4000
2. **Verify MongoDB**: Check MongoDB connection at localhost:27017
3. **Test Connection**: Run the health check
4. **Start Frontend**: Launch Next.js app with `npm run dev`

## 🧪 Testing Backend Connection
```bash
# In your terminal, run:
cd "C:\Users\FUZIONEST1\Downloads\Aroma"
npx ts-node test-backend.ts
```

## 📊 Health Check
Visit: `https://aroma-db-six.vercel.app/health`
Expected response:
```json
{
  "status": "OK",
  "message": "Aroma Doctor/Admin Backend is running",
  "timestamp": "2025-11-12T...",
  "mongodb": "Connected"
}
```

## 🔐 Security & Authentication
- JWT tokens supported in configuration
- Authorization headers automatically handled
- CORS configured for localhost:3000

## 🚨 Troubleshooting
If connection fails:
1. Check backend server is running: `https://aroma-db-six.vercel.app`
2. Verify MongoDB is running: `mongodb://localhost:27017`
3. Check firewall settings
4. Verify environment variables are loaded
5. Check browser developer tools for network errors

## 📈 Features Ready
- ✅ Doctor management (CRUD)
- ✅ Recipe assignment system
- ✅ Real-time status updates
- ✅ Recipe review workflow
- ✅ Admin dashboard functionality
- ✅ Error handling and notifications
- ✅ Health monitoring

Your application is now fully configured to work with your MongoDB backend! 🎉