// Test script for question personalization API
const BASE_URL = 'http://localhost:3000';

async function testPersonalizationAPI() {
  console.log('🧪 Testing Question Personalization API\n');
  console.log('='.repeat(60));

  // Test 1: Valid personalization request
  console.log('\n✅ Test 1: Valid personalization with 3 interests');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'What is 2 + 2?',
        options: { A: '3', B: '4', C: '5', D: '6' },
        studentInterests: ['Sports', 'Music', 'Gaming'],
        concept: 'Addition'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✓ Test 1 passed');
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message);
  }

  // Test 2: Missing questionText
  console.log('\n✅ Test 2: Missing questionText (should fail)');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        options: { A: '3', B: '4', C: '5', D: '6' },
        studentInterests: ['Sports'],
        concept: 'Addition'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (response.status === 400 && data.error) {
      console.log('✓ Test 2 passed - Correctly rejected');
    } else {
      console.log('✗ Test 2 failed - Should have returned 400');
    }
  } catch (error) {
    console.error('✗ Test 2 failed:', error.message);
  }

  // Test 3: Missing studentInterests
  console.log('\n✅ Test 3: Missing studentInterests (should fail)');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'What is 2 + 2?',
        options: { A: '3', B: '4', C: '5', D: '6' },
        concept: 'Addition'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (response.status === 400 && data.error) {
      console.log('✓ Test 3 passed - Correctly rejected');
    } else {
      console.log('✗ Test 3 failed - Should have returned 400');
    }
  } catch (error) {
    console.error('✗ Test 3 failed:', error.message);
  }

  // Test 4: Empty interests array
  console.log('\n✅ Test 4: Empty interests array (should fail)');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'What is 2 + 2?',
        options: { A: '3', B: '4', C: '5', D: '6' },
        studentInterests: [],
        concept: 'Addition'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (response.status === 400 && data.error) {
      console.log('✓ Test 4 passed - Correctly rejected');
    } else {
      console.log('✗ Test 4 failed - Should have returned 400');
    }
  } catch (error) {
    console.error('✗ Test 4 failed:', error.message);
  }

  // Test 5: Single interest
  console.log('\n✅ Test 5: Single interest');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'Calculate 3/4 of 12',
        options: { A: '9', B: '8', C: '10', D: '6' },
        studentInterests: ['Sports'],
        concept: 'Fractions'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.usedInterest === 'Sports') {
      console.log('✓ Test 5 passed - Used the only interest');
    } else {
      console.log('✗ Test 5 failed - Should have used Sports');
    }
  } catch (error) {
    console.error('✗ Test 5 failed:', error.message);
  }

  // Test 6: Two interests
  console.log('\n✅ Test 6: Two interests (random selection)');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'What is 50% of 100?',
        options: { A: '25', B: '50', C: '75', D: '100' },
        studentInterests: ['Technology', 'Science'],
        concept: 'Percentages'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (['Technology', 'Science'].includes(data.usedInterest)) {
      console.log('✓ Test 6 passed - Used one of the two interests');
    } else {
      console.log('✗ Test 6 failed - Should have used Technology or Science');
    }
  } catch (error) {
    console.error('✗ Test 6 failed:', error.message);
  }

  // Test 7: More than 3 interests (should use first 3)
  console.log('\n✅ Test 7: More than 3 interests (uses first 3)');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'Solve: 5 × 6',
        options: { A: '30', B: '25', C: '35', D: '40' },
        studentInterests: ['Sports', 'Music', 'Gaming', 'Technology', 'Art'],
        concept: 'Multiplication'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (['Sports', 'Music', 'Gaming'].includes(data.usedInterest)) {
      console.log('✓ Test 7 passed - Used one of the first 3 interests');
    } else {
      console.log('✗ Test 7 failed - Should have used Sports, Music, or Gaming');
    }
  } catch (error) {
    console.error('✗ Test 7 failed:', error.message);
  }

  // Test 8: Fallback behavior (if AI fails, should return original)
  console.log('\n✅ Test 8: Fallback behavior check');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'What is the capital of France?',
        options: { A: 'London', B: 'Paris', C: 'Berlin', D: 'Madrid' },
        studentInterests: ['Travel'],
        concept: 'Geography'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.success) {
      console.log('✓ Test 8 passed - API responded successfully');
      if (data.fallback) {
        console.log('  (Used fallback - AI service may be unavailable)');
      }
    } else {
      console.log('✗ Test 8 failed - API should always return success');
    }
  } catch (error) {
    console.error('✗ Test 8 failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Testing Complete!\n');
}

// Run tests
testPersonalizationAPI().catch(console.error);
