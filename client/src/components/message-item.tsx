import React, { useState } from "react";
import { motion } from "framer-motion";
import { Message } from "@shared/schema";
import { cn, formatTime } from "@/lib/utils";
import { slideUp } from "@/lib/framer-animations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Edit, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface MessageItemProps {
  message: Message;
  onEditSuccess: () => void;
}

export function MessageItem({ message, onEditSuccess }: MessageItemProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const isUser = message.role === "user";
  const messageClassName = isUser ? "user-message" : "ai-message";
  const bgClassName = isUser ? "bg-accent/10" : "bg-secondary/5";
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };
  
  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;
    
    setIsSaving(true);
    try {
      await apiRequest("PATCH", `/api/messages/${message.id}`, {
        content: editedContent
      });
      
      setIsEditing(false);
      onEditSuccess();
      toast({
        title: "Message updated",
        description: "Your changes have been saved."
      });
    } catch (error) {
      toast({
        title: "Failed to update message",
        description: "Could not save your changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied."
    });
  };
  
  return (
    <motion.div
      className={cn("pl-4 py-0.5", messageClassName)}
      initial="hidden"
      animate="visible"
      variants={slideUp}
    >
      <div className="flex items-start">
        <div className={cn("rounded-md p-4 w-full", bgClassName)}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800">
              {isUser ? "You" : message.metadata?.modelName || "Assistant"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
                {message.isEdited && " (edited)"}
              </span>
              
              {!isEditing && (
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-600"
                    onClick={handleCopyContent}
                    title="Copy content"
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-600"
                    onClick={handleEdit}
                    title="Edit message"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px] text-gray-700 border-gray-300 focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Cancel
                </Button>
                
                <Button
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-white"
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editedContent.trim()}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                  {!isSaving && <Check className="ml-1 h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 prose prose-sm max-w-none">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MessageItem;
