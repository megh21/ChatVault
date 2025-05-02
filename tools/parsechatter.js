/**
 * Parses a plain-text chat log from Claude into an array of segments labeled by speaker.
 * 
 * @param {string} rawText - The full chat text.
 * @returns {Array<{ speaker: 'user' | 'ai', text: string }>} Parsed segments.
 */
export function parseChatter(rawText) {
  // Step 1: Identify the chat format type based on patterns
  const isGithubFormat = rawText.includes('GITHUB') || 
                        rawText.includes('Interactive artifact') || 
                        rawText.includes('Architecture');
  
  // Step 2: Choose parsing strategy based on format
  return isGithubFormat ? parseGithubStyleChat(rawText) : parseSimpleChat(rawText);
}

/**
 * Parses a simple Claude chat with clear Edit markers and user/AI alternating pattern.
 * This works well for files like test.txt
 */
function parseSimpleChat(rawText) {
  const segments = [];
  const parts = rawText.split(/^Edit\s*$/m);
  
  // Process first user message
  if (parts.length > 0 && parts[0].trim()) {
    segments.push({ 
      speaker: 'user', 
      text: cleanText(parts[0].trim())
    });
  }
  
  // Process alternating AI response and user message
  for (let i = 1; i < parts.length; i++) {
    let part = parts[i].trim();
    if (!part) continue;
    
    // Find user/AI boundary - look for multiple empty lines (3+)
    const multipleNewlines = part.match(/\n{3,}/);
    
    if (multipleNewlines && multipleNewlines.index > 0) {
      // Split into AI response and user message
      const aiText = part.substring(0, multipleNewlines.index).trim();
      const userText = part.substring(multipleNewlines.index + multipleNewlines[0].length).trim();
      
      if (aiText) {
        segments.push({ speaker: 'ai', text: cleanText(aiText) });
      }
      
      if (userText) {
        segments.push({ speaker: 'user', text: cleanText(userText) });
      }
    } else {
      // No user message found, it's just an AI response
      segments.push({ speaker: 'ai', text: cleanText(part) });
    }
  }
  
  return segments;
}

/**
 * Parses a more complex Github-style Claude chat with special patterns.
 * This works well for files like test2.txt
 */
function parseGithubStyleChat(rawText) {
  const segments = [];
  const parts = rawText.split(/^Edit\s*$/m);
  
  // Process first user message
  if (parts.length > 0 && parts[0].trim()) {
    segments.push({ 
      speaker: 'user', 
      text: cleanGithubUserText(parts[0].trim())
    });
  }
  
  // Process remaining parts
  for (let i = 1; i < parts.length; i++) {
    let part = parts[i].trim();
    if (!part) continue;
    
    // Patterns that specifically indicate a new user query in Github format
    const userQueryPatterns = [
      { regex: /^Retry\s*\n/m, priority: 1 },
      { regex: /^An error occurred/im, priority: 1 },
      { regex: /^megh\d+\/[\w-]+\s*\n/m, priority: 1 },
      { regex: /^so based on this/im, priority: 1 },
      { regex: /\n\s*Can you fix this error/im, priority: 2 }
    ];
    
    let userQueryStartIndex = -1;
    
    // Find if and where a user query starts in this part
    for (const pattern of userQueryPatterns) {
      const match = part.match(pattern.regex);
      if (match && (userQueryStartIndex === -1 || match.index < userQueryStartIndex)) {
        userQueryStartIndex = match.index;
      }
    }
    
    // Special case: check if the AI response starts with a thinking line
    // (short line followed by newlines)
    const thinkingMatch = part.match(/^(.{1,60})\n+/);
    const hasAiThinking = thinkingMatch && thinkingMatch[1].length < 60;
    
    if (userQueryStartIndex > 0) {
      // We have both AI response and then user query in this part
      const aiResponse = part.substring(0, userQueryStartIndex).trim();
      const userQuery = part.substring(userQueryStartIndex).trim();
      
      if (aiResponse) {
        segments.push({
          speaker: 'ai',
          text: cleanText(aiResponse)
        });
      }
      
      if (userQuery) {
        segments.push({
          speaker: 'user',
          text: cleanGithubUserText(userQuery)
        });
      }
    } else {
      // This entire part is an AI response
      segments.push({
        speaker: 'ai',
        text: cleanText(part)
      });
    }
  }
  
  return consolidateSegments(segments);
}

/**
 * Clean up text from common chat artifacts.
 */
function cleanText(text) {
  // Remove trailing numbers
  let cleaned = text.replace(/\n+\s*\d+\s*$/g, '');
  
  // Remove Claude signature
  cleaned = cleaned.replace(/\s*Claude\s*$/g, '');
  
  // Clean up multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Clean up GitHub-style user text.
 */
function cleanGithubUserText(text) {
  // Remove "Content not accessible" header
  let cleaned = text.replace(/^Content not accessible\s*\n?/i, '');
  
  // Remove standalone "GITHUB" label
  cleaned = cleaned.replace(/^GITHUB\s*\n?/i, '');
  
  // Clean up "Retry" when it's alone on a line
  cleaned = cleaned.replace(/^Retry\s*$/mi, '');
  
  // Remove "Show X Item" type text
  cleaned = cleaned.replace(/Show \d+ Item[s]?\s*$/i, '');
  
  // Also apply standard text cleaning
  return cleanText(cleaned);
}

/**
 * Consolidates segments by merging adjacent segments with the same speaker and removing empty ones.
 */
function consolidateSegments(segments) {
  if (segments.length <= 1) return segments;
  
  const result = [];
  let currentSegment = { ...segments[0] };
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const text = segment.text.trim();
    
    if (!text) continue; // Skip empty segments
    
    if (segment.speaker === currentSegment.speaker) {
      // Merge with previous segment
      currentSegment.text += '\n\n' + text;
    } else {
      // Add the current segment and start a new one
      result.push(currentSegment);
      currentSegment = { ...segment, text };
    }
  }
  
  // Add the last segment
  if (currentSegment.text.trim()) {
    result.push(currentSegment);
  }
  
  return result;
}

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseChatter };
}
