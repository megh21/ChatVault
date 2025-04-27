import { 
  User, InsertUser, 
  Workspace, InsertWorkspace, 
  Project, InsertProject, 
  Chat, InsertChat, 
  Message, InsertMessage, 
  Tag, InsertTag, 
  Collaborator, InsertCollaborator
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workspaces
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByUserId(userId: number): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, workspace: Partial<Workspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;
  
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getProjectsByWorkspaceId(workspaceId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Chats
  getChat(id: number): Promise<Chat | undefined>;
  getChatsByProjectId(projectId: number): Promise<Chat[]>;
  getChatsByUserId(userId: number): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: number, chat: Partial<Chat>): Promise<Chat | undefined>;
  deleteChat(id: number): Promise<boolean>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Tags
  getTag(id: number): Promise<Tag | undefined>;
  getTagsByChatId(chatId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  deleteTag(id: number): Promise<boolean>;
  
  // Collaborators
  getCollaborator(id: number): Promise<Collaborator | undefined>;
  getCollaboratorsByEntityId(entityId: number, entityType: string): Promise<Collaborator[]>;
  createCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  deleteCollaborator(id: number): Promise<boolean>;
  
  // Search
  searchChats(userId: number, query: string): Promise<Chat[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private projects: Map<number, Project>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private tags: Map<number, Tag>;
  private collaborators: Map<number, Collaborator>;
  
  private currentIds: {
    user: number;
    workspace: number;
    project: number;
    chat: number;
    message: number;
    tag: number;
    collaborator: number;
  };
  
  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.projects = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.tags = new Map();
    this.collaborators = new Map();
    
    this.currentIds = {
      user: 1,
      workspace: 1,
      project: 1,
      chat: 1,
      message: 1,
      tag: 1,
      collaborator: 1
    };
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      displayName: insertUser.displayName || null,
      avatarUrl: insertUser.avatarUrl || null,
      googleId: insertUser.googleId || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }
  
  async getWorkspacesByUserId(userId: number): Promise<Workspace[]> {
    return Array.from(this.workspaces.values()).filter(
      workspace => workspace.userId === userId
    );
  }
  
  async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
    const id = this.currentIds.workspace++;
    const now = new Date();
    const workspace: Workspace = { 
      ...insertWorkspace, 
      id, 
      createdAt: now, 
      updatedAt: now,
      description: insertWorkspace.description || null,
      privacy: insertWorkspace.privacy || "private"
    };
    this.workspaces.set(id, workspace);
    return workspace;
  }
  
  async updateWorkspace(id: number, workspace: Partial<Workspace>): Promise<Workspace | undefined> {
    const existingWorkspace = this.workspaces.get(id);
    if (!existingWorkspace) {
      return undefined;
    }
    
    const updatedWorkspace = { 
      ...existingWorkspace, 
      ...workspace, 
      updatedAt: new Date() 
    };
    this.workspaces.set(id, updatedWorkspace);
    return updatedWorkspace;
  }
  
  async deleteWorkspace(id: number): Promise<boolean> {
    return this.workspaces.delete(id);
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.userId === userId
    );
  }
  
  async getProjectsByWorkspaceId(workspaceId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.workspaceId === workspaceId
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentIds.project++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now, 
      updatedAt: now,
      description: insertProject.description || null
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject = { 
      ...existingProject, 
      ...project, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Chat methods
  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }
  
  async getChatsByProjectId(projectId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      chat => chat.projectId === projectId
    );
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      chat => chat.userId === userId
    );
  }
  
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentIds.chat++;
    const now = new Date();
    const chat: Chat = { 
      ...insertChat, 
      id, 
      createdAt: now, 
      updatedAt: now, 
      lastViewed: now,
      summary: insertChat.summary || null
    };
    this.chats.set(id, chat);
    return chat;
  }
  
  async updateChat(id: number, chat: Partial<Chat>): Promise<Chat | undefined> {
    const existingChat = this.chats.get(id);
    if (!existingChat) {
      return undefined;
    }
    
    const updatedChat = { 
      ...existingChat, 
      ...chat, 
      updatedAt: new Date() 
    };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }
  
  async deleteChat(id: number): Promise<boolean> {
    return this.chats.delete(id);
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.chatId === chatId
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: now, 
      isEdited: false,
      lastEditedAt: null,
      metadata: insertMessage.metadata || {}
    };
    this.messages.set(id, message);
    return message;
  }
  
  async updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined> {
    const existingMessage = this.messages.get(id);
    if (!existingMessage) {
      return undefined;
    }
    
    const now = new Date();
    const updatedMessage = { 
      ...existingMessage, 
      ...message, 
      isEdited: true,
      lastEditedAt: now
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }
  
  // Tag methods
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }
  
  async getTagsByChatId(chatId: number): Promise<Tag[]> {
    return Array.from(this.tags.values()).filter(
      tag => tag.chatId === chatId
    );
  }
  
  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentIds.tag++;
    const now = new Date();
    const tag: Tag = { ...insertTag, id, createdAt: now };
    this.tags.set(id, tag);
    return tag;
  }
  
  async deleteTag(id: number): Promise<boolean> {
    return this.tags.delete(id);
  }
  
  // Collaborator methods
  async getCollaborator(id: number): Promise<Collaborator | undefined> {
    return this.collaborators.get(id);
  }
  
  async getCollaboratorsByEntityId(entityId: number, entityType: string): Promise<Collaborator[]> {
    return Array.from(this.collaborators.values()).filter(
      collaborator => collaborator.entityId === entityId && collaborator.entityType === entityType
    );
  }
  
  async createCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const id = this.currentIds.collaborator++;
    const now = new Date();
    const collaborator: Collaborator = { 
      ...insertCollaborator, 
      id, 
      createdAt: now,
      permission: insertCollaborator.permission || "view"
    };
    this.collaborators.set(id, collaborator);
    return collaborator;
  }
  
  async deleteCollaborator(id: number): Promise<boolean> {
    return this.collaborators.delete(id);
  }
  
  // Search methods
  async searchChats(userId: number, query: string): Promise<Chat[]> {
    const userChats = Array.from(this.chats.values()).filter(
      chat => chat.userId === userId
    );
    
    const lowerQuery = query.toLowerCase();
    return userChats.filter(chat => {
      if (chat.title.toLowerCase().includes(lowerQuery)) return true;
      if (chat.summary && chat.summary.toLowerCase().includes(lowerQuery)) return true;
      
      // Search messages content for this chat
      const chatMessages = Array.from(this.messages.values()).filter(
        message => message.chatId === chat.id
      );
      
      return chatMessages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      );
    });
  }
}

export const storage = new MemStorage();
