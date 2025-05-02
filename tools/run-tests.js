// Run all parser tests
console.log("===== Testing parsechatter.js =====");
console.log("Running basic tests...");

// Import test-parser.js and run its tests
import './test-parser.js';

// After a short delay, run the comparison
setTimeout(() => {
  console.log("\n\n===== Comparing parsers =====");
  console.log("Running comparison between parsers...");
  
  // Import comparison tests
  import('./compare-parsers.js')
    .then(() => {
      console.log("\nTests completed!");
    })
    .catch((error) => {
      console.error("Error running comparison tests:", error);
    });
}, 1000);
