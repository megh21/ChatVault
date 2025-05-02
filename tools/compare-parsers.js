// Import our new parser
import { parseChatter } from './parsechatter.js';

// We'll need to replicate the existing parser's functionality here since we can't easily import TypeScript
function parseChat(content, provider = 'chatgpt') {
  // This is a simplified version of your existing parser from utils.ts
  const lines = content.split("\n");
  const messages = [];
  
  let currentRole = null;
  let currentContent = [];
  
  // Different providers have different formats
  if (provider === "chatgpt") {
    // ChatGPT format usually has "User:" and "ChatGPT:" prefixes
    lines.forEach(line => {
      if (line.trim().match(/^(User|You):\s*/i)) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n").trim(),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "user";
        currentContent.push(line.replace(/^(User|You):\s*/i, ""));
      } else if (line.trim().match(/^(ChatGPT|Assistant|AI):\s*/i)) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n").trim(),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "assistant";
        currentContent.push(line.replace(/^(ChatGPT|Assistant|AI):\s*/i, ""));
      } else {
        currentContent.push(line);
      }
    });
  } else if (provider === "claude") {
    // Claude format usually has "Human:" and "Claude:" prefixes
    lines.forEach(line => {
      if (line.trim().match(/^(Human|You):\s*/i)) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n").trim(),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "user";
        currentContent.push(line.replace(/^(Human|You):\s*/i, ""));
      } else if (line.trim().match(/^(Claude|Assistant|AI):\s*/i)) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n").trim(),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "assistant";
        currentContent.push(line.replace(/^(Claude|Assistant|AI):\s*/i, ""));
      } else {
        currentContent.push(line);
      }
    });
  } else {
    // Generic format - try to detect patterns
    let userRoleDetected = false;
    let aiRoleDetected = false;
    
    // First pass: detect role patterns
    lines.forEach(line => {
      if (line.trim().match(/^(User|You|Human|I):\s*/i)) {
        userRoleDetected = true;
      } else if (line.trim().match(/^(Assistant|AI|ChatGPT|Claude|Grok):\s*/i)) {
        aiRoleDetected = true;
      }
    });
    
    // Second pass: parse messages based on detected patterns
    if (userRoleDetected && aiRoleDetected) {
      lines.forEach(line => {
        if (line.trim().match(/^(User|You|Human|I):\s*/i)) {
          if (currentRole) {
            messages.push({
              role: currentRole,
              content: currentContent.join("\n").trim(),
              timestamp: new Date()
            });
            currentContent = [];
          }
          currentRole = "user";
          currentContent.push(line.replace(/^(User|You|Human|I):\s*/i, ""));
        } else if (line.trim().match(/^(Assistant|AI|ChatGPT|Claude|Grok):\s*/i)) {
          if (currentRole) {
            messages.push({
              role: currentRole,
              content: currentContent.join("\n").trim(),
              timestamp: new Date()
            });
            currentContent = [];
          }
          currentRole = "assistant";
          currentContent.push(line.replace(/^(Assistant|AI|ChatGPT|Claude|Grok):\s*/i, ""));
        } else {
          currentContent.push(line);
        }
      });
    } else {
      // Try to parse as alternating user/assistant messages separated by blank lines
      let paragraphs = [];
      let currentParagraph = "";
      
      // Group lines into paragraphs separated by blank lines
      lines.forEach(line => {
        if (line.trim() === "") {
          if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
            currentParagraph = "";
          }
        } else {
          currentParagraph += (currentParagraph ? "\n" : "") + line;
        }
      });
      
      // Add the last paragraph if there is one
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
      }
      
      // Convert paragraphs to alternating user/assistant messages
      if (paragraphs.length > 0) {
        paragraphs.forEach((paragraph, index) => {
          messages.push({
            role: index % 2 === 0 ? "user" : "assistant",
            content: paragraph,
            timestamp: new Date()
          });
        });
      }
    }
  }
  
  // Add the last message if there is one
  if (currentRole && currentContent.length > 0) {
    messages.push({
      role: currentRole,
      content: currentContent.join("\n").trim(),
      timestamp: new Date()
    });
  }
  
  // If no messages were detected, create a default user message with the entire content
  if (messages.length === 0 && content.trim()) {
    messages.push({
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    });
  }
  
  return messages;
}

