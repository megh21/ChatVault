import { User, Workspace, Project, Chat, Message, Tag, Collaborator, ChatProvider, MessageRole } from "@shared/schema";

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

// UI types
export interface SidebarState {
  isOpen: boolean;
}

export interface ModalState {
  importChat: boolean;
  createWorkspace: boolean;
  createProject: boolean;
  share: boolean;
}

// Extended types with additional UI properties
export interface WorkspaceWithProjects extends Workspace {
  projects?: Project[];
}

export interface ChatWithTags extends Chat {
  tags: Tag[];
}

export interface ProjectWithChats extends Project {
  chats?: ChatWithTags[];
}

// Form Types
export interface ImportChatForm {
  provider: ChatProvider;
  importMethod: "paste" | "upload";
  content: string;
  title: string;
  tags: string[];
}

export interface CreateWorkspaceForm {
  name: string;
  description?: string;
  color: string;
  privacy: "private" | "shared";
}

export interface CreateProjectForm {
  name: string;
  description?: string;
  workspaceId: number;
}

export interface ShareEntityForm {
  entityId: number;
  entityType: "workspace" | "project";
  email: string;
  permission: "view" | "edit" | "admin";
}

// Toast Types
export type ToastType = "success" | "error" | "info";

export interface ToastState {
  open: boolean;
  title: string;
  message: string;
  type: ToastType;
}

// Drag and Drop
export interface FileUploadState {
  isDragging: boolean;
  files: File[];
}
