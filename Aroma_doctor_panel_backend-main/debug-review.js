// Debug the review process
console.log('=== Debug Review Process ===');

// Test with a known assignment ID from our previous test
const assignmentId = '691737a1dbb07d80c32fdb32'; // Mediterranean Quinoa Bowl

console.log(`🔍 Testing review for assignment: ${assignmentId}`);

// Test the review endpoint directly
fetch('http://localhost:3000/api/doctor/review', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assignmentId: assignmentId,
    status: 'Approved',
    doctorComment: 'Test review from debug script'
  })
})
.then(async (response) => {
  console.log('Review response status:', response.status);
  const result = await response.json();
  console.log('Review response:', JSON.stringify(result, null, 2));
  
  if (!result.success) {
    console.log('❌ Review failed, checking assignment exists...');
    
    // Check if assignment exists in the database
    return fetch(`http://localhost:3000/api/admin/assignments`)
      .then(res => res.json())
      .then(data => {
        console.log('\n🔍 All assignments in database:');
        if (data.success && data.data) {
          data.data.forEach((assignment, index) => {
            console.log(`${index + 1}. ID: ${assignment.assignmentId}, Recipe: ${assignment.recipeTitle}, Status: ${assignment.status}`);
          });
          
          const foundAssignment = data.data.find(a => a.assignmentId === assignmentId);
          if (foundAssignment) {
            console.log(`\n✅ Assignment ${assignmentId} exists in database`);
            console.log('Assignment details:', JSON.stringify(foundAssignment, null, 2));
          } else {
            console.log(`\n❌ Assignment ${assignmentId} NOT found in database`);
            console.log('Available assignment IDs:');
            data.data.forEach(a => console.log(`  - ${a.assignmentId}`));
          }
        }
      });
  } else {
    console.log('✅ Review submitted successfully');
  }
})
.catch(error => {
  console.error('❌ Review test failed:', error);
});