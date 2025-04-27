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
    
    // Create initial demo data
    this.createInitialData();
  }
  
  // Helper method to initialize some demo data
  private async createInitialData() {
    // Create a demo user
    const user = await this.createUser({
      email: "user@example.com",
      username: "demouser", 
      displayName: "Demo User"
    });
    
    // Create a demo workspace
    const workspace = await this.createWorkspace({
      name: "AI Research",
      description: "Collection of AI research notes and experiments",
      color: "blue",
      privacy: "private",
      userId: user.id
    });
    
    // Create a demo project
    const project = await this.createProject({
      name: "GPT-4 Experiments",
      description: "Testing capabilities of the GPT-4 model",
      workspaceId: workspace.id,
      userId: user.id
    });
    
    // Create a demo chat
    const chat = await this.createChat({
      title: "Advanced Prompt Engineering",
      summary: "Discussion about advanced prompt engineering techniques like chain-of-thought, few-shot learning, and persona setting for better results.",
      provider: "chatgpt",
      projectId: project.id,
      userId: user.id
    });
    
    // Create demo tags
    await this.createTag({
      name: "prompt-engineering",
      userId: user.id,
      chatId: chat.id
    });
    
    await this.createTag({
      name: "technique",
      userId: user.id,
      chatId: chat.id
    });
    
    // Create some demo messages
    await this.createMessage({
      chatId: chat.id,
      role: "user",
      content: "I've been experimenting with different prompt engineering techniques. What are the most effective methods for getting more accurate and detailed responses from large language models?"
    });
    
    await this.createMessage({
      chatId: chat.id,
      role: "assistant",
      content: "# Effective Prompt Engineering Techniques\n\nPrompt engineering is indeed a crucial skill when working with large language models. Here are some of the most effective techniques:\n\n## 1. Chain-of-Thought Prompting\n\nGuide the model through a step-by-step reasoning process by explicitly asking it to think through a problem. This works particularly well for complex reasoning tasks.\n\nExample:\n```\nQuestion: If I buy 3 apples at $0.50 each and 2 oranges at $0.75 each, how much do I spend in total?\n\nLet's think step by step:\n1. Cost of apples = 3 × $0.50 = $1.50\n2. Cost of oranges = 2 × $0.75 = $1.50\n3. Total cost = $1.50 + $1.50 = $3.00\n```\n\n## 2. Few-Shot Learning\n\nProvide examples of the desired input-output pattern before asking your actual question. This helps the model understand the expected format and reasoning style.\n\n## 3. Role Prompting\n\nAssign the AI a specific role or persona that has expertise in the relevant domain. For example: \"You are an experienced quantum physicist...\"\n\n## 4. Structured Outputs\n\nRequest responses in specific formats (bullet points, tables, JSON) to get more organized and usable information.\n\nWould you like me to elaborate on any of these techniques or provide more examples?"
    });
    
    await this.createMessage({
      chatId: chat.id,
      role: "user",
      content: "I'd like to know more about few-shot learning. How many examples should I typically include, and how detailed should they be?"
    });
    
    await this.createMessage({
      chatId: chat.id,
      role: "assistant", 
      content: "# Few-Shot Learning: Best Practices\n\n## Optimal Number of Examples\n\nThe ideal number of examples in few-shot learning depends on several factors, but here are some general guidelines:\n\n### General Guidelines\n\n- **2-5 examples** is typically sufficient for most straightforward tasks\n- **5-10 examples** may be needed for more complex or nuanced tasks\n- More than 10 examples often hits diminishing returns and consumes token context\n\n### Factors Affecting Example Count\n\n1. **Task Complexity**: More complex tasks benefit from more examples\n2. **Consistency Needed**: Tasks requiring high consistency benefit from more examples\n3. **Available Context Space**: Consider your total token limit\n\n## Example Detail Level\n\nThe detail level should match what you expect in the output. Here's what to consider:\n\n### Content Elements\n\n- Include all relevant fields/sections you want to see in responses\n- Demonstrate the reasoning pattern you want the model to follow\n- Show edge cases if handling them correctly is important\n\n### Balance and Variety\n\n- Use diverse examples that cover different scenarios\n- Include both simple and more complex cases\n- Represent different possible inputs the model might encounter\n\n## Example Structure Effectiveness\n\nStructuring your examples with clear input/output separation helps the model understand the pattern:\n\n```\nInput: [Your input text]\nOutput: [Expected output format]\n\nInput: [Second input example]\nOutput: [Second output example]\n\n[... more examples as needed]\n\nInput: [Your actual question]\nOutput:\n```\n\nThis clear delineation helps the model recognize where examples end and the actual task begins.\n\nWould you like to see specific few-shot learning examples for a particular domain or task?"
    });
    
    // Create a second demo chat
    const chat2 = await this.createChat({
      title: "Improving Code Generation",
      summary: "Exploration of different approaches to generate better code with LLMs, focusing on specific instructions and code review patterns.",
      provider: "claude",
      projectId: project.id,
      userId: user.id
    });
    
    // Tags for the second chat
    await this.createTag({
      name: "code",
      userId: user.id,
      chatId: chat2.id
    });
    
    await this.createTag({
      name: "programming",
      userId: user.id,
      chatId: chat2.id
    });
    
    // Messages for the second chat
    await this.createMessage({
      chatId: chat2.id,
      role: "user",
      content: "I'm trying to get better code generation from Claude. What are some best practices for prompting LLMs to write high-quality code?"
    });
    
    await this.createMessage({
      chatId: chat2.id,
      role: "assistant",
      content: "# Best Practices for Code Generation with LLMs\n\n## Key Strategies\n\n1. **Be specific about requirements**\n   - Clearly state what the code should accomplish\n   - Define inputs, outputs, and any constraints\n   - Specify edge cases that should be handled\n\n2. **Specify language and version**\n   - Explicitly mention the programming language and version \n   - Example: \"Python 3.9\" rather than just \"Python\"\n\n3. **Request code style and patterns**\n   - Mention if you prefer a particular coding style or pattern\n   - Specify architectural preferences (OOP, functional, etc.)\n   - Request specific design patterns when appropriate\n\n4. **Ask for documentation**\n   - Request inline comments or docstrings\n   - Ask for function/method documentation\n   - Request examples of usage\n\n5. **Request error handling**\n   - Explicitly ask for proper error handling\n   - Specify how edge cases should be managed\n   - Ask for validation of inputs\n\n## Example of a Well-Structured Prompt\n\n```\nPlease write a Python 3.10 function that validates an email address with these requirements:\n\n1. Accept a string input representing an email address\n2. Return True if the email is valid, False otherwise\n3. Use regex for validation with these rules:\n   - Must contain a single @ symbol\n   - Username part can contain letters, numbers, dots, underscores\n   - Domain must have at least one dot\n   - Top-level domain must be 2-6 characters\n4. Include proper error handling for edge cases (null input, non-string input)\n5. Include docstrings and type hints\n6. Include 3-4 test cases demonstrating the function's behavior\n```\n\nWould you like me to provide a more specific example for a particular type of code you're trying to generate?"
    });
    
    // More messages would be added normally
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
