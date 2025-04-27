import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChatWithTags } from "@/lib/types";
import { cn, formatRelativeTime, formatTime, getProviderIcon, getProviderName, getTagColor, truncateText } from "@/lib/utils";
import { listItem, staggerContainer } from "@/lib/framer-animations";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface ChatListProps {
  chats: ChatWithTags[];
  selectedChatId?: number;
  projectId: number;
  onImportChat: () => void;
  isLoading?: boolean;
}

export function ChatList({ 
  chats, 
  selectedChatId, 
  projectId, 
  onImportChat,
  isLoading = false 
}: ChatListProps) {
  if (isLoading) {
    return (
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Chats</h2>
          <Button 
            size="icon" 
            variant="ghost"
            className="text-secondary"
            onClick={onImportChat}
          >
            <PlusIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Loading skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 border-b border-gray-100 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="w-3/4">
                  <div className="h-5 bg-gray-200 rounded-md w-full mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-2"></div>
                </div>
                <div className="w-1/4 flex flex-col items-end">
                  <div className="h-3 bg-gray-100 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-100 rounded-md w-full mt-2"></div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t border-gray-200">
          <Button 
            className="w-full flex items-center justify-center py-2"
            variant="outline"
            onClick={onImportChat}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            <span>Import Chat</span>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Chats</h2>
        <Button 
          size="icon" 
          variant="ghost"
          className="text-secondary"
          onClick={onImportChat}
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
      
      <motion.div 
        className="flex-1 overflow-y-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatListItem 
              key={chat.id} 
              chat={chat} 
              isSelected={chat.id === selectedChatId} 
              projectId={projectId}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mb-2">No chats yet</p>
            <p className="text-sm text-gray-400">
              Import your first chat conversation to get started
            </p>
          </div>
        )}
      </motion.div>
      
      <div className="p-3 border-t border-gray-200">
        <Button 
          className="w-full flex items-center justify-center py-2"
          variant="outline"
          onClick={onImportChat}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>Import Chat</span>
        </Button>
      </div>
    </div>
  );
}

interface ChatListItemProps {
  chat: ChatWithTags;
  isSelected: boolean;
  projectId: number;
}

function ChatListItem({ chat, isSelected, projectId }: ChatListItemProps) {
  const providerIcon = getProviderIcon(chat.provider as any);
  const providerName = getProviderName(chat.provider as any);
  
  return (
    <motion.div
      variants={listItem}
      className={cn(
        "p-3 border-b border-gray-100 cursor-pointer transition-colors",
        isSelected ? "bg-highlight/10" : "hover:bg-gray-50"
      )}
    >
      <div 
        className="block cursor-pointer" 
        onClick={() => window.location.href = `/project/${projectId}/chat/${chat.id}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{chat.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              <i className={cn(providerIcon, "mr-1 inline-block")}></i>
              {providerName} • {formatRelativeTime(chat.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">{formatTime(chat.updatedAt)}</span>
            {chat.tags && chat.tags.length > 0 && (
              <div className="flex mt-1 gap-1.5 flex-wrap justify-end">
                {chat.tags.slice(0, 2).map((tag) => (
                  <span 
                    key={tag.id} 
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs font-medium",
                      getTagColor(tag.name)
                    )}
                  >
                    {tag.name}
                  </span>
                ))}
                {chat.tags.length > 2 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">
                    +{chat.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {chat.summary ? truncateText(chat.summary, 120) : "No summary available"}
        </p>
      </div>
    </motion.div>
  );
}

export default ChatList;
