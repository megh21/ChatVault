/**
 * This script tests the parseChatter parser with a sample file.
 * 
 * Usage:
 * node test-with-file.js sample-claude-chat.txt
 */

import { parseChatter } from './parsechatter.js';
import fs from 'fs';

// Get the filename from command line arguments
const filename = process.argv[2] || 'sample-claude-chat.txt';

try {
  // Read the file
  console.log(`Reading file: ${filename}`);
  const content = fs.readFileSync(filename, 'utf8');
  
  console.log(`File length: ${content.length} characters`);
  
  // Parse the chat
  console.log('Parsing chat with parseChatter...');
  const parsed = parseChatter(content);
  
  // Report results
  console.log(`Successfully parsed ${parsed.length} segments`);
  
  // Display segments (truncated for readability)
  parsed.forEach((segment, i) => {
    const previewText = segment.text.length > 50 
      ? segment.text.substring(0, 50) + "..." 
      : segment.text;
    console.log(`[${i+1}] ${segment.speaker.toUpperCase()}: ${previewText}`);
  });
  
  // Count messages by speaker
  const userMessages = parsed.filter(p => p.speaker === 'user').length;
  const aiMessages = parsed.filter(p => p.speaker === 'ai').length;
  
  console.log(`\nSummary:`);
  console.log(`- Total segments: ${parsed.length}`);
  console.log(`- User messages: ${userMessages}`);
  console.log(`- AI responses: ${aiMessages}`);
  
} catch (error) {
  console.error('Error processing file:', error.message);
}
