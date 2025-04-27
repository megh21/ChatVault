import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Workspace } from "@shared/schema";
import { cn } from "@/lib/utils";
import { FolderIcon, UsersIcon, CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { pop } from "@/lib/framer-animations";

interface WorkspaceCardProps {
  workspace: Workspace;
  projectCount: number;
}

export function WorkspaceCard({ workspace, projectCount }: WorkspaceCardProps) {
  // Color mapping function
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; hover: string }> = {
      accent: { 
        bg: "bg-accent/5", 
        border: "border-accent/20", 
        hover: "hover:border-accent/50" 
      },
      secondary: { 
        bg: "bg-secondary/5", 
        border: "border-secondary/20", 
        hover: "hover:border-secondary/50" 
      },
      highlight: { 
        bg: "bg-highlight/20", 
        border: "border-highlight/30", 
        hover: "hover:border-highlight/70" 
      },
      neutralLight: { 
        bg: "bg-neutral-light/10", 
        border: "border-neutral-light/20", 
        hover: "hover:border-neutral-light/50" 
      },
      neutralDark: { 
        bg: "bg-neutral-dark/5", 
        border: "border-neutral-dark/20", 
        hover: "hover:border-neutral-dark/50" 
      },
      primary: { 
        bg: "bg-primary/5", 
        border: "border-primary/20", 
        hover: "hover:border-primary/50" 
      }
    };
    
    return colorMap[color] || colorMap.accent;
  };
  
  const colorClasses = getColorClasses(workspace.color);
  
  return (
    <Link href={`/workspace/${workspace.id}`}>
      <motion.div
        className={cn(
          "rounded-lg border shadow-sm transition-all duration-200 cursor-pointer",
          "hover:shadow-md overflow-hidden",
          colorClasses.bg,
          colorClasses.border,
          colorClasses.hover
        )}
        variants={pop}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <div className="p-5">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              workspace.color === "accent" && "bg-accent",
              workspace.color === "secondary" && "bg-secondary",
              workspace.color === "highlight" && "bg-highlight",
              workspace.color === "neutralLight" && "bg-neutral-light",
              workspace.color === "neutralDark" && "bg-neutral-dark",
              workspace.color === "primary" && "bg-primary"
            )} />
            <h3 className="font-semibold text-lg">{workspace.name}</h3>
          </div>
          
          {workspace.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {workspace.description}
            </p>
          )}
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FolderIcon className="h-4 w-4 mr-1 text-gray-400" />
                <span>{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                <span>{workspace.privacy === "private" ? "Private" : "Shared"}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-400 flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>Created {formatDate(workspace.createdAt)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default WorkspaceCard;
