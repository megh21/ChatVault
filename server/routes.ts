import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { insertUserSchema, insertWorkspaceSchema, insertProjectSchema, insertChatSchema, insertMessageSchema, insertTagSchema, insertCollaboratorSchema } from "@shared/schema";
import { z } from "zod";
import session from 'express-session';
import memorystore from 'memorystore';

// Extend the Express Session type to include userId
declare module 'express-session' {
  interface Session {
    userId?: number;
  }
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const MemoryStore = memorystore(session);
  
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 1 day
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || 'chat-archive-secret'
    })
  );
  
  // Auth routes
  app.post('/api/auth/google', async (req, res) => {
    try {
      // In a real implementation, this would validate the Google token
      // For now, we'll just use the provided user data
      const { email, name, googleId, avatarUrl } = req.body;
      
      // Validate required fields
      if (!email || !googleId) {
        console.error('Missing required fields for Google auth:', { email, googleId });
        return res.status(400).json({ message: "Missing required fields for authentication" });
      }
      
      console.log('Google auth attempt:', { email, name, googleId: googleId?.substring(0, 10) });
      
      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Create a new user
          console.log('Creating new user with email:', email);
          try {
            user = await storage.createUser({
              username: email.split('@')[0],
              email,
              displayName: name || email.split('@')[0],
              avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}`,
              googleId
            });
          } catch (createError) {
            console.error('Failed to create user:', createError);
            return res.status(500).json({ message: "Failed to create user account" });
          }
        } else {
          // Update existing user with Google ID
          console.log('Updating existing user with Google ID');
          try {
            // Since we can't directly update in this example, we'll just create a new user record
            // with the same email but with the Google ID added
            // In a real app, you would use an UPDATE query here
            const updatedUser = await storage.createUser({
              username: user.username,
              email: user.email,
              displayName: user.displayName || name,
              avatarUrl: avatarUrl || user.avatarUrl,
              googleId
            });
            
            if (updatedUser) {
              user = updatedUser;
            }
          } catch (updateError) {
            console.error('Error updating user with Google ID:', updateError);
            // Fall back to using the existing user even if update fails
          }
        }
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      console.log('Authentication successful for user:', user.email);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      res.status(400).json({ message: "Authentication failed", error: String(error) });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  
  app.get('/api/auth/user', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    });
  });
  
  // Workspace routes
  app.get('/api/workspaces', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const workspaces = await storage.getWorkspacesByUserId(userId);
    res.json({ workspaces });
  });
  
  app.post('/api/workspaces', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const workspaceData = insertWorkspaceSchema.parse({
        ...req.body,
        userId
      });
      
      const workspace = await storage.createWorkspace(workspaceData);
      res.status(201).json({ workspace });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workspace data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });
  
  app.get('/api/workspaces/:id', isAuthenticated, async (req, res) => {
    const workspaceId = parseInt(req.params.id);
    const workspace = await storage.getWorkspace(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    
    if (workspace.userId !== req.session.userId) {
      // Check if user is a collaborator
      const collaborators = await storage.getCollaboratorsByEntityId(workspaceId, 'workspace');
      const isCollaborator = collaborators.some(c => c.userId === req.session.userId);
      
      if (!isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    res.json({ workspace });
  });
  
  app.patch('/api/workspaces/:id', isAuthenticated, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      if (workspace.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedWorkspace = await storage.updateWorkspace(workspaceId, req.body);
      res.json({ workspace: updatedWorkspace });
    } catch (error) {
      res.status(500).json({ message: "Failed to update workspace" });
    }
  });
  
  app.delete('/api/workspaces/:id', isAuthenticated, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      if (workspace.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteWorkspace(workspaceId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });
  
  // Project routes
  app.get('/api/workspaces/:workspaceId/projects', isAuthenticated, async (req, res) => {
    const workspaceId = parseInt(req.params.workspaceId);
    const workspace = await storage.getWorkspace(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    
    if (workspace.userId !== req.session.userId) {
      // Check if user is a collaborator
      const collaborators = await storage.getCollaboratorsByEntityId(workspaceId, 'workspace');
      const isCollaborator = collaborators.some(c => c.userId === req.session.userId);
      
      if (!isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    const projects = await storage.getProjectsByWorkspaceId(workspaceId);
    res.json({ projects });
  });
  
  app.post('/api/workspaces/:workspaceId/projects', isAuthenticated, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      if (workspace.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userId = req.session.userId;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        workspaceId,
        userId
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json({ project });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.userId !== req.session.userId) {
      // Check if user is a collaborator
      const collaborators = await storage.getCollaboratorsByEntityId(project.workspaceId, 'workspace');
      const projectCollaborators = await storage.getCollaboratorsByEntityId(projectId, 'project');
      const isCollaborator = collaborators.some(c => c.userId === req.session.userId) ||
        projectCollaborators.some(c => c.userId === req.session.userId);
      
      if (!isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    res.json({ project });
  });
  
  // Chat routes
  app.get('/api/projects/:projectId/chats', isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check access permission
    if (project.userId !== req.session.userId) {
      const workspaceCollaborators = await storage.getCollaboratorsByEntityId(project.workspaceId, 'workspace');
      const projectCollaborators = await storage.getCollaboratorsByEntityId(projectId, 'project');
      const isCollaborator = workspaceCollaborators.some(c => c.userId === req.session.userId) ||
        projectCollaborators.some(c => c.userId === req.session.userId);
      
      if (!isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    const chats = await storage.getChatsByProjectId(projectId);
    
    // Get tags for each chat
    const chatsWithTags = await Promise.all(chats.map(async chat => {
      const tags = await storage.getTagsByChatId(chat.id);
      return {
        ...chat,
        tags
      };
    }));
    
    res.json({ chats: chatsWithTags });
  });
  
  app.post('/api/projects/:projectId/chats', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userId = req.session.userId;
      const chatData = insertChatSchema.parse({
        ...req.body,
        projectId,
        userId
      });
      
      const chat = await storage.createChat(chatData);
      
      // Handle tags if provided
      if (req.body.tags && Array.isArray(req.body.tags)) {
        for (const tagName of req.body.tags) {
          await storage.createTag({
            name: tagName,
            userId,
            chatId: chat.id
          });
        }
      }
      
      // Handle messages if provided
      if (req.body.messages && Array.isArray(req.body.messages)) {
        for (const messageData of req.body.messages) {
          await storage.createMessage({
            ...messageData,
            chatId: chat.id
          });
        }
      }
      
      res.status(201).json({ chat });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chat data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat" });
    }
  });
  
  app.get('/api/chats/:id', isAuthenticated, async (req, res) => {
    const chatId = parseInt(req.params.id);
    const chat = await storage.getChat(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Update last viewed timestamp
    await storage.updateChat(chatId, { lastViewed: new Date() });
    
    // Check access permission
    const project = await storage.getProject(chat.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (chat.userId !== req.session.userId) {
      const workspaceCollaborators = await storage.getCollaboratorsByEntityId(project.workspaceId, 'workspace');
      const projectCollaborators = await storage.getCollaboratorsByEntityId(chat.projectId, 'project');
      const isCollaborator = workspaceCollaborators.some(c => c.userId === req.session.userId) ||
        projectCollaborators.some(c => c.userId === req.session.userId);
      
      if (!isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    // Get messages for this chat
    const messages = await storage.getMessagesByChatId(chatId);
    
    // Get tags for this chat
    const tags = await storage.getTagsByChatId(chatId);
    
    res.json({ 
      chat: {
        ...chat,
        tags
      }, 
      messages 
    });
  });
  
  app.patch('/api/chats/:id', isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      if (chat.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedChat = await storage.updateChat(chatId, req.body);
      
      // Handle tags if provided
      if (req.body.tags && Array.isArray(req.body.tags)) {
        // Get existing tags
        const existingTags = await storage.getTagsByChatId(chatId);
        
        // Delete tags that are not in the new list
        for (const tag of existingTags) {
          if (!req.body.tags.includes(tag.name)) {
            await storage.deleteTag(tag.id);
          }
        }
        
        // Add new tags
        const existingTagNames = existingTags.map(t => t.name);
        for (const tagName of req.body.tags) {
          if (!existingTagNames.includes(tagName)) {
            await storage.createTag({
              name: tagName,
              userId: req.session.userId,
              chatId
            });
          }
        }
      }
      
      res.json({ chat: updatedChat });
    } catch (error) {
      res.status(500).json({ message: "Failed to update chat" });
    }
  });
  
  // Message routes
  app.post('/api/chats/:chatId/messages', isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      if (chat.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        chatId
      });
      
      const message = await storage.createMessage(messageData);
      
      // Update the chat's updated_at timestamp
      await storage.updateChat(chatId, { updatedAt: new Date() });
      
      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  app.patch('/api/messages/:id', isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      const chat = await storage.getChat(message.chatId);
      if (!chat || chat.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedMessage = await storage.updateMessage(messageId, req.body);
      
      // Update the chat's updated_at timestamp
      await storage.updateChat(message.chatId, { updatedAt: new Date() });
      
      res.json({ message: updatedMessage });
    } catch (error) {
      res.status(500).json({ message: "Failed to update message" });
    }
  });
  
  // Collaborator routes
  app.post('/api/collaborators', isAuthenticated, async (req, res) => {
    try {
      const { entityId, entityType, email, permission } = req.body;
      
      // Verify ownership
      if (entityType === 'workspace') {
        const workspace = await storage.getWorkspace(entityId);
        if (!workspace || workspace.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (entityType === 'project') {
        const project = await storage.getProject(entityId);
        if (!project || project.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        return res.status(400).json({ message: "Invalid entity type" });
      }
      
      // Find the user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if collaboration already exists
      const existingCollaborators = await storage.getCollaboratorsByEntityId(entityId, entityType);
      if (existingCollaborators.some(c => c.userId === user.id)) {
        return res.status(400).json({ message: "Collaboration already exists" });
      }
      
      const collaboratorData = insertCollaboratorSchema.parse({
        entityId,
        entityType,
        userId: user.id,
        permission
      });
      
      const collaborator = await storage.createCollaborator(collaboratorData);
      res.status(201).json({ collaborator });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collaborator data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add collaborator" });
    }
  });
  
  // Search route
  app.get('/api/search', isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const userId = req.session.userId;
      // This is a type guard to ensure userId is defined
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const chats = await storage.searchChats(userId, query);
      
      // Get tags for each chat
      const chatsWithTags = await Promise.all(chats.map(async chat => {
        const tags = await storage.getTagsByChatId(chat.id);
        return {
          ...chat,
          tags
        };
      }));
      
      res.json({ chats: chatsWithTags });
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
