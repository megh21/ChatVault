import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, Share2Icon, UsersIcon, FolderPlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, listItem } from "@/lib/framer-animations";
import { WorkspaceWithProjects, ProjectWithChats } from "@/lib/types";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ShareModal } from "@/components/modals/share-modal";
import { getWorkspaceColor, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Workspace() {
  const [, params] = useRoute("/workspace/:id");
  const workspaceId = params ? parseInt(params.id) : 0;
  
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState<WorkspaceWithProjects | null>(null);
  const [projects, setProjects] = useState<ProjectWithChats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Fetch workspace details
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        
        // Fetch workspace
        const workspaceResponse = await fetch(`/api/workspaces/${workspaceId}`, {
          credentials: "include"
        });
        
        if (!workspaceResponse.ok) {
          throw new Error("Failed to fetch workspace");
        }
        
        const workspaceData = await workspaceResponse.json();
        setWorkspace(workspaceData.workspace);
        
        // Fetch projects for this workspace
        const projectsResponse = await fetch(`/api/workspaces/${workspaceId}/projects`, {
          credentials: "include"
        });
        
        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }
        
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      } catch (error) {
        console.error("Error fetching workspace data:", error);
        toast({
          title: "Error",
          description: "Failed to load workspace. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId, toast]);
  
  // If no real data, create demo data
  useEffect(() => {
    if (!loading && !workspace) {
      const demoWorkspace: WorkspaceWithProjects = {
        id: workspaceId,
        name: "AI Research",
        description: "Research on various AI models and techniques",
        color: "accent",
        privacy: "private",
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setWorkspace(demoWorkspace);
      
      const demoProjects: ProjectWithChats[] = [
        {
          id: 1,
          name: "GPT-4 Experiments",
          description: "Testing capabilities of the GPT-4 model",
          workspaceId,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          chats: [
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
            }
          ]
        },
        {
          id: 2,
          name: "Claude vs ChatGPT",
          description: "Comparison of different LLM capabilities",
          workspaceId,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          chats: [
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
          ]
        }
      ];
      
      setProjects(demoProjects);
    }
  }, [loading, workspace, workspaceId]);
  
  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : projects;
    
  if (loading) {
    return (
      <div className="flex-1 p-6 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-8"></div>
          
          <div className="flex justify-between mb-6">
            <div className="h-10 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-1/4"></div>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-64 bg-gray-100 rounded-lg"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Workspace not found</h2>
          <p className="text-gray-500 mb-4">The workspace you are looking for does not exist or you don't have access to it.</p>
          <Link href="/">
            <Button>Go back to home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const colorClasses = getWorkspaceColor(workspace.color);
  
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Workspace Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 bg-${workspace.color}`}></div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">{workspace.name}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <Avatar className="inline-block h-8 w-8 ring-2 ring-white">
                  <AvatarImage src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <Avatar className="inline-block h-8 w-8 ring-2 ring-white">
                  <AvatarImage src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2Icon className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          
          {workspace.description && (
            <p className="text-gray-500 mb-2">{workspace.description}</p>
          )}
          
          <div className="flex items-center text-sm text-gray-500 gap-4">
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-1" />
              {workspace.privacy === "private" ? "Private" : "Shared"}
            </div>
            <div>
              Created on {formatDate(workspace.createdAt)}
            </div>
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            onClick={() => setCreateProjectOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        
        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={listItem}>
                <div 
                  onClick={() => window.location.href = `/project/${project.id}`}
                  className="block h-full cursor-pointer"
                >
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                      
                      {project.description && (
                        <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex-grow">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Chats</h4>
                        {project.chats && project.chats.length > 0 ? (
                          <div className="space-y-2">
                            {project.chats.slice(0, 2).map((chat) => (
                              <div 
                                key={chat.id} 
                                className="text-sm p-2 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <div className="font-medium truncate">{chat.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {chat.provider.charAt(0).toUpperCase() + chat.provider.slice(1)} • Last viewed {formatDate(chat.lastViewed || chat.updatedAt)}
                                </div>
                              </div>
                            ))}
                            
                            {project.chats.length > 2 && (
                              <div className="text-xs text-secondary mt-1">
                                + {project.chats.length - 2} more chats
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No chats yet</div>
                        )}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500">
                        Created on {formatDate(project.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div variants={listItem} className="min-h-[200px]">
              <Button
                variant="outline"
                className="w-full h-full border-dashed flex flex-col items-center justify-center gap-3 py-8 hover:bg-gray-50 transition-colors"
                onClick={() => setCreateProjectOpen(true)}
              >
                <div className="bg-gray-100 rounded-full p-4">
                  <PlusIcon className="h-8 w-8 text-gray-500" />
                </div>
                <span className="font-medium">Create New Project</span>
                <p className="text-gray-500 text-sm text-center max-w-[200px]">
                  Add a new project to organize chats
                </p>
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-gray-100 rounded-full p-5 mb-4">
              <FolderPlusIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Create your first project to start organizing your chats
            </p>
            <Button
              onClick={() => setCreateProjectOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaces={workspace ? [workspace] : []}
        activeWorkspaceId={workspace?.id || null}
        onSuccess={(project) => {
          setProjects(prev => [...prev, { ...project, chats: [] }]);
        }}
      />
      
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        entityId={workspace.id}
        entityType="workspace"
        entityName={workspace.name}
      />
    </div>
  );
}
