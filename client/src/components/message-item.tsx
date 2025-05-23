import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Message } from "@shared/schema";
import { cn, formatTime } from "@/lib/utils";
import { slideUp } from "@/lib/framer-animations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Edit, X, AlignLeft, Image, Link as LinkIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface MessageItemProps {
  message: Message;
  onEditSuccess: () => void;
  isLastItem?: boolean;
}

export function MessageItem({ message, onEditSuccess, isLastItem = false }: MessageItemProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Determine content type and styling
  const isUser = message.role === "user";
  const authorText = isUser ? "You" : "Content";
  
  // Auto-adjust textarea height for the Google Docs-like editing experience
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedContent]);
  
  // Handle edit mode activation
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
    // Focus after a brief delay to allow the DOM to update
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        // Set cursor at end - different handling for contentEditable
        const range = document.createRange();
        const sel = window.getSelection();
        if (editorRef.current.childNodes.length > 0) {
          const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
          range.setStart(lastNode, lastNode.textContent?.length || 0);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }, 50);
  };
  
  // Handle edit cancellation
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };
  
  // Handle saving edits
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
        title: "Content updated",
        description: "Your changes have been saved."
      });
    } catch (error) {
      toast({
        title: "Failed to update content",
        description: "Could not save your changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle copying content
  const handleCopyContent = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied."
    });
  };
  
  // Auto-save on keyboard shortcut (Ctrl+S or Cmd+S)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (isEditing && editedContent.trim()) {
        handleSaveEdit();
      }
    }
  };
  
  return (
    <motion.div
      className={cn(
        "py-3 document-section", 
        isUser ? "" : "border-b border-gray-100",
        isLastItem ? "mb-12" : "mb-4"
      )}
      initial="hidden"
      animate="visible"
      variants={slideUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isEditing && (
        <div className={cn(
          "absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white text-gray-500 hover:text-gray-700 rounded-full shadow-sm"
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
            className="h-7 w-7 bg-white text-gray-500 hover:text-gray-700 rounded-full shadow-sm"
            onClick={handleEdit}
            title="Edit content"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      
      {/* Small indicator for content author - subtle and out of the way */}
      <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
        <span>{authorText}</span>
        {message.isEdited && (
          <span className="text-xs italic">Edited {formatTime(message.lastEditedAt || message.timestamp)}</span>
        )}
      </div>
      
      {/* The content is always visible, but when editing we show a content-editable version */}
      <div className="relative">
        {isEditing ? (
          <>
            {/* Editable content - directly editing in the document */}
            <div 
              className="min-h-[100px] text-gray-800 prose prose-lg max-w-none leading-relaxed p-4 focus:outline-none border-l-2 border-blue-400 pl-4 bg-blue-50/30"
              ref={editorRef as any}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={(e) => setEditedContent(e.currentTarget.innerText)}
              dangerouslySetInnerHTML={{ __html: editedContent }}
              onKeyDown={handleKeyDown}
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            />
            
            {/* Floating toolbar that follows as you scroll */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-1 flex items-center gap-1 sticky top-2 z-10 w-fit mx-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-md"
                title="Text formatting"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-md"
                title="Insert image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-md"
                title="Insert link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <div className="h-5 border-r border-gray-300 mx-1"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleSaveEdit}
                disabled={isSaving || !editedContent.trim()}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        ) : (
          <div 
            className="text-gray-800 prose prose-lg max-w-none leading-relaxed cursor-text"
            onClick={handleEdit} // Click anywhere to start editing
          >
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageItem;
