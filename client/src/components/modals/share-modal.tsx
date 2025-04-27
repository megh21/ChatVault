import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { modalVariants } from "@/lib/framer-animations";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, CheckCheck, UserPlus } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId?: number;
  entityType?: "workspace" | "project";
  entityName?: string;
}

interface Collaborator {
  id: number;
  name: string;
  email: string;
  permission: "view" | "edit" | "admin";
  avatarUrl?: string;
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  entityId = 1, 
  entityType = "workspace", 
  entityName = "AI Research" 
}: ShareModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit" | "admin">("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock collaborators for display purposes
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      permission: "edit",
      avatarUrl: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 2,
      name: "Michael Davis",
      email: "michael@example.com",
      permission: "view",
      avatarUrl: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ]);
  
  const handleClose = () => {
    onClose();
    // Reset form state after modal closes with a slight delay
    setTimeout(() => {
      setEmail("");
      setPermission("view");
      setIsSubmitting(false);
    }, 300);
  };
  
  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the API
      await apiRequest("POST", "/api/collaborators", {
        entityId,
        entityType,
        email,
        permission
      });
      
      // Add the new collaborator to the list (for demo purposes)
      const newCollaborator: Collaborator = {
        id: Date.now(),
        name: email.split('@')[0],
        email,
        permission,
        avatarUrl: undefined
      };
      
      setCollaborators([...collaborators, newCollaborator]);
      
      toast({
        title: "Invitation sent",
        description: `${email} has been invited to collaborate.`
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Failed to share",
        description: "There was an error sharing this item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const removeCollaborator = (id: number) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
    toast({
      title: "Collaborator removed",
      description: "The collaborator has been removed successfully."
    });
  };
  
  const updateCollaboratorPermission = (id: number, newPermission: "view" | "edit" | "admin") => {
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, permission: newPermission } : c
    ));
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
            <DialogTitle>Share {entityType}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  {entityName}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="emailInput" className="block text-sm font-medium text-gray-700 mb-1">
                Invite people by email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="emailInput"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary/90 whitespace-nowrap"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !email.trim()}
                >
                  {isSubmitting ? "Inviting..." : "Invite"}
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Permission level
              </Label>
              <RadioGroup
                value={permission}
                onValueChange={(value) => setPermission(value as "view" | "edit" | "admin")}
                className="flex flex-col gap-2"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="view" id="viewPermission" className="mt-1" />
                  <div>
                    <Label htmlFor="viewPermission" className="font-medium">View only</Label>
                    <p className="text-xs text-gray-500">Can view but not edit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="edit" id="editPermission" className="mt-1" />
                  <div>
                    <Label htmlFor="editPermission" className="font-medium">Can edit</Label>
                    <p className="text-xs text-gray-500">Can view and edit, but not manage access</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="admin" id="adminPermission" className="mt-1" />
                  <div>
                    <Label htmlFor="adminPermission" className="font-medium">Admin</Label>
                    <p className="text-xs text-gray-500">Full access including managing collaborators</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  People with access
                </Label>
                <span className="text-xs text-gray-500">
                  {collaborators.length} collaborators
                </span>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {collaborator.avatarUrl ? (
                          <AvatarImage src={collaborator.avatarUrl} alt={collaborator.name} />
                        ) : (
                          <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium">{collaborator.name}</h4>
                        <p className="text-xs text-gray-500">{collaborator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={collaborator.permission}
                        onChange={(e) => updateCollaboratorPermission(
                          collaborator.id, 
                          e.target.value as "view" | "edit" | "admin"
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={() => removeCollaborator(collaborator.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <UserPlus className="h-4 w-4 mr-1" />
              <span>Share link coming soon</span>
            </div>
            <Button
              type="button"
              onClick={handleClose}
              className="bg-secondary text-white hover:bg-secondary/90"
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Done
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Simple select component for collaborator permissions
function Select({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="text-xs border border-gray-300 rounded-md p-1 bg-transparent"
    >
      <option value="view">View</option>
      <option value="edit">Edit</option>
      <option value="admin">Admin</option>
    </select>
  );
}

export default ShareModal;
