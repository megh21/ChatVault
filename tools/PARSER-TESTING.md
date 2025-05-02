# Testing the Chat Parser for ChatVault

This document provides instructions for testing the new `parseChatter.js` parser, which is designed to parse chats with "Edit" markers (commonly used in Claude chats) into user and AI message segments.

## Files Overview

- `parsechatter.js` - The main parser function for "Edit" marker format
- `test-parser.js` - Basic unit tests for the parser
- `compare-parsers.js` - Comparison between the new parser and existing parser
- `parser-integration-example.js` - Example of how to integrate the parser
- `test-with-file.js` - Script to test the parser with a real chat file
- `sample-claude-chat.txt` - A sample Claude chat file for testing
- `run-parser-tests.sh` - Shell script to run all tests (for Linux/Mac)
- `run-tests.js` - JavaScript script to run all tests (platform-independent)

## Quick Start

### Option 1: Using Node.js directly

```bash
# Test the parser with basic unit tests
node test-parser.js

# Compare with existing parser
node compare-parsers.js

# Test with a sample chat file
node test-with-file.js sample-claude-chat.txt

# Run integration example
node parser-integration-example.js
```

### Option 2: Using the provided scripts

```bash
# For Linux/Mac/WSL
chmod +x run-parser-tests.sh
./run-parser-tests.sh

# For any platform with Node.js
node run-tests.js
```

## Understanding the Parser

The `parseChatter.js` file contains a function that parses a chat log based on "Edit" markers. It identifies these markers and separates the content into user and AI messages based on the following rules:

1. Text before the first "Edit" marker is considered a user message
2. Text between an "Edit" marker and the next "Edit" marker (or the end of the text) is considered an AI response
3. If there are no "Edit" markers, the entire text is treated as a user message

## Integration with Existing Parser

The `parser-integration-example.js` file shows how to integrate this parser with your existing codebase. The key approach is:

1. First check if the chat content contains "Edit" markers
2. If it does, use the new `parseChatter` function
3. If not, fall back to the existing parsing logic

## Testing with Your Own Chat Files

You can test the parser with your own Claude chat exports:

1. Save a Claude chat conversation to a text file
2. Run: `node test-with-file.js path/to/your/chat.txt`

This will parse the chat and show you the results, as well as save the parsed result to a JSON file for inspection.

## Expected Output Format

The parser returns an array of objects, each representing a segment of the conversation:

```javascript
[
  { speaker: 'user', text: 'User message text here' },
  { speaker: 'ai', text: 'AI response text here' },
  // ...more segments
]
```

This format can be easily mapped to your application's data structure.

## Common Issues and Troubleshooting

- **No segments detected**: Ensure the file contains "Edit" markers on their own lines
- **Missing messages**: Check if the "Edit" markers are correctly formatted (they should be on a line by themselves)
- **Unexpected splitting**: The parser is sensitive to the exact format of "Edit" markers

## Next Steps

Once you've confirmed the parser works correctly with your chat formats, you can integrate it into your ChatVault application following the pattern in `parser-integration-example.js`.
