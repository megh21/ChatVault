import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { modalVariants } from "@/lib/framer-animations";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project, Workspace } from "@shared/schema";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
  workspaces: Workspace[];
  activeWorkspaceId: number | null;
}

export function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  workspaces, 
  activeWorkspaceId 
}: CreateProjectModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set the active workspace when the modal opens
  useEffect(() => {
    if (isOpen && activeWorkspaceId) {
      setWorkspaceId(activeWorkspaceId.toString());
    } else if (isOpen && workspaces.length > 0 && !workspaceId) {
      setWorkspaceId(workspaces[0].id.toString());
    }
  }, [isOpen, activeWorkspaceId, workspaces, workspaceId]);
  
  const handleClose = () => {
    onClose();
    // Reset form state after modal closes with a slight delay
    setTimeout(() => {
      setName("");
      setDescription("");
      // Don't reset workspace ID to preserve context
      setIsSubmitting(false);
    }, 300);
  };
  
  const handleSubmit = async () => {
    if (!name.trim() || !workspaceId) {
      toast({
        title: "Missing information",
        description: "Please provide a project name and select a workspace.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest(
        "POST", 
        `/api/workspaces/${workspaceId}/projects`, 
        {
          name,
          description: description || undefined
        }
      );
      
      const data = await response.json();
      
      toast({
        title: "Project created",
        description: `"${name}" has been created successfully.`
      });
      
      if (onSuccess) {
        onSuccess(data.project);
      }
      
      handleClose();
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
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
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </Label>
              <Textarea
                id="projectDescription"
                rows={3}
                placeholder="Describe the purpose of this project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="workspaceSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Workspace
              </Label>
              <Select
                value={workspaceId}
                onValueChange={setWorkspaceId}
              >
                <SelectTrigger id="workspaceSelect">
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id.toString()}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={isSubmitting || !name.trim() || !workspaceId}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectModal;
