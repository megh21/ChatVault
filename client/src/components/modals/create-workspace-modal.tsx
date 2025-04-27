import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { modalVariants } from "@/lib/framer-animations";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ui/color-picker";
import { apiRequest } from "@/lib/queryClient";
import { Workspace } from "@shared/schema";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (workspace: Workspace) => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("accent");
  const [privacy, setPrivacy] = useState<"private" | "shared">("private");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleClose = () => {
    onClose();
    // Reset form state after modal closes with a slight delay
    setTimeout(() => {
      setName("");
      setDescription("");
      setColor("accent");
      setPrivacy("private");
      setIsSubmitting(false);
    }, 300);
  };
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a workspace name.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/workspaces", {
        name,
        description: description || undefined,
        color,
        privacy
      });
      
      const data = await response.json();
      
      toast({
        title: "Workspace created",
        description: `"${name}" has been created successfully.`
      });
      
      if (onSuccess) {
        onSuccess(data.workspace);
      }
      
      handleClose();
    } catch (error) {
      toast({
        title: "Failed to create workspace",
        description: "There was an error creating your workspace. Please try again.",
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
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </Label>
              <Input
                id="workspaceName"
                placeholder="Enter workspace name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="workspaceDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </Label>
              <Textarea
                id="workspaceDescription"
                rows={3}
                placeholder="Describe the purpose of this workspace"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Privacy
              </Label>
              <RadioGroup
                value={privacy}
                onValueChange={(value) => setPrivacy(value as "private" | "shared")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="privateWorkspace" />
                  <Label htmlFor="privateWorkspace">Private</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shared" id="sharedWorkspace" />
                  <Label htmlFor="sharedWorkspace">Shared</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
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
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkspaceModal;
