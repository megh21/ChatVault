import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceCard } from "@/components/workspace-card";
import { PlusIcon, SearchIcon, FolderPlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, listItem } from "@/lib/framer-animations";
import { WorkspaceWithProjects } from "@/lib/types";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";

export default function Home() {
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithProjects[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);
  
  useEffect(() => {
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
        console.error("Error fetching workspaces:", error);
        toast({
          title: "Error",
          description: "Failed to load workspaces. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, [toast]);
  
  // If no workspaces exist yet, create dummy data for demo
  useEffect(() => {
    if (!loading && workspaces.length === 0) {
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
  }, [loading, workspaces.length]);
  
  const filteredWorkspaces = searchQuery
    ? workspaces.filter(workspace => 
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (workspace.description && workspace.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : workspaces;
  
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">My Workspaces</h1>
            <p className="text-gray-500 mt-1">Organize your LLM conversations across different contexts</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-full md:w-auto">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search workspaces..."
                className="pl-9 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              onClick={() => setCreateWorkspaceOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </div>
        </div>
        
        {/* Workspaces Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 border rounded-lg animate-pulse bg-gray-100"></div>
            ))}
          </div>
        ) : filteredWorkspaces.length > 0 ? (
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredWorkspaces.map((workspace) => (
              <motion.div key={workspace.id} variants={listItem}>
                <WorkspaceCard 
                  workspace={workspace}
                  projectCount={workspace.projects?.length || 0}
                />
              </motion.div>
            ))}
            
            <motion.div variants={listItem} className="min-h-[200px]">
              <Button
                variant="outline"
                className="w-full h-full border-dashed flex flex-col items-center justify-center gap-3 py-8 hover:bg-gray-50 transition-colors"
                onClick={() => setCreateWorkspaceOpen(true)}
              >
                <div className="bg-gray-100 rounded-full p-4">
                  <PlusIcon className="h-8 w-8 text-gray-500" />
                </div>
                <span className="font-medium">Create New Workspace</span>
                <p className="text-gray-500 text-sm text-center max-w-[200px]">
                  Group your chats into organized workspaces
                </p>
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-gray-100 rounded-full p-5 mb-4">
              <FolderPlusIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Create your first workspace to start organizing your LLM conversations
            </p>
            <Button
              onClick={() => setCreateWorkspaceOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        )}
        
        {/* Recent Activity (Optional Section) */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="border rounded-lg divide-y">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium">Added a new chat "Improving Code Generation"</p>
                <p className="text-sm text-gray-500">In GPT-4 Experiments • Yesterday</p>
              </div>
              <Link href="/project/1/chat/1">
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium">Created "Product Development" workspace</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
              <Link href="/workspace/2">
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium">Added a new chat "Advanced Prompt Engineering Techniques"</p>
                <p className="text-sm text-gray-500">In GPT-4 Experiments • Last week</p>
              </div>
              <Link href="/project/1/chat/2">
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
        onSuccess={(workspace) => {
          setWorkspaces(prev => [...prev, {...workspace, projects: []}]);
          toast({
            title: "Workspace created",
            description: `"${workspace.name}" has been created successfully.`
          });
        }}
      />
      
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSuccess={(project) => {
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
          toast({
            title: "Project created",
            description: `"${project.name}" has been created successfully.`
          });
        }}
      />
    </div>
  );
}
