import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, listItem } from "@/lib/framer-animations";
import { SearchIcon, FilterIcon, Loader2Icon, MessageCircleIcon } from "lucide-react";
import { formatDate, formatRelativeTime, getProviderIcon, getProviderName, getTagColor } from "@/lib/utils";
import { ChatWithTags } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

export default function Search() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatWithTags[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) {
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Search failed");
      }
      
      const data = await response.json();
      setSearchResults(data.chats || []);
      
      if (data.chats.length === 0) {
        toast({
          title: "No results found",
          description: `No chats match "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Could not perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Demo data for initial UI display
  useEffect(() => {
    if (!hasSearched && searchQuery === "") {
      // This is just to populate the UI initially - not used for actual search
      setSearchResults([
        {
          id: 1,
          title: "Advanced Prompt Engineering Techniques",
          summary: "Discussion about advanced prompt engineering techniques like chain-of-thought, few-shot learning, and persona setting for better results.",
          provider: "chatgpt",
          projectId: 1,
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
          projectId: 1,
          userId: 1,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lastViewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: [
            { id: 2, name: "code", userId: 1, chatId: 2, createdAt: new Date() },
            { id: 3, name: "guide", userId: 1, chatId: 2, createdAt: new Date() }
          ]
        },
        {
          id: 3,
          title: "Grok vs GPT-4 Comparison",
          summary: "Side-by-side evaluation of Grok and GPT-4 on various tasks including coding, reasoning, and creative writing.",
          provider: "other",
          projectId: 2,
          userId: 1,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastViewed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          tags: [
            { id: 4, name: "comparison", userId: 1, chatId: 3, createdAt: new Date() }
          ]
        }
      ]);
    }
  }, [hasSearched, searchQuery]);
  
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-display mb-6">Search</h1>
          
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <Input
                placeholder="Search chats by title, content, or tags..."
                className="pl-10 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90 text-white py-6 px-8"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="py-6 px-3"
              title="Advanced filters"
            >
              <FilterIcon className="h-5 w-5" />
            </Button>
          </form>
        </div>
        
        {/* Search Results */}
        {hasSearched && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {isSearching ? (
                "Searching..."
              ) : (
                `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
              )}
            </h2>
          </div>
        )}
        
        {!isSearching && (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {searchResults.length > 0 ? (
              searchResults.map((chat) => (
                <SearchResultCard key={chat.id} chat={chat} />
              ))
            ) : hasSearched ? (
              <div className="text-center py-12 border rounded-lg">
                <div className="bg-gray-100 rounded-full p-5 inline-block mb-4">
                  <SearchIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">No results found</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  No chats match your search criteria. Try using different keywords or filters.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <div className="bg-gray-100 rounded-full p-5 inline-block mb-4">
                  <SearchIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Search across your chats</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Use the search bar above to find chats by title, content, or tags.
                </p>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Recent Searches - Optional Section */}
        {!hasSearched && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("prompt engineering");
                  handleSearch();
                }}
              >
                prompt engineering
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("code generation");
                  handleSearch();
                }}
              >
                code generation
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("comparison");
                  handleSearch();
                }}
              >
                comparison
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  chat: ChatWithTags;
}

function SearchResultCard({ chat }: SearchResultCardProps) {
  const providerIcon = getProviderIcon(chat.provider as any);
  const providerName = getProviderName(chat.provider as any);
  
  return (
    <motion.div
      variants={listItem}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onClick={() => window.location.href = `/project/${chat.projectId}/chat/${chat.id}`}
    >
      <div className="block p-5 cursor-pointer">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-gray-900">{chat.title}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <i className={`${providerIcon} mr-1`}></i>
            {providerName}
          </div>
        </div>
        
        {chat.summary && (
          <p className="mt-2 text-gray-600 text-sm line-clamp-2">{chat.summary}</p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {chat.tags.map((tag) => (
              <span 
                key={tag.id} 
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.name)}`}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(chat.updatedAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
