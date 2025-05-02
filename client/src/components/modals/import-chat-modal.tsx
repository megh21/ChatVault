import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Clipboard, MessageCircle, Bot, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { modalVariants } from "@/lib/framer-animations";
import { motion } from "framer-motion";
import { Tag } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { parseChat, generateSummary, readFileAsText } from "@/lib/utils";
import { ChatProvider } from "@shared/schema";

interface ImportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
}

export function ImportChatModal({ isOpen, onClose, projectId }: ImportChatModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [provider, setProvider] = useState<ChatProvider>("chatgpt");
  const [importMethod, setImportMethod] = useState<"paste" | "upload">("paste");
  const [chatContent, setChatContent] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClose = () => {
    onClose();
    // Reset form state after modal closes
    setTimeout(() => {
      setStep(1);
      setProvider("chatgpt");
      setImportMethod("paste");
      setChatContent("");
      setChatTitle("");
      setTags([]);
      setTagInput("");
      setIsSubmitting(false);
    }, 300);
  };
  
  const handleNext = () => {
    if (step === 1 && chatContent.trim()) {
      setStep(2);
      
      // Generate a title based on content if not provided
      if (!chatTitle) {
        const messages = parseChat(chatContent, provider);
        const firstMessage = messages[0];
        if (firstMessage) {
          // Extract a title from the first few words
          const contentWords = firstMessage.content.split(' ');
          const titlePreview = contentWords.slice(0, 5).join(' ');
          setChatTitle(titlePreview + (contentWords.length > 5 ? '...' : ''));
        }
      }
    }
  };
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        readFileAsText(file)
          .then(content => {
            setChatContent(content);
            // Try to extract a title from the filename
            const fileName = file.name.replace(/\.(md|txt)$/, '');
            setChatTitle(fileName);
          })
          .catch(error => {
            toast({
              title: "Error reading file",
              description: "Could not read the file content. Please try again.",
              variant: "destructive"
            });
          });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .md file.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        readFileAsText(file)
          .then(content => {
            setChatContent(content);
            // Try to extract a title from the filename
            const fileName = file.name.replace(/\.(md|txt)$/, '');
            setChatTitle(fileName);
          })
          .catch(error => {
            toast({
              title: "Error reading file",
              description: "Could not read the file content. Please try again.",
              variant: "destructive"
            });
          });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .md file.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!chatContent.trim() || !chatTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both chat content and a title.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse the chat content into messages
      const messages = parseChat(chatContent, provider);
      
      if (messages.length === 0) {
        throw new Error("Could not parse any messages from the provided content.");
      }
      
      // Generate a summary based on the messages
      const summary = generateSummary(messages);
      
      // Create the chat with messages
      const response = await fetch(`/api/projects/${projectId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: chatTitle,
          summary,
          provider,
          tags,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            metadata: {
              timestamp: msg.timestamp
            }
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to import chat: ${response.statusText}`);
      }
      
      // Success! Close the modal and show a success message
      toast({
        title: "Chat imported successfully",
        description: `"${chatTitle}" has been added to your project.`,
      });
      
      // Invalidate queries to refresh the data
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/chats`] });
      }
      
      handleClose();
    } catch (error) {
      console.error("Error importing chat:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Could not import chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalVariants}
        >
          <DialogHeader>
            <DialogTitle>Import Chat</DialogTitle>
            <DialogDescription>
              Import your chat conversations from various AI assistants.
            </DialogDescription>
          </DialogHeader>
          
          {step === 1 && (
            <div className="py-4">
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-1">Chat Source</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "px-3 py-2 flex-1",
                      provider === "chatgpt" && "bg-secondary/10 border-secondary text-secondary"
                    )}
                    onClick={() => setProvider("chatgpt")}
                  >
                    <div className="flex items-center justify-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>ChatGPT</span>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "px-3 py-2 flex-1",
                      provider === "claude" && "bg-secondary/10 border-secondary text-secondary"
                    )}
                    onClick={() => setProvider("claude")}
                  >
                    <div className="flex items-center justify-center">
                      <Bot className="mr-2 h-4 w-4" />
                      <span>Claude</span>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "px-3 py-2 flex-1",
                      provider === "grok" && "bg-secondary/10 border-secondary text-secondary"
                    )}
                    onClick={() => setProvider("grok")}
                  >
                    <div className="flex items-center justify-center">
                      <Cpu className="mr-2 h-4 w-4" />
                      <span>Grok</span>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-1">Import Method</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "px-3 py-2 flex-1",
                      importMethod === "paste" && "bg-secondary/10 border-secondary text-secondary"
                    )}
                    onClick={() => setImportMethod("paste")}
                  >
                    <div className="flex items-center justify-center">
                      <Clipboard className="mr-2 h-4 w-4" />
                      <span>Paste Text</span>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "px-3 py-2 flex-1",
                      importMethod === "upload" && "bg-secondary/10 border-secondary text-secondary"
                    )}
                    onClick={() => setImportMethod("upload")}
                  >
                    <div className="flex items-center justify-center">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload File</span>
                    </div>
                  </Button>
                </div>
              </div>
              
              {importMethod === "paste" ? (
                <div className="mb-4">
                  <Label htmlFor="chatContent" className="block text-sm font-medium text-gray-700 mb-1">
                    Chat Content
                  </Label>
                  <Textarea
                    id="chatContent"
                    rows={8}
                    placeholder="Paste your conversation here..."
                    value={chatContent}
                    onChange={(e) => setChatContent(e.target.value)}
                    className="w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Chat File
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all",
                      isDragging ? "border-secondary bg-secondary/5" : "border-gray-300 hover:border-gray-400"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop a file here, or click to select a file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: .txt, .md
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {chatContent && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">File content loaded:</p>
                      <p className="truncate">{chatContent.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {step === 2 && (
            <div className="py-4">
              <div className="mb-4">
                <Label htmlFor="chatTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Chat Title
                </Label>
                <Input
                  id="chatTitle"
                  placeholder="Enter a title for this chat"
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-1">Tags</Label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-secondary/20 text-secondary font-medium flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-secondary/70 hover:text-secondary"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[100px] outline-none text-sm"
                    placeholder="Add tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or comma to add a tag
                </p>
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-1">Preview</Label>
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <p className="text-sm text-gray-700 font-medium">{chatTitle}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                    <span>•</span>
                    <span>{tags.length} tags</span>
                    <span>•</span>
                    <span>{chatContent.split('\n').length} lines</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-end gap-2">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary/90"
                  onClick={handleNext}
                  disabled={!chatContent.trim()}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary/90"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !chatTitle.trim()}
                >
                  {isSubmitting ? "Importing..." : "Import Chat"}
                </Button>
              </>
            )}
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default ImportChatModal;