// Sample chats for comparison
const sampleChats = [
  {
    name: "Claude chat with 'Edit' markers",
    text: `Hello Claude, what's the capital of France?

Edit
Hello! The capital of France is Paris. It's also the largest city in France and one of the most visited cities in the world, known for landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.

Can you tell me more about Paris?

Edit
I'd be happy to tell you more about Paris!

Paris is located in north-central France on the Seine River. Here are some key facts and highlights about this magnificent city:

History:
- Founded in the 3rd century BC by a Celtic tribe called the Parisii
- Became the capital of France in 987 when Hugh Capet, the first king of the Capetian dynasty, made the city his seat of government
- Underwent major transformation in the 19th century under Napoleon III and Baron Haussmann, giving the city its distinctive wide boulevards and uniform building facades

Key Landmarks:
- Eiffel Tower: Built for the 1889 World's Fair, it stands 330 meters tall
- Notre-Dame Cathedral: A masterpiece of French Gothic architecture (currently undergoing restoration after the 2019 fire)
- The Louvre: World's largest art museum and home to the Mona Lisa
- Arc de Triomphe: Commissioned by Napoleon to honor his armies
- Sacré-Cœur Basilica: Located at the summit of Montmartre, offering panoramic views of the city

Cultural Significance:
- Often called the "City of Light" (La Ville Lumière) for its role during the Age of Enlightenment and its early adoption of street lighting
- A global center for art, fashion, gastronomy, and culture
- Home to numerous world-class museums, galleries, and theaters

Would you like to know about any specific aspect of Paris in more detail?`
  },
  {
    name: "ChatGPT formatted chat",
    text: `User: What are the key differences between SQL and NoSQL databases?

ChatGPT: SQL and NoSQL databases differ in several important ways:

1. Data Structure:
   - SQL: Uses structured, tabular data in rows and columns with a predefined schema
   - NoSQL: Uses various data models (document, key-value, wide-column, graph)

2. Schema:
   - SQL: Requires a predefined, fixed schema
   - NoSQL: Schema-flexible, allowing dynamic changes

3. Scaling:
   - SQL: Scales vertically (more powerful hardware)
   - NoSQL: Scales horizontally (distributed systems across servers)

4. ACID Compliance:
   - SQL: Typically fully ACID compliant
   - NoSQL: Often sacrifices ACID properties for performance and scalability

5. Query Language:
   - SQL: Uses standardized SQL
   - NoSQL: Varies by database, often proprietary

6. Use Cases:
   - SQL: Relational data, complex queries, transactions
   - NoSQL: Big data, real-time applications, flexible schema needs

Would you like me to elaborate on any of these differences?

User: Yes, please explain ACID compliance in more detail.

ChatGPT: ACID compliance refers to a set of properties that guarantee database transactions are processed reliably. Here's a detailed explanation:

A - Atomicity: Ensures that all operations within a transaction are treated as a single unit, which either succeeds completely or fails completely. If any part of the transaction fails, the entire transaction is rolled back, leaving the database unchanged.

C - Consistency: Ensures that a transaction can only bring the database from one valid state to another, maintaining all predefined rules, constraints, cascades, and triggers.

I - Isolation: Ensures that concurrent execution of transactions leaves the database in the same state as if the transactions were executed sequentially. Transactions cannot see data in an intermediate state created by another concurrent transaction.

D - Durability: Ensures that once a transaction is committed, it remains committed even in the case of a system failure (crash or power outage). Committed data is saved by the system such that even in the event of a failure, the data is available in its correct state.

SQL databases like PostgreSQL, MySQL, and Oracle are designed to be ACID compliant, which makes them suitable for applications where data integrity is crucial, such as financial systems, reservation systems, and data warehousing.

Many NoSQL databases sacrifice some ACID properties to gain performance, scalability, or flexibility:

- Document stores like MongoDB offer ACID compliance at the document level but not always across multiple documents.
- Key-value stores like Redis might offer durability through persistence mechanisms but may sacrifice other properties.
- Wide-column stores like Cassandra provide "eventual consistency" rather than immediate consistency.

Some modern NoSQL systems are evolving to provide stronger ACID guarantees. For example, MongoDB has added multi-document ACID transactions in recent versions.

The choice between strict ACID compliance and other data models often involves trade-offs between consistency, availability, and partition tolerance (the CAP theorem).`
  },
  {
    name: "Unmarked chat (alternating paragraphs)",
    text: `What is quantum computing?

Quantum computing is a type of computing that uses quantum phenomena such as superposition and entanglement to perform operations on data. While traditional computers use bits (0s and 1s), quantum computers use quantum bits or "qubits."

Qubits can exist in multiple states simultaneously due to superposition, allowing quantum computers to process a vast number of possibilities at once. This gives quantum computers the potential to solve certain complex problems much faster than classical computers.

How might quantum computing affect cryptography?

Quantum computing poses both challenges and opportunities for cryptography. On the challenge side, sufficiently powerful quantum computers could break many of the encryption algorithms we rely on today, particularly those based on factoring large numbers (like RSA) or discrete logarithm problems (like ECC).

This is primarily due to Shor's algorithm, which can efficiently factor large numbers on a quantum computer, potentially compromising current public-key cryptography systems.

However, the field of post-quantum cryptography is developing new encryption methods that would be secure against quantum attacks. Additionally, quantum key distribution offers a way to create theoretically unhackable communication channels using the principles of quantum mechanics itself.

Organizations like NIST are already working on standardizing post-quantum cryptographic algorithms to prepare for the quantum era.`
  }
];

