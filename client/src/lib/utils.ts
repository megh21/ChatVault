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
      if (line.startsWith("User:") || line.startsWith("You:")) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n"),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "user";
        currentContent.push(line.replace(/^(User:|You:)\s*/, ""));
      } else if (line.startsWith("ChatGPT:") || line.startsWith("Assistant:")) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n"),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "assistant";
        currentContent.push(line.replace(/^(ChatGPT:|Assistant:)\s*/, ""));
      } else {
        currentContent.push(line);
      }
    });
  } else if (provider === "claude") {
    // Claude format usually has "Human:" and "Claude:" prefixes
    lines.forEach(line => {
      if (line.startsWith("Human:") || line.startsWith("You:")) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n"),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "user";
        currentContent.push(line.replace(/^(Human:|You:)\s*/, ""));
      } else if (line.startsWith("Claude:") || line.startsWith("Assistant:")) {
        if (currentRole) {
          messages.push({
            role: currentRole,
            content: currentContent.join("\n"),
            timestamp: new Date()
          });
          currentContent = [];
        }
        currentRole = "assistant";
        currentContent.push(line.replace(/^(Claude:|Assistant:)\s*/, ""));
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
      if (line.match(/^(User|You|Human|I):/i)) {
        userRoleDetected = true;
      } else if (line.match(/^(Assistant|AI|ChatGPT|Claude|Grok):/i)) {
        aiRoleDetected = true;
      }
    });
    
    // Second pass: parse messages based on detected patterns
    if (userRoleDetected && aiRoleDetected) {
      lines.forEach(line => {
        if (line.match(/^(User|You|Human|I):/i)) {
          if (currentRole) {
            messages.push({
              role: currentRole,
              content: currentContent.join("\n"),
              timestamp: new Date()
            });
            currentContent = [];
          }
          currentRole = "user";
          currentContent.push(line.replace(/^(User|You|Human|I):\s*/i, ""));
        } else if (line.match(/^(Assistant|AI|ChatGPT|Claude|Grok):/i)) {
          if (currentRole) {
            messages.push({
              role: currentRole,
              content: currentContent.join("\n"),
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
      // Alternate user/assistant messages if no clear pattern is detected
      let isUser = true;
      let currentMessage = "";
      
      lines.forEach(line => {
        if (line.trim() === "") {
          if (currentMessage) {
            messages.push({
              role: isUser ? "user" : "assistant",
              content: currentMessage,
              timestamp: new Date()
            });
            currentMessage = "";
            isUser = !isUser;
          }
        } else {
          currentMessage += (currentMessage ? "\n" : "") + line;
        }
      });
      
      if (currentMessage) {
        messages.push({
          role: isUser ? "user" : "assistant",
          content: currentMessage,
          timestamp: new Date()
        });
      }
    }
  }
  
  // Add the last message if there is one
  if (currentRole && currentContent.length > 0) {
    messages.push({
      role: currentRole,
      content: currentContent.join("\n"),
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
  const colorMap: Record<string, { bg: string; dot: string }> = {
    accent: { bg: "bg-accent/10", dot: "bg-accent" },
    secondary: { bg: "bg-secondary/10", dot: "bg-secondary" },
    highlight: { bg: "bg-highlight/10", dot: "bg-highlight" },
    neutralLight: { bg: "bg-neutral-light/10", dot: "bg-neutral-light" },
    neutralDark: { bg: "bg-neutral-dark/10", dot: "bg-neutral-dark" },
    primary: { bg: "bg-primary/10", dot: "bg-primary" }
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
