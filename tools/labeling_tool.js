// A simple command-line tool for annotating chat files with speaker labels
import fs from 'fs';
import readline from 'readline';

// Configure the tool
const CHUNK_SIZE = 500; // Number of characters to show at a time
const OVERLAP = 100;    // Overlap between chunks to provide context

// Main function to run the labeling process
async function labelFile(inputFilePath) {
  // Check if the file exists
  if (!fs.existsSync(inputFilePath)) {
    console.error(`Error: File '${inputFilePath}' does not exist.`);
    process.exit(1);
  }
  
  const outputFilePath = inputFilePath + '.labels.json';
  
  // Read the entire file content
  const text = fs.readFileSync(inputFilePath, 'utf8');
  
  // Create a readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Ask a question and get a response
  const question = (query) => new Promise(resolve => rl.question(query, resolve));
  
  console.log('\n===== Chat File Labeling Tool =====');
  console.log(`Labeling file: ${inputFilePath}`);
  console.log('Instructions:');
  console.log('- You will be shown chunks of text from the file');
  console.log('- Type the character position where a new segment starts');
  console.log('- Then indicate if it\'s a "user" or "ai" segment');
  console.log('- Type "done" when you\'ve labeled all segments');
  console.log('- Type "quit" to save and exit at any time\n');
  
  // Initialize the segments array
  const segments = [];
  
  // Track our position in the text
  let position = 0;
  let done = false;
  
  // Show the beginning of the file automatically (assumed to be a user message)
  console.log('Assuming the file begins with a user or AI message...');
  const firstSpeaker = await question('Is the beginning of the file [u]ser or [a]i? (u/a): ');
  
  if (firstSpeaker.toLowerCase() === 'u' || firstSpeaker.toLowerCase() === 'user') {
    segments.push({
      offset: 0,
      speaker: 'user',
      preview: text.substring(0, 50).replace(/\n/g, ' ').trim() + '...'
    });
  } else if (firstSpeaker.toLowerCase() === 'a' || firstSpeaker.toLowerCase() === 'ai') {
    segments.push({
      offset: 0,
      speaker: 'ai',
      preview: text.substring(0, 50).replace(/\n/g, ' ').trim() + '...'
    });
  } else {
    console.log('Invalid input. Assuming user.');
    segments.push({
      offset: 0,
      speaker: 'user',
      preview: text.substring(0, 50).replace(/\n/g, ' ').trim() + '...'
    });
  }
  
  // Main labeling loop
  while (!done && position < text.length) {
    // Show a chunk of text with line numbers and character positions
    console.log('\n' + '='.repeat(80));
    console.log(`Showing text from position ${position} to ${Math.min(position + CHUNK_SIZE, text.length)}`);
    console.log('='.repeat(80) + '\n');
    
    // Display text with character positions
    const chunk = text.substring(position, position + CHUNK_SIZE);
    const lines = chunk.split('\n');
    
    let displayText = '';
    let charPos = position;
    
    for (const line of lines) {
      displayText += `${charPos}: ${line}\n`;
      charPos += line.length + 1; // +1 for the newline
    }
    
    console.log(displayText);
    
    // Ask where the next segment starts
    const input = await question('\nEnter position where a new segment starts (or "next", "done", "quit"): ');
    
    if (input.toLowerCase() === 'next') {
      // Advance to the next chunk
      position += CHUNK_SIZE - OVERLAP;
      continue;
    } else if (input.toLowerCase() === 'done' || input.toLowerCase() === 'quit') {
      // Finished labeling
      done = true;
      continue;
    }
    
    // Try to parse the input as a number
    const segmentStart = parseInt(input, 10);
    
    if (isNaN(segmentStart) || segmentStart < position || segmentStart >= position + CHUNK_SIZE) {
      console.log('Invalid position. Please try again.');
      continue;
    }
    
    // Ask what type of segment it is
    const speakerType = await question('Is this a [u]ser or [a]i segment? (u/a): ');
    
    if (speakerType.toLowerCase() === 'u' || speakerType.toLowerCase() === 'user') {
      segments.push({
        offset: segmentStart,
        speaker: 'user',
        preview: text.substring(segmentStart, segmentStart + 50).replace(/\n/g, ' ').trim() + '...'
      });
      console.log('User segment added.');
    } else if (speakerType.toLowerCase() === 'a' || speakerType.toLowerCase() === 'ai') {
      segments.push({
        offset: segmentStart,
        speaker: 'ai',
        preview: text.substring(segmentStart, segmentStart + 50).replace(/\n/g, ' ').trim() + '...'
      });
      console.log('AI segment added.');
    } else {
      console.log('Invalid segment type. Please use "u" for user or "a" for AI.');
    }
  }
  
  // Sort segments by offset
  segments.sort((a, b) => a.offset - b.offset);
  
  // Save the labels to a JSON file
  fs.writeFileSync(
    outputFilePath, 
    JSON.stringify({ segments }, null, 2)
  );
  
  console.log(`\nLabeling complete! Saved to ${outputFilePath}`);
  console.log('Summary of labeled segments:');
  
  segments.forEach((segment, i) => {
    console.log(`[${i + 1}] ${segment.speaker.toUpperCase()} @ ${segment.offset}: ${segment.preview}`);
  });
  
  // Generate sample text for verification
  let verificationText = '';
  for (let i = 0; i < segments.length; i++) {
    const currentSegment = segments[i];
    const nextSegment = i < segments.length - 1 ? segments[i + 1] : { offset: text.length };
    
    // Get the text for this segment
    const segmentText = text.substring(currentSegment.offset, nextSegment.offset);
    const previewLength = Math.min(segmentText.length, 100);
    const preview = segmentText.substring(0, previewLength).replace(/\n/g, ' ');
    
    verificationText += `${currentSegment.speaker.toUpperCase()}: ${preview}${previewLength < segmentText.length ? '...' : ''}\n\n`;
  }
  
  // Save the verification text
  const verificationFilePath = inputFilePath + '.verification.txt';
  fs.writeFileSync(verificationFilePath, verificationText);
  console.log(`\nVerification text saved to ${verificationFilePath}`);
  
  // Close the readline interface
  rl.close();
}

// Check if a filename was provided as a command-line argument
if (process.argv.length < 3) {
  console.log('Usage: node labeling_tool.js <filename>');
  process.exit(1);
}

// Run the labeling tool with the provided filename
labelFile(process.argv[2])
  .catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
  });
