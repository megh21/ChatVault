import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { fadeIn } from "@/lib/framer-animations";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ImportChatModal } from "@/components/modals/import-chat-modal";
import { ShareModal } from "@/components/modals/share-modal";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { WorkspaceWithProjects } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);
  
  // Modal states
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [importChatOpen, setImportChatOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Fetch workspaces
  const [workspaces, setWorkspaces] = useState<WorkspaceWithProjects[]>([]);
  
  useEffect(() => {
    // Parse the location to extract workspace/project ID
    const workspaceMatch = location.match(/\/workspace\/(\d+)/);
    if (workspaceMatch) {
      setActiveWorkspaceId(parseInt(workspaceMatch[1]));
    }
    
    // Set mobile state based on window size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [location]);
  
  // Fetch workspaces when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchWorkspaces = async () => {
        try {
          const response = await fetch("/api/workspaces", {
            credentials: "include"
          });
          
          if (response.ok) {
            const data = await response.json();
            setWorkspaces(data.workspaces || []);
          }
        } catch (error) {
          console.error("Failed to fetch workspaces:", error);
        }
      };
      
      fetchWorkspaces();
    }
  }, [isAuthenticated]);
  
  // Simulated workspaces for preview
  useEffect(() => {
    if (workspaces.length === 0 && isAuthenticated) {
      setWorkspaces([
        {
          id: 1,
          name: "AI Research",
          description: "Research on various AI models and techniques",
          color: "accent",
          privacy: "private",
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          projects: [
            {
              id: 1,
              name: "GPT-4 Experiments",
              workspaceId: 1,
              userId: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 2,
              name: "Claude vs ChatGPT",
              workspaceId: 1,
              userId: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        {
          id: 2,
          name: "Product Development",
          description: "Product-related AI conversations",
          color: "secondary",
          privacy: "private",
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          projects: [
            {
              id: 3,
              name: "Feature Planning",
              workspaceId: 2,
              userId: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        {
          id: 3,
          name: "Creative Writing",
          description: "AI-assisted creative writing projects",
          color: "highlight",
          privacy: "private",
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          projects: []
        }
      ]);
    }
  }, [isAuthenticated, workspaces.length]);
  
  const handleCreateWorkspace = () => {
    setCreateWorkspaceOpen(true);
  };
  
  const handleCreateProject = () => {
    setCreateProjectOpen(true);
  };
  
  // If the user is not authenticated and not loading, show login page
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full bg-white rounded-lg shadow-md p-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <svg className="w-10 h-10 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2L4 17.2V4H20V16Z"></path>
                <path d="M8 9H16V11H8V9ZM8 6H16V8H8V6ZM8 12H14V14H8V12Z"></path>
              </svg>
              <span className="ml-2 font-display font-bold text-2xl text-primary">ChatArchive</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign in to get started</h2>
          
          <p className="text-center text-gray-600 mb-6">
            Organize and share your LLM conversations with a beautiful, interactive interface.
          </p>
          
          <div className="flex justify-center">
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white flex items-center gap-2 py-6"
              onClick={() => login("mock-credential")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        workspaces={workspaces}
        onCreateWorkspace={handleCreateWorkspace}
        onCreateProject={handleCreateProject}
        user={user}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 py-2 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="ml-2">Menu</span>
            </Button>
          </div>
        )}
        
        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            className="flex-1 flex flex-col"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <CreateWorkspaceModal 
        isOpen={createWorkspaceOpen} 
        onClose={() => setCreateWorkspaceOpen(false)}
        onSuccess={(workspace) => {
          // Add the new workspace to the list
          setWorkspaces(prev => [...prev, {...workspace, projects: []}]);
          setCreateWorkspaceOpen(false);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['/api/workspaces'] });
        }}
      />
      
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSuccess={(project) => {
          // Add the new project to the appropriate workspace
          setWorkspaces(prev => 
            prev.map(workspace => 
              workspace.id === project.workspaceId 
                ? {
                    ...workspace,
                    projects: [...(workspace.projects || []), project]
                  }
                : workspace
            )
          );
          setCreateProjectOpen(false);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ 
            queryKey: [`/api/workspaces/${project.workspaceId}/projects`] 
          });
        }}
      />
      
      <ImportChatModal
        isOpen={importChatOpen}
        onClose={() => setImportChatOpen(false)}
      />
      
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}

export default Layout;
