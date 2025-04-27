import { 
  users, workspaces, projects, chats, messages, tags, collaborators,
  type User, type InsertUser, 
  type Workspace, type InsertWorkspace,
  type Project, type InsertProject,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type Tag, type InsertTag,
  type Collaborator, type InsertCollaborator
} from "../shared/schema";
import { db } from "./db";
import { eq, and, like, desc, asc, or } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async getWorkspacesByUserId(userId: number): Promise<Workspace[]> {
    return db.select().from(workspaces).where(eq(workspaces.userId, userId));
  }

  async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
    const [workspace] = await db
      .insert(workspaces)
      .values(insertWorkspace)
      .returning();
    return workspace;
  }

  async updateWorkspace(id: number, workspace: Partial<Workspace>): Promise<Workspace | undefined> {
    const [updated] = await db
      .update(workspaces)
      .set(workspace)
      .where(eq(workspaces.id, id))
      .returning();
    return updated;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    const deleted = await db.delete(workspaces).where(eq(workspaces.id, id));
    return true;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProjectsByWorkspaceId(workspaceId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async getChatsByProjectId(projectId: number): Promise<Chat[]> {
    return db.select().from(chats).where(eq(chats.projectId, projectId));
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return db.select().from(chats).where(eq(chats.userId, userId));
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values(insertChat)
      .returning();
    return chat;
  }

  async updateChat(id: number, chat: Partial<Chat>): Promise<Chat | undefined> {
    const [updated] = await db
      .update(chats)
      .set(chat)
      .where(eq(chats.id, id))
      .returning();
    return updated;
  }

  async deleteChat(id: number): Promise<boolean> {
    await db.delete(chats).where(eq(chats.id, id));
    return true;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.timestamp));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined> {
    const [updated] = await db
      .update(messages)
      .set(message)
      .where(eq(messages.id, id))
      .returning();
    return updated;
  }

  async deleteMessage(id: number): Promise<boolean> {
    await db.delete(messages).where(eq(messages.id, id));
    return true;
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagsByChatId(chatId: number): Promise<Tag[]> {
    return db.select().from(tags).where(eq(tags.chatId, chatId));
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values(insertTag)
      .returning();
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    await db.delete(tags).where(eq(tags.id, id));
    return true;
  }

  async getCollaborator(id: number): Promise<Collaborator | undefined> {
    const [collaborator] = await db.select().from(collaborators).where(eq(collaborators.id, id));
    return collaborator;
  }

  async getCollaboratorsByEntityId(entityId: number, entityType: string): Promise<Collaborator[]> {
    return db
      .select()
      .from(collaborators)
      .where(
        and(
          eq(collaborators.entityId, entityId),
          eq(collaborators.entityType, entityType)
        )
      );
  }

  async createCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const [collaborator] = await db
      .insert(collaborators)
      .values(insertCollaborator)
      .returning();
    return collaborator;
  }

  async deleteCollaborator(id: number): Promise<boolean> {
    await db.delete(collaborators).where(eq(collaborators.id, id));
    return true;
  }

  async searchChats(userId: number, query: string): Promise<Chat[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.userId, userId),
          or(
            like(chats.title, lowerQuery),
            like(chats.summary, lowerQuery)
          )
        )
      )
      .orderBy(desc(chats.updatedAt));
  }
}

export const storage = new DatabaseStorage();