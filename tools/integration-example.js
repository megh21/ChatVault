/**
 * Simple example of integrating parseChatter into ChatVault
 */

import { parseChatter } from './parsechatter.js';

/**
 * Enhanced parseChat function that tries the Edit marker parser first,
 * then falls back to the original parser if needed.
 */
function enhancedParseChat(content, provider) {
  // Check if the content contains "Edit" markers
  if (content.includes("\nEdit\n") || content.match(/^Edit$/m)) {
    console.log("Detected 'Edit' markers, using specialized parser");
    
    // Use the new parser that handles Edit markers
    const parsedSegments = parseChatter(content);
    
    // Convert to the format expected by your application
    return parsedSegments.map(segment => ({
      role: segment.speaker === 'user' ? 'user' : 'assistant',
      content: segment.text,
      timestamp: new Date()
    }));
  } else {
    console.log("No 'Edit' markers detected, using standard parser");
    
    // Fall back to the existing parser for other formats
    return []; // Replace with actual call to your existing parser
  }
}

// Test with a sample chat containing Edit markers
const sample = `Hello, how are you?

Edit
I'm doing well, thank you for asking! How can I help you today?

Can you explain what an API is?

Edit
An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate with each other.`;

// Parse the sample
const messages = enhancedParseChat(sample, 'claude');

console.log("\nParsed Messages:");
messages.forEach((msg, i) => {
  console.log(`[${i+1}] ${msg.role}: ${msg.content}`);
});
