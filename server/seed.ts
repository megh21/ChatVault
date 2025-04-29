import { storage } from "./storage";

async function seed() {
  try {
    // Create a workspace
    const workspace = await storage.createWorkspace({
      name: "AI Research",
      description: "Research on various AI models",
      color: "accent",
      privacy: "private",
      userId: 1
    });

    console.log("Created workspace:", workspace);

    // Create a project in the workspace
    const project = await storage.createProject({
      name: "GPT-4 Experiments",
      description: "Testing GPT-4 capabilities",
      workspaceId: workspace.id,
      userId: 1
    });

    console.log("Created project:", project);

    // Create a chat in the project
    const chat = await storage.createChat({
      title: "Initial Conversation",
      summary: "First test of GPT-4 capabilities",
      provider: "chatgpt",
      projectId: project.id,
      userId: 1
    });

    console.log("Created chat:", chat);

    // Add some messages to the chat
    const messages = await Promise.all([
      storage.createMessage({
        chatId: chat.id,
        role: "user",
        content: "What are the main capabilities of GPT-4?",
      }),
      storage.createMessage({
        chatId: chat.id,
        role: "assistant",
        content: "GPT-4 demonstrates significant improvements in several areas:\n\n1. Enhanced reasoning\n2. Better context understanding\n3. Improved accuracy\n4. More reliable responses\n5. Better handling of complex instructions",
      })
    ]);

    console.log("Created messages:", messages);

    // Add a tag to the chat
    const tag = await storage.createTag({
      name: "GPT-4",
      userId: 1,
      chatId: chat.id
    });

    console.log("Created tag:", tag);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed(); 