import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Chat, Message, Tag } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime, getProviderIcon, getProviderName, getTagColor } from "@/lib/utils";
import { fadeIn } from "@/lib/framer-animations";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import MessageItem from "@/components/message-item";
import { 
  Clock, 
  Download, 
  Edit, 
  MoreHorizontal, 
  Plus
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatViewProps {
  chat: Chat & { tags: Tag[] };
  messages: Message[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function ChatView({ chat, messages, onRefresh, isLoading = false }: ChatViewProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Chat Header Skeleton */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-2 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded-md w-2/5"></div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-5 bg-gray-200 rounded-md w-24"></div>
            <div className="h-5 bg-gray-200 rounded-md w-40"></div>
            <div className="h-5 bg-gray-200 rounded-md w-32"></div>
            
            <div className="flex items-center gap-1 ml-auto">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
          </div>
        </div>
        
        {/* Summary Skeleton */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded-md w-24 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded-md w-full"></div>
          <div className="h-4 bg-gray-100 rounded-md w-3/4 mt-2"></div>
        </div>
        
        {/* Message Skeletons */}
        <div className="flex-1 px-6 py-4 space-y-6">
          <div className="pl-4 py-0.5">
            <div className="rounded-md p-4 w-full bg-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 bg-gray-200 rounded-md w-20"></div>
                <div className="h-3 bg-gray-200 rounded-md w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
              </div>
            </div>
          </div>
          
          <div className="pl-4 py-0.5">
            <div className="rounded-md p-4 w-full bg-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 bg-gray-200 rounded-md w-20"></div>
                <div className="h-3 bg-gray-200 rounded-md w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="flex-none px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-gray-900">{chat.title}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center text-gray-500 gap-1">
            <i className={getProviderIcon(chat.provider as any) + " text-base"}></i>
            <span>{getProviderName(chat.provider as any)}</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center text-gray-500 gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDateTime(chat.createdAt)}</span>
          </div>
          
          {chat.updatedAt && chat.updatedAt !== chat.createdAt && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center text-gray-500 gap-1">
                <Edit className="h-4 w-4" />
                <span>Last edited: {formatDateTime(chat.updatedAt)}</span>
              </div>
            </>
          )}
          
          <div className="flex items-center gap-1 ml-auto">
            {chat.tags && chat.tags.map((tag: Tag) => (
              <span
                key={tag.id}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.name)}`}
              >
                {tag.name}
              </span>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-1 text-gray-400 hover:text-gray-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Summary */}
      {chat.summary && (
        <div className="flex-none px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Summary</h3>
          <p className="text-sm text-gray-600">{chat.summary}</p>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 min-h-full">
          <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-md p-6 mb-12">
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                onEditSuccess={onRefresh}
                isLastItem={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button
          className="rounded-full h-14 w-14 bg-secondary text-white hover:bg-secondary/90 shadow-md flex items-center justify-center"
          onClick={async () => {
            try {
              await apiRequest("POST", `/api/chats/${chat.id}/messages`, {
                role: "user",
                content: "New section"
              });
              
              onRefresh();
              toast({
                title: "Section added",
                description: "A new section has been added to the document. Click on it to edit.",
              });
              
              setTimeout(() => {
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }, 100);
            } catch (error) {
              toast({
                title: "Failed to add section",
                description: "There was a problem adding a new section.",
                variant: "destructive"
              });
            }
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default ChatView;