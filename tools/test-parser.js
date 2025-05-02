// Import the new parser
import { parseChatter } from './parsechatter.js';

// Test cases
const testCases = [
  {
    name: "Basic conversation with Edit markers",
    text: `This is a user question?

Edit
This is an AI response to the question.

Can you explain more?

Edit
Here is more explanation from the AI.`,
    expected: [
      { speaker: 'user', text: 'This is a user question?' },
      { speaker: 'ai', text: 'This is an AI response to the question.' },
      { speaker: 'user', text: 'Can you explain more?' },
      { speaker: 'ai', text: 'Here is more explanation from the AI.' }
    ]
  },
  {
    name: "Text with no markers",
    text: "This is just user text with no AI response",
    expected: [
      { speaker: 'user', text: 'This is just user text with no AI response' }
    ]
  },
  {
    name: "Multiple consecutive Edit markers",
    text: `User question 1

Edit
AI response 1

User question 2

Edit
AI response 2

User question 3

Edit
AI response 3`,
    expected: [
      { speaker: 'user', text: 'User question 1' },
      { speaker: 'ai', text: 'AI response 1' },
      { speaker: 'user', text: 'User question 2' },
      { speaker: 'ai', text: 'AI response 2' },
      { speaker: 'user', text: 'User question 3' },
      { speaker: 'ai', text: 'AI response 3' }
    ]
  }
];

// Test function
function runTests() {
  console.log("Running parser tests...\n");
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    console.log(`Test: ${test.name}`);
    
    try {
      const result = parseChatter(test.text);
      
      // Compare result with expected
      let testPassed = true;
      
      if (result.length !== test.expected.length) {
        console.log(`❌ FAILED: Expected ${test.expected.length} segments but got ${result.length}`);
        testPassed = false;
      } else {
        for (let i = 0; i < result.length; i++) {
          if (result[i].speaker !== test.expected[i].speaker || 
              result[i].text !== test.expected[i].text) {
            console.log(`❌ FAILED at segment ${i}:`);
            console.log(`  Expected: { speaker: "${test.expected[i].speaker}", text: "${test.expected[i].text.substring(0, 50)}${test.expected[i].text.length > 50 ? '...' : ''}" }`);
            console.log(`  Got:      { speaker: "${result[i].speaker}", text: "${result[i].text.substring(0, 50)}${result[i].text.length > 50 ? '...' : ''}" }`);
            testPassed = false;
            break;
          }
        }
      }
      
      if (testPassed) {
        console.log("✅ PASSED");
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
    
    console.log(); // empty line for separation
  }
  
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
}

// Run the tests
runTests();
