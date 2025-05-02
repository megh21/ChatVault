# Chat Labeling and Parsing Tools

This repository contains tools for parsing and labeling Claude chat conversations.

## Labeling Tool

The `labeling_tool.js` script helps you add speaker labels to your chat files. This creates training data that can be used to improve the chat parser.

### Usage

```bash
node labeling_tool.js <filename>
```

For example:
```bash
node labeling_tool.js test3.txt
```

### How the Labeling Tool Works

1. The tool shows you chunks of text from your chat file
2. You identify where new segments start by entering the character position
3. You indicate whether each segment is from a "user" or "ai"
4. When finished, the tool saves:
   - A JSON file with the labeled segments
   - A verification file to help you confirm the segments are correct

### Labeling Commands

- Enter a number to mark a new segment at that position
- Type `next` to move to the next chunk of text
- Type `done` or `quit` to finish labeling and save your work

## Chat Parser

The `parsechatter.js` file contains the algorithm for automatically parsing Claude chats into user and AI segments.

### Usage in Your Code

```javascript
import { parseChatter } from './parsechatter.js';

const chatText = "..."; // Your chat text here
const segments = parseChatter(chatText);

// Process the segments
segments.forEach(segment => {
  console.log(`${segment.speaker}: ${segment.text.substring(0, 50)}...`);
});
```

### Testing the Parser

Use the `test-with-file.js` script to test the parser on your chat files:

```bash
node test-with-file.js <filename>
```

## Improving the Parser

After labeling more examples with the labeling tool, you can use the labeled data to improve the parser by:

1. Identifying new patterns in different types of chat formats
2. Adding format-specific parsing strategies
3. Refining the pattern detection rules

The current parser supports:
- Simple Claude chats with clear "Edit" markers (like test.txt)
- GitHub-style chats with more complex formatting (like test2.txt)
