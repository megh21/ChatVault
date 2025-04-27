import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatList } from "@/components/chat-list";
import { PlusIcon, SearchIcon, Share2Icon, ChevronRightIcon, FolderIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fadeIn } from "@/lib/framer-animations";
import { Project, Workspace, Chat } from "@shared/schema";
import { ImportChatModal } from "@/components/modals/import-chat-modal";
import { ShareModal } from "@/components/modals/share-modal";
import { formatDate } from "@/lib/utils";
import { ChatWithTags } from "@/lib/types";

export default function ProjectPage() {
  const [, params] = useRoute("/project/:id");
  const projectId = params ? parseInt(params.id) : 0;
  
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [chats, setChats] = useState<ChatWithTags[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [importChatOpen, setImportChatOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Fetch project details and chats
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project
        const projectResponse = await fetch(`/api/projects/${projectId}`, {
          credentials: "include"
        });
        
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project");
        }
        
        const projectData = await projectResponse.json();
        setProject(projectData.project);
        
        // Fetch workspace
        const workspaceResponse = await fetch(`/api/workspaces/${projectData.project.workspaceId}`, {
          credentials: "include"
        });
        
        if (!workspaceResponse.ok) {
          throw new Error("Failed to fetch workspace");
        }
        
        const workspaceData = await workspaceResponse.json();
        setWorkspace(workspaceData.workspace);
        
        // Fetch chats for this project
        const chatsResponse = await fetch(`/api/projects/${projectId}/chats`, {
          credentials: "include"
        });
        
        if (!chatsResponse.ok) {
          throw new Error("Failed to fetch chats");
        }
        
        const chatsData = await chatsResponse.json();
        setChats(chatsData.chats || []);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, toast]);
  
  // If no real data, create demo data
  useEffect(() => {
    if (!loading && !project) {
      const demoProject: Project = {
        id: projectId,
        name: "GPT-4 Experiments",
        description: "Testing capabilities of the GPT-4 model",
        workspaceId: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProject(demoProject);
      
      const demoWorkspace: Workspace = {
        id: 1,
        name: "AI Research",
        description: "Research on various AI models and techniques",
        color: "accent",
        privacy: "private",
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setWorkspace(demoWorkspace);
      
      const demoChats: ChatWithTags[] = [
        {
          id: 1,
          title: "Advanced Prompt Engineering Techniques",
          summary: "Discussion about advanced prompt engineering techniques like chain-of-thought, few-shot learning, and persona setting for better results.",
          provider: "chatgpt",
          projectId,
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
          projectId,
          userId: 1,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lastViewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: [
            { id: 2, name: "code", userId: 1, chatId: 2, createdAt: new Date() },
            { id: 3, name: "guide", userId: 1, chatId: 2, createdAt: new Date() }
          ]
        }
      ];
      
      setChats(demoChats);
    }
  }, [loading, project, projectId]);
  
  const filteredChats = searchQuery
    ? chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.summary && chat.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        chat.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : chats;
    
  if (loading) {
    return (
      <div className="flex-1 flex animate-pulse overflow-hidden">
        <div className="w-72 border-r border-gray-200 bg-white"></div>
        <div className="flex-1 p-6">
          <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-md w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-100 rounded-md w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-8"></div>
          
          <div className="flex justify-between mb-6">
            <div className="h-10 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project || !workspace) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-500 mb-4">The project you are looking for does not exist or you don't have access to it.</p>
          <Link href="/">
            <Button>Go back to home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat List Sidebar */}
      <ChatList 
        chats={filteredChats}
        projectId={projectId}
        onImportChat={() => setImportChatOpen(true)}
        isLoading={loading}
      />
      
      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 overflow-y-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href={`/workspace/${workspace.id}`}>
            <a className="hover:text-gray-900 transition-colors flex items-center">
              <FolderIcon className="h-4 w-4 mr-1" />
              {workspace.name}
            </a>
          </Link>
          <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-medium text-gray-900">{project.name}</span>
        </div>
        
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 mt-1">{project.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created on {formatDate(project.createdAt)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search chats..."
                className="pl-9 w-full md:w-56"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            
            <Button
              className="bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => setImportChatOpen(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Import Chat
            </Button>
          </div>
        </div>
        
        {/* Content when no chat is selected */}
        {filteredChats.length > 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-5 inline-block mb-4">
              <ChevronRightIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Select a chat to view</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Choose a chat from the sidebar or import a new conversation
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-5 inline-block mb-4">
              <PlusIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No chats yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Import your first LLM conversation to get started
            </p>
            <Button
              className="bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => setImportChatOpen(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Import Chat
            </Button>
          </div>
        )}
      </motion.div>
      
      {/* Modals */}
      <ImportChatModal
        isOpen={importChatOpen}
        onClose={() => setImportChatOpen(false)}
        projectId={projectId}
      />
      
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        entityId={project.id}
        entityType="project"
        entityName={project.name}
      />
    </div>
  );
}