// Compare results
function compareResults() {
  for (const sample of sampleChats) {
    console.log(`\n=== Sample: ${sample.name} ===\n`);
    
    console.log("Original Text (first 100 chars):");
    console.log(sample.text.substring(0, 100) + "...");
    console.log("");
    
    // Parse with new parseChatter
    console.log("Results from NEW parser (parseChatter):");
    const newParserResults = parseChatter(sample.text);
    newParserResults.forEach((segment, i) => {
      console.log(`  [${i}] ${segment.speaker}: ${segment.text.substring(0, 50)}${segment.text.length > 50 ? '...' : ''}`);
    });
    console.log("");
    
    // Parse with existing parseChat 
    console.log("Results from EXISTING parser (parseChat):");
    let provider = 'other';
    if (sample.name.includes('Claude')) provider = 'claude';
    if (sample.name.includes('ChatGPT')) provider = 'chatgpt';
    
    const existingParserResults = parseChat(sample.text, provider);
    existingParserResults.forEach((segment, i) => {
      console.log(`  [${i}] ${segment.role}: ${segment.content.substring(0, 50)}${segment.content.length > 50 ? '...' : ''}`);
    });
    console.log("\n-------------------------------------------------");
  }
}

// Print a summary of comparisons
function summarize() {
  console.log("\n=== PARSER COMPARISON SUMMARY ===\n");
  
  console.log("New Parser (parseChatter):");
  console.log("✓ Pros:");
  console.log("  - Specifically designed for chats with 'Edit' markers");
  console.log("  - Simple implementation focused on one specific format");
  console.log("  - Effectively handles consecutive messages without extra spaces");
  console.log("✗ Cons:");
  console.log("  - Only works with chats that use 'Edit' markers");
  console.log("  - Doesn't handle traditional chat formats with speaker prefixes (User:, ChatGPT:, etc.)");
  console.log("");
  
  console.log("Existing Parser (parseChat):");
  console.log("✓ Pros:");
  console.log("  - Handles multiple chat formats (ChatGPT, Claude, etc.)");
  console.log("  - More flexible with different formatting styles");
  console.log("  - Falls back to alternating paragraphs when no clear markers are found");
  console.log("✗ Cons:");
  console.log("  - More complex implementation");
  console.log("  - May not handle the 'Edit' marker format as accurately");
  console.log("");
  
  console.log("Recommendation:");
  console.log("Consider using both parsers in a pipeline:");
  console.log("1. First attempt to parse with parseChatter if 'Edit' markers are likely");
  console.log("2. If no 'Edit' markers are found or parsing yields unexpected results, fall back to parseChat");
  console.log("\nThis approach would give you the best of both worlds - accurate parsing for Claude's 'Edit' format");
  console.log("while maintaining backward compatibility with other chat formats.");
}

// Run the comparison
compareResults();
summarize();
