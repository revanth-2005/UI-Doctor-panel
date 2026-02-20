# 🚀 Step-by-Step Setup Guide for MongoDB Integration

## Prerequisites Checklist
- [ ] MongoDB running on `mongodb://localhost:27017`
- [ ] Your Node.js backend running on `https://aroma-db-six.vercel.app`
- [ ] Next.js frontend ready to test

## 1. Start Your Backend Server

Make sure your Node.js backend is running:

```bash
# In your backend directory, run:
npm start
# or
node server.js
# or
node app.js

# Your backend should show:
# ✅ Connected to MongoDB successfully
# 🚀 Server listening on port 4000
```

## 2. Verify Backend Health

Open your browser and go to: **https://aroma-db-six.vercel.app/health**

Expected response:
```json
{
  "status": "OK",
  "message": "Aroma Doctor/Admin Backend is running",
  "timestamp": "2025-11-12T...",
  "mongodb": "Connected"
}
```

## 3. Test Database Operations

### Quick Command Line Test
```bash
# Test if backend is accessible
curl https://aroma-db-six.vercel.app/health

# Test admin endpoints
curl https://aroma-db-six.vercel.app/api/admin/doctors
curl https://aroma-db-six.vercel.app/api/admin/recipes
curl https://aroma-db-six.vercel.app/api/admin/assignments
```

### Frontend Testing
1. **Start Next.js app:**
   ```bash
   cd "C:\Users\FUZIONEST1\Downloads\Aroma"
   npm run dev
   ```

2. **Access Test Page:**
   - Open: http://localhost:3000
   - Click "🧪 Test Database Connection"
   - Or go directly to: http://localhost:3000/test-db

3. **Verify Connection Tests:**
   - ✅ Backend Health should be "PASS"
   - ✅ Fetch Doctors should show count
   - ✅ Fetch Recipes should show count

## 4. Test Adding Data

### Add a Doctor:
1. Fill in the "Add New Doctor" form
2. Use test data:
   - **Name:** Dr. John Smith
   - **Email:** john.smith@example.com
   - **Specialization:** Nutritionist
   - **License:** NUT-12345
   - **Phone:** +1-555-0123

3. Click "Add Doctor to Database"
4. Check if it appears in "Current Doctors" list

### Add a Recipe:
1. Fill in the "Add New Recipe" form
2. Use test data:
   - **Title:** Healthy Quinoa Bowl
   - **Description:** Nutritious quinoa bowl with vegetables
   - **Condition Tag:** diabetes
   - **Ingredients:**
     ```
     2 cups quinoa
     1 tbsp olive oil
     1 cup cherry tomatoes
     1/2 cup cucumber
     ```
   - **Instructions:**
     ```
     Cook quinoa according to package directions
     Heat olive oil in a pan
     Add tomatoes and cook for 5 minutes
     Mix all ingredients together
     ```

3. Click "Add Recipe to Database"
4. Check if it appears in "Current Recipes" list

## 5. Verify Data in MongoDB

### Using MongoDB Compass:
1. Connect to `mongodb://localhost:27017`
2. Open database: `aroma_db`
3. Check collections:
   - **doctors** - Should show your new doctor
   - **recipes** - Should show your new recipe

### Using MongoDB Command Line:
```bash
mongosh
use aroma_db
db.doctors.find()
db.recipes.find()
```

## 6. Test Admin Panel

1. Go to: http://localhost:3000
2. Login as admin: admin@example.com / password
3. Navigate to Admin Dashboard
4. Test:
   - **Doctor Management**: View, add, approve doctors
   - **Recipe Assignments**: Create assignments, view status
   - **Real-time Updates**: Create assignments and watch status

## 7. Test Doctor Panel

1. Go to: http://localhost:3000
2. Login as doctor: doctor@example.com / password
3. Navigate to Doctor Dashboard
4. Test:
   - **View Assignments**: See assigned recipes
   - **Review Recipes**: Approve/reject with comments
   - **Real-time Updates**: See assignment changes

## 🔧 Troubleshooting

### Backend Not Accessible
```bash
# Check if backend is running
netstat -an | findstr :4000

# Check backend logs for errors
# Look for MongoDB connection issues
```

### MongoDB Issues
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Check database exists
mongosh --eval "show dbs"
```

### Network Issues
- Disable Windows Firewall temporarily
- Check if antivirus is blocking connections
- Verify ports 3000, 4000, 27017 are not blocked

### Common Fixes
1. **CORS Errors**: Make sure backend CORS allows localhost:3000
2. **Port Conflicts**: Change ports if 4000 or 27017 are in use
3. **Environment Variables**: Ensure .env.local is loaded properly

## 📊 Expected Results

After successful setup, you should see:

### ✅ Test Page Results:
- Backend Health: ✅ PASS
- Fetch Doctors: ✅ PASS - Found X doctors
- Fetch Recipes: ✅ PASS - Found X recipes

### ✅ Admin Panel Features:
- Create and manage doctors ✅
- Create recipe assignments ✅
- View assignment statuses ✅
- Real-time updates ✅

### ✅ Doctor Panel Features:
- View assigned recipes ✅
- Submit reviews with comments ✅
- Real-time assignment updates ✅

### ✅ Database Persistence:
- All data saved to MongoDB ✅
- Data persists after restart ✅
- Proper relationships maintained ✅

## 🎉 Success Indicators

You'll know everything is working when:
1. Test page shows all green checkmarks ✅
2. You can add doctors and they appear in the database
3. You can add recipes and they appear in the database
4. Admin panel shows real data from MongoDB
5. Doctor panel shows real assignments
6. Changes made in one panel appear in the other

## 📞 Need Help?

If you encounter issues:
1. Check backend logs for error messages
2. Use browser DevTools Network tab to see API calls
3. Verify MongoDB connection and data
4. Ensure all services are running on correct ports

Your system is now fully integrated with MongoDB! 🚀