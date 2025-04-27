import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { slideInLeft, staggerContainer, listItem } from "@/lib/framer-animations";
import { PlusIcon, HomeIcon, SearchIcon, StarIcon, ClockIcon, FolderIcon, SettingsIcon, MessageCircleIcon } from "lucide-react";
import { WorkspaceWithProjects } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  workspaces: WorkspaceWithProjects[];
  onCreateWorkspace: () => void;
  onCreateProject: () => void;
  user: {
    displayName?: string;
    email: string;
    avatarUrl?: string;
  } | null;
}

export function Sidebar({
  isOpen,
  onCloseMobile,
  workspaces,
  onCreateWorkspace,
  onCreateProject,
  user
}: SidebarProps) {
  const [location] = useLocation();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [activeSection, setActiveSection] = useState<string>("navigation");
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className={cn(
            "flex flex-col w-64 bg-primary text-white h-full border-r border-gray-200",
            isMobile ? "fixed inset-y-0 left-0 z-50" : "hidden md:flex"
          )}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={slideInLeft}
        >
          {/* Logo */}
          <div className="p-4 border-b border-primary/20 flex items-center">
            <MessageCircleIcon className="w-6 h-6 text-accent" />
            <span className="ml-2 font-display font-bold text-lg">ChatArchive</span>
          </div>
          
          {/* User Profile */}
          {user && (
            <div className="p-4 border-b border-primary/20 flex items-center">
              <div className="w-8 h-8 rounded-full border-2 border-accent bg-gray-300 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-primary">
                    {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm font-semibold">{user.displayName || "User"}</p>
                <p className="text-xs text-gray-300">{user.email}</p>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <ScrollArea className="flex-1 p-2">
            <motion.div
              className="mb-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-3 py-2">
                Navigation
              </h3>
              <motion.ul variants={staggerContainer}>
                <motion.li variants={listItem}>
                  <Link href="/">
                    <a className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                      location === "/" 
                        ? "bg-primary/20 font-medium" 
                        : "text-gray-300 hover:bg-primary/20"
                    )}>
                      <HomeIcon className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </a>
                  </Link>
                </motion.li>
                <motion.li variants={listItem}>
                  <Link href="/search">
                    <a className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md mt-1 transition-colors",
                      location === "/search" 
                        ? "bg-primary/20 font-medium" 
                        : "text-gray-300 hover:bg-primary/20"
                    )}>
                      <SearchIcon className="mr-2 h-4 w-4" />
                      <span>Search</span>
                    </a>
                  </Link>
                </motion.li>
                <motion.li variants={listItem}>
                  <Link href="/favorites">
                    <a className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md mt-1 transition-colors",
                      location === "/favorites" 
                        ? "bg-primary/20 font-medium" 
                        : "text-gray-300 hover:bg-primary/20"
                    )}>
                      <StarIcon className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </a>
                  </Link>
                </motion.li>
                <motion.li variants={listItem}>
                  <Link href="/recent">
                    <a className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md mt-1 transition-colors",
                      location === "/recent" 
                        ? "bg-primary/20 font-medium" 
                        : "text-gray-300 hover:bg-primary/20"
                    )}>
                      <ClockIcon className="mr-2 h-4 w-4" />
                      <span>Recent</span>
                    </a>
                  </Link>
                </motion.li>
              </motion.ul>
            </motion.div>
            
            <Separator className="my-4 bg-primary/20" />
            
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Workspaces
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={onCreateWorkspace}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <motion.div 
                className="space-y-1"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {workspaces.map((workspace) => (
                  <motion.div 
                    key={workspace.id}
                    variants={listItem}
                    className="px-3 py-2 text-sm hover:bg-primary/20 rounded-md cursor-pointer transition-colors"
                  >
                    <Link href={`/workspace/${workspace.id}`}>
                      <a className="flex items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          workspace.color === "accent" && "bg-accent",
                          workspace.color === "secondary" && "bg-secondary",
                          workspace.color === "highlight" && "bg-highlight",
                          workspace.color === "neutralLight" && "bg-neutral-light",
                          workspace.color === "neutralDark" && "bg-neutral-dark",
                          workspace.color === "primary" && "bg-primary/60"
                        )}></div>
                        <span className="truncate">{workspace.name}</span>
                      </a>
                    </Link>
                  </motion.div>
                ))}
                
                {workspaces.length === 0 && (
                  <motion.div variants={listItem} className="text-xs text-gray-400 px-3 py-2">
                    No workspaces yet
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            <div>
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Projects
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={onCreateProject}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <motion.div 
                className="space-y-1"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {workspaces.flatMap(workspace => 
                  (workspace.projects || []).map(project => (
                    <motion.div 
                      key={project.id}
                      variants={listItem}
                      className="px-3 py-2 text-sm hover:bg-primary/20 rounded-md cursor-pointer transition-colors"
                    >
                      <Link href={`/project/${project.id}`}>
                        <a className="flex items-center">
                          <FolderIcon className="mr-2 h-4 w-4 text-neutral-light" />
                          <span className="truncate">{project.name}</span>
                        </a>
                      </Link>
                    </motion.div>
                  ))
                )}
                
                {workspaces.every(w => !w.projects || w.projects.length === 0) && (
                  <motion.div variants={listItem} className="text-xs text-gray-400 px-3 py-2">
                    No projects yet
                  </motion.div>
                )}
              </motion.div>
            </div>
          </ScrollArea>
          
          {/* Settings */}
          <div className="p-4 border-t border-primary/20">
            <a 
              href="#" 
              className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Settings functionality would go here
              }}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
