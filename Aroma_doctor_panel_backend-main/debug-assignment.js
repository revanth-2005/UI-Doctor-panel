// Debug assignment creation
console.log('=== Debug Assignment Creation ===');

// First, let's test if we can reach the MongoDB backend directly
console.log('1. Testing MongoDB backend directly...');

const testAssignment = {
  patientId: "507f1f77bcf86cd799439011", 
  doctorId: "507f1f77bcf86cd799439012",   
  recipeId: "69172124fe2fe4f2434e7af6", 
  notes: "Test assignment direct to backend",
  medicalCondition: "diabetes", // Use correct field name
  status: 'pending'
};

fetch('https://aroma-db-six.vercel.app/api/admin/assignments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testAssignment),
})
.then(async (response) => {
  console.log('Backend response status:', response.status);
  const text = await response.text();
  console.log('Backend response:', text);
  
  if (!response.ok) {
    console.log('❌ Direct backend assignment failed');
    console.log('2. Testing through frontend API...');
    
    // Test through frontend API
    return fetch('http://localhost:3000/api/admin/assignments', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipeId: "69172124fe2fe4f2434e7af6",
        doctorId: "doctor_002", // Use valid mock doctor ID
        medicalCondition: "diabetes",
        comments: "Test through frontend"
      })
    });
  } else {
    console.log('✅ Direct backend assignment succeeded!');
    return null;
  }
})
.then(async (response) => {
  if (response) {
    console.log('Frontend response status:', response.status);
    const result = await response.json();
    console.log('Frontend response:', result);
    
    // Check which data source was used
    if (result.message.includes('mock data')) {
      console.log('❌ Frontend fell back to mock data - backend validation failed');
    } else if (result.message.includes('database')) {
      console.log('✅ Frontend saved to database successfully');
    }
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});