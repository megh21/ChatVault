import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ChatList } from "@/components/chat-list";
import { ChatView } from "@/components/chat-view";
import { ImportChatModal } from "@/components/modals/import-chat-modal";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChatWithTags, ProjectWithChats } from "@/lib/types";
import { Message } from "@shared/schema";
import { ChevronRightIcon, FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [, params] = useRoute("/project/:projectId/chat/:chatId");
  const projectId = params ? parseInt(params.projectId) : 0;
  const chatId = params ? parseInt(params.chatId) : 0;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<ChatWithTags[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatWithTags | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [project, setProject] = useState<ProjectWithChats | null>(null);
  const [loading, setLoading] = useState(true);
  const [importChatOpen, setImportChatOpen] = useState(false);
  
  // Fetch project and chats
  useEffect(() => {
    const fetchProjectAndChats = async () => {
      try {
        setLoading(true);
        
        // Fetch project
        const projectResponse = await fetch(`/api/projects/${projectId}`, {
          credentials: "include"
        });
        
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project");
        }
        
        const projectData = await projectResponse.json();
        setProject(projectData.project);
        
        // Fetch chats for this project
        const chatsResponse = await fetch(`/api/projects/${projectId}/chats`, {
          credentials: "include"
        });
        
        if (!chatsResponse.ok) {
          throw new Error("Failed to fetch chats");
        }
        
        const chatsData = await chatsResponse.json();
        setChats(chatsData.chats || []);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProjectAndChats();
    }
  }, [projectId, toast]);
  
  // Fetch chat details
  useEffect(() => {
    const fetchChatAndMessages = async () => {
      try {
        setLoading(true);
        
        const chatResponse = await fetch(`/api/chats/${chatId}`, {
          credentials: "include"
        });
        
        if (!chatResponse.ok) {
          throw new Error("Failed to fetch chat");
        }
        
        const chatData = await chatResponse.json();
        setCurrentChat(chatData.chat);
        setMessages(chatData.messages || []);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        toast({
          title: "Error",
          description: "Failed to load chat conversation. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (chatId) {
      fetchChatAndMessages();
    }
  }, [chatId, toast]);
  
  // If no real data, create demo data
  useEffect(() => {
    if (!loading && !currentChat && chats.length === 0) {
      const demoProject: ProjectWithChats = {
        id: projectId,
        name: "GPT-4 Experiments",
        description: "Testing capabilities of the GPT-4 model",
        workspaceId: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProject(demoProject);
      
      const demoChats: ChatWithTags[] = [
        {
          id: 1,
          title: "Advanced Prompt Engineering Techniques",
          summary: "Discussion about advanced prompt engineering techniques like chain-of-thought, few-shot learning, and persona setting for better results.",
          provider: "chatgpt",
          projectId,
          userId: 1,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          lastViewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: [
            { id: 1, name: "technique", userId: 1, chatId: 1, createdAt: new Date() }
          ]
        },
        {
          id: 2,
          title: "Improving Code Generation",
          summary: "Exploration of different approaches to generate better code with LLMs, focusing on specific instructions and code review patterns.",
          provider: "claude",
          projectId,
          userId: 1,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lastViewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: [
            { id: 2, name: "code", userId: 1, chatId: 2, createdAt: new Date() },
            { id: 3, name: "guide", userId: 1, chatId: 2, createdAt: new Date() }
          ]
        }
      ];
      
      setChats(demoChats);
      
      const demoChatId = chatId || 2;
      const demoChat = demoChats.find(c => c.id === demoChatId) || demoChats[0];
      setCurrentChat(demoChat);
      
      // Create demo messages
      const demoMessages: Message[] = [
        {
          id: 1,
          chatId: demoChat.id,
          role: "user",
          content: "I'm trying to get better code generation from Claude. What are some best practices for prompting LLMs to write high-quality code?",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isEdited: false,
          metadata: {}
        },
        {
          id: 2,
          chatId: demoChat.id,
          role: "assistant",
          content: "Here are some best practices for getting high-quality code generation from LLMs like me:\n\n1. **Be specific about requirements:** Clearly state what the code should accomplish, inputs, outputs, and any constraints.\n\n2. **Specify language and version:** Explicitly mention the programming language and version (e.g., \"Python 3.9\" rather than just \"Python\").\n\n3. **Request code style:** Mention if you prefer a particular coding style, pattern, or paradigm.\n\n4. **Ask for documentation:** Request inline comments or docstrings to explain the code.\n\n5. **Request error handling:** Explicitly ask for proper error handling and edge case management.\n\nWould you like me to provide an example of a well-structured prompt for code generation?",
          timestamp: new Date(Date.now() - 58 * 60 * 1000),
          isEdited: false,
          metadata: {}
        },
        {
          id: 3,
          chatId: demoChat.id,
          role: "user",
          content: "Yes, please show me an example of a good prompt for generating code. Also, what are some common pitfalls to avoid?",
          timestamp: new Date(Date.now() - 56 * 60 * 1000),
          isEdited: false,
          metadata: {}
        },
        {
          id: 4,
          chatId: demoChat.id,
          role: "assistant",
          content: "Here's an example of a well-structured prompt for code generation:\n\n```\n\"Please write a Python 3.10 function that validates an email address. The function should:\n\n1. Accept a string input representing an email address\n2. Return True if the email is valid, False otherwise\n3. Use regex for validation with these rules:\n   - Must contain a single @ symbol\n   - Username part can contain letters, numbers, dots, underscores\n   - Domain must have at least one dot\n   - Top-level domain must be 2-6 characters\n4. Include proper error handling for edge cases (null input, non-string input)\n5. Include docstrings and type hints\n6. Include 3-4 test cases demonstrating the function's behavior\"\n```\n\nNow for common pitfalls to avoid when prompting for code:\n\n1. **Being too vague:** \"Write code to handle user authentication\" is less effective than specifying the exact requirements.\n\n2. **Ignoring context:** Not mentioning existing code or systems the new code needs to integrate with.\n\n3. **Overlooking error handling:** Not explicitly requesting robust error handling leads to brittle code.\n\n4. **Not specifying performance considerations:** If efficiency matters, mention it.\n\n5. **Forgetting to ask for tests:** Request unit tests to ensure code correctness.\n\nWould you like me to demonstrate by generating a code sample based on a well-structured prompt?",
          timestamp: new Date(Date.now() - 52 * 60 * 1000),
          isEdited: false,
          metadata: {}
        }
      ];
      
      setMessages(demoMessages);
    }
  }, [loading, currentChat, chats, chatId, projectId]);
  
  // Function to refresh the chat data
  const refreshChat = async () => {
    try {
      const chatResponse = await fetch(`/api/chats/${chatId}`, {
        credentials: "include"
      });
      
      if (!chatResponse.ok) {
        throw new Error("Failed to refresh chat");
      }
      
      const chatData = await chatResponse.json();
      setCurrentChat(chatData.chat);
      setMessages(chatData.messages || []);
      
      // Invalidate queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}`] });
    } catch (error) {
      console.error("Error refreshing chat:", error);
      toast({
        title: "Error",
        description: "Failed to refresh chat data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-gray-200 bg-white animate-pulse"></div>
        <div className="flex-1 flex flex-col bg-white"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-500 mb-4">The project you are looking for does not exist or you don't have access to it.</p>
          <Link href="/">
            <Button>Go back to home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!currentChat) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <ChatList 
          chats={chats}
          projectId={projectId}
          onImportChat={() => setImportChatOpen(true)}
        />
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat not found</h2>
            <p className="text-gray-500 mb-4">The chat you are looking for does not exist or you don't have access to it.</p>
            <Link href={`/project/${projectId}`}>
              <Button>Go back to project</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex overflow-hidden">
      <ChatList 
        chats={chats}
        selectedChatId={chatId}
        projectId={projectId}
        onImportChat={() => setImportChatOpen(true)}
      />
      
      <ChatView
        chat={currentChat}
        messages={messages}
        onRefresh={refreshChat}
      />
      
      <ImportChatModal
        isOpen={importChatOpen}
        onClose={() => setImportChatOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
