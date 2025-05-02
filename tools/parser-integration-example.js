/**
 * This example shows how you might integrate the new parseChatter parser
 * with your existing code in ChatVault.
 */

import { parseChatter } from './parsechatter.js';

// Mock function to simulate the existing parseChat function in utils.ts
function existingParseChat(content, provider) {
  // Simplified version of your existing parser
  // This would be replaced with your actual implementation
  const lines = content.split("\n");
  const messages = [];
  
  // ... existing parsing logic here ...
  
  return messages;
}

/**
 * Enhanced parseChat function that tries the Edit marker parser first,
 * then falls back to the original parser if needed.
 * 
 * @param {string} content - The chat content to parse
 * @param {string} provider - The chat provider (chatgpt, claude, etc.)
 * @returns {Array} - Array of parsed messages
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
    return existingParseChat(content, provider);
  }
}

// Example usage in a file upload handler
function handleChatFileUpload(file, provider) {
  console.log(`Processing file: ${file.name}, Provider: ${provider}`);
  
  // Read file content
  const content = file.content; // Replace with actual file reading logic
  
  // Parse the chat content
  const messages = enhancedParseChat(content, provider);
  
  console.log(`Parsed ${messages.length} messages`);
  
  // Process the parsed messages
  // ... your existing logic to save the chat to database ...
  
  return messages;
}

// Example function for importing chats from clipboard
function importFromClipboard(clipboardText, provider) {
  // Check if clipboard content looks like a chat
  if (!clipboardText || clipboardText.length < 20) {
    console.log("Clipboard content too short to be a valid chat");
    return null;
  }
  
  // Parse the chat content
  const messages = enhancedParseChat(clipboardText, provider);
  
  if (messages.length === 0) {
    console.log("No messages could be parsed from clipboard content");
    return null;
  }
  
  console.log(`Successfully parsed ${messages.length} messages from clipboard`);
  return messages;
}

// Test cases
const testCases = [
  {
    name: "Claude chat with Edit markers",
    content: `Hello, can you help me with JavaScript?

Edit
Of course! I'd be happy to help you with JavaScript. What specific aspect or problem are you working on?

I'm trying to understand async/await. Could you explain?

Edit
Certainly! Async/await is a modern way to handle asynchronous operations in JavaScript.

Here's a simple explanation:

1. **async**: You place this keyword before a function declaration to make it return a Promise automatically. It allows you to use await inside the function.

\`\`\`javascript
async function myFunction() {
  // Function body
}
\`\`\`

2. **await**: This keyword can only be used inside async functions. It pauses the execution of the function until the Promise is resolved, making asynchronous code look and behave more like synchronous code.

\`\`\`javascript
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}
\`\`\`

The main benefits are:
- Cleaner, more readable code compared to Promise chains
- Better error handling with try/catch blocks
- Sequential-looking code for asynchronous operations

Would you like to see a more complete example?`,
    provider: "claude"
  },
  {
    name: "ChatGPT format",
    content: `User: What's the best way to learn programming?

ChatGPT: Learning programming is a journey that can be approached in many ways, but here's a structured path that works well for many people:

1. Start with fundamentals: Begin with a beginner-friendly language like Python or JavaScript.

2. Understand core concepts: Variables, data types, control structures (if/else, loops), functions, and basic data structures.

3. Practice consistently: Coding is a skill that requires regular practice.

4. Build projects: Apply what you learn to create small, then increasingly complex projects.

5. Learn to debug: Understanding how to find and fix errors is crucial.

6. Study code: Reading other people's code helps you learn different approaches.

7. Join communities: Places like Stack Overflow, GitHub, or Reddit can provide support.

8. Take structured courses: Online platforms like Coursera, Udemy, or freeCodeCamp offer comprehensive learning paths.

Remember that everyone learns differently, so find what works best for you!`,
    provider: "chatgpt"
  }
];

// Run tests
console.log("Testing the enhanced parser with different chat formats\n");

testCases.forEach(test => {
  console.log(`=== Test: ${test.name} ===`);
  const messages = enhancedParseChat(test.content, test.provider);
  
  console.log(`Parsed ${messages.length} messages:`);
  messages.forEach((msg, i) => {
    const previewText = msg.content.length > 50 
      ? msg.content.substring(0, 50) + "..." 
      : msg.content;
    console.log(`  [${i}] ${msg.role}: ${previewText}`);
  });
  
  console.log("\n");
});

// How to integrate into your component
/*
// In your import-chat-modal.tsx component:

import { parseChat } from "@/lib/utils";
import { parseChatter } from "../../parsechatter"; // Adjust path as needed

// Inside your form submission handler:
const handleImport = async (values) => {
  try {
    let messages;
    
    // If it's a Claude chat with Edit markers
    if (values.provider === "claude" && (content.includes("\nEdit\n") || content.match(/^Edit$/m))) {
      const parsedSegments = parseChatter(values.content);
      messages = parsedSegments.map(segment => ({
        role: segment.speaker === 'user' ? 'user' : 'assistant',
        content: segment.text,
        timestamp: new Date()
      }));
    } else {
      // Use the existing parser for other formats
      messages = parseChat(values.content, values.provider);
    }
    
    // Create the chat with the parsed messages
    const response = await fetch(`/api/projects/${projectId}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        summary: values.summary || generateSummary(messages),
        provider: values.provider,
        messages,
        tags: values.tags
      }),
      credentials: "include"
    });
    
    // Handle response...
  } catch (error) {
    // Handle error...
  }
};
*/

console.log("Integration example completed. You can adapt this code to your actual implementation.");
