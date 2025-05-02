import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { MessageRole, ChatProvider } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "Unknown date";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy");
}

export function formatTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "h:mm a");
}

export function formatRelativeTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy (h:mm a)");
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function generateSummary(messages: { role: MessageRole; content: string }[], maxLength = 200): string {
  // Extract text from the first few messages to create a summary
  const firstMessages = messages.slice(0, 2);
  let summaryText = firstMessages.map(msg => msg.content).join(" ");
  
  // Remove markdown and other formatting
  summaryText = summaryText.replace(/[#*`_]/g, "");
  
  // Truncate the summary
  return truncateText(summaryText, maxLength);
}

export function parseChat(content: string, provider: ChatProvider): { role: MessageRole; content: string; timestamp?: Date }[] {
  // This is a basic parser that will need to be enhanced for different chat formats
  const lines = content.split("\n");
  const messages: { role: MessageRole; content: string; timestamp?: Date }[] = [];
  
  let currentRole: MessageRole | null = null;
  let currentContent: string[] = [];
  
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
      let paragraphs: string[] = [];
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

export function getProviderIcon(provider: ChatProvider): string {
  switch (provider) {
    case "chatgpt":
      return "ri-openai-fill";
    case "claude":
      return "ri-robot-line";
    case "grok":
      return "ri-ai-generate";
    default:
      return "ri-chat-3-line";
  }
}

export function getProviderName(provider: ChatProvider): string {
  switch (provider) {
    case "chatgpt":
      return "ChatGPT";
    case "claude":
      return "Claude";
    case "grok":
      return "Grok";
    default:
      return "Other";
  }
}

export function getTagColor(tagName: string): string {
  // Generate a consistent color based on the tag name
  const colors = [
    "bg-secondary/20 text-secondary",
    "bg-accent/20 text-accent",
    "bg-highlight/40 text-primary",
    "bg-neutral-light/40 text-neutral-dark"
  ];
  
  // Simple hash function to get a consistent index
  const hash = tagName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function getWorkspaceColor(colorName: string): string {
  const colorMap: Record<string, string> = {
    accent: "bg-accent/10",
    secondary: "bg-secondary/10",
    highlight: "bg-highlight/10", 
    neutralLight: "bg-neutral-light/10",
    neutralDark: "bg-neutral-dark/10",
    primary: "bg-primary/10"
  };
  
  return colorMap[colorName] || colorMap.accent;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
