import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";

// Setup __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------
// Logger helper
function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// -----------------
// Vite setup function (for development)
// If in development mode, this function creates a Vite server in middleware mode
// and injects it into the Express app.
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true, // Type asserted as literal true
  };
  const viteLogger = createLogger();
  // Minimal Vite config – adjust as needed
  const viteConfig = {
    root: path.resolve(__dirname, "client"),
    plugins: [],
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });
  app.use(vite.middlewares);
  // A catch-all route that always reloads index.html from disk & clears cache busting using nanoid.
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(__dirname, "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// -----------------
// Static assets serving function (for production)
function serveStatic(app) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// -----------------
// In-memory storage class and instance
class MemStorage {
  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.currentId = 1;
    this.currentPreferenceId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getUserPreferences(userId) {
    return this.preferences.get(userId);
  }
  async saveUserPreferences(userId, prefs) {
    let existing = this.preferences.get(userId);
    if (existing) {
      const updated = { ...existing, ...prefs };
      this.preferences.set(userId, updated);
      return updated;
    } else {
      const id = this.currentPreferenceId++;
      const defaultPrefs = {
        id,
        userId,
        theme: "light",
        fontFamily: "roboto",
        fontSize: 16,
        letterSpacing: 1,
        lineHeight: 15,
        customSettings: null,
      };
      const newPrefs = { ...defaultPrefs, ...prefs };
      this.preferences.set(userId, newPrefs);
      return newPrefs;
    }
  }
}
const storage = new MemStorage();

// -----------------
// Dummy text-processing functions (replace with your actual GROQ or processing logic)
async function summarizeText(text) {
  // Simulate summarization
  return `Summary: ${text.slice(0, 50)}...`;
}
async function simplifyText(text) {
  return `Simplified: ${text}`;
}
async function correctGrammar(text) {
  return `Corrected: ${text}`;
}
async function translateText(text, sourceLanguage, targetLanguage) {
  return `Translated (${sourceLanguage} -> ${targetLanguage}): ${text}`;
}
async function getChatResponse(message) {
  return `Chat response for: ${message}`;
}
async function getSuggestedResponses(context) {
  return ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"];
}

// -----------------
// Register API routes
async function registerRoutes(app) {
  const apiRouter = express.Router();

  apiRouter.post("/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }
      const summary = await summarizeText(text);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing text:", error);
      res.status(500).json({
        message: "Error processing text summarization",
        error: error.message,
      });
    }
  });

  apiRouter.post("/simplify", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }
      const simplifiedText = await simplifyText(text);
      res.json({ simplifiedText });
    } catch (error) {
      console.error("Error simplifying text:", error);
      res.status(500).json({
        message: "Error processing text simplification",
        error: error.message,
      });
    }
  });

  apiRouter.post("/correct-grammar", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }
      const correctedText = await correctGrammar(text);
      res.json({ correctedText });
    } catch (error) {
      console.error("Error correcting grammar:", error);
      res.status(500).json({
        message: "Error processing grammar correction",
        error: error.message,
      });
    }
  });

  apiRouter.post("/translate", async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;
      if (!text || typeof text !== "string") {
        return res
          .status(400)
          .json({ message: "Text is required and must be a string" });
      }
      if (!targetLanguage) {
        return res
          .status(400)
          .json({ message: "Target language is required" });
      }
      const translatedText = await translateText(
        text,
        sourceLanguage,
        targetLanguage
      );
      res.json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(500).json({
        message: "Error processing translation",
        error: error.message,
      });
    }
  });

  apiRouter.post("/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res
          .status(400)
          .json({ message: "Message is required and must be a string" });
      }
      const response = await getChatResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("Error getting chat response:", error);
      res.status(500).json({
        message: "Error processing chat response",
        error: error.message,
      });
    }
  });

  apiRouter.post("/suggested-responses", async (req, res) => {
    try {
      const { context } = req.body;
      if (!context || typeof context !== "string") {
        return res
          .status(400)
          .json({ message: "Context is required and must be a string" });
      }
      const suggestions = await getSuggestedResponses(context);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting suggested responses:", error);
      res.status(500).json({
        message: "Error processing suggested responses",
        error: error.message,
      });
    }
  });

  apiRouter.post("/preferences", async (req, res) => {
    try {
      const { userId, ...preferences } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const userPrefs = await storage.saveUserPreferences(userId, preferences);
      res.json(userPrefs);
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({
        message: "Error saving user preferences",
        error: error.message,
      });
    }
  });

  apiRouter.get("/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const preferences = await storage.getUserPreferences(Number(userId));
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      res.json(preferences);
    } catch (error) {
      console.error("Error getting user preferences:", error);
      res.status(500).json({
        message: "Error getting user preferences",
        error: error.message,
      });
    }
  });

  // Test endpoint for GROQ integration
  apiRouter.get("/test-groq", async (req, res) => {
    try {
      const testResult = await summarizeText(
        "Hello, this is a test to check if GROQ is working properly. The quick brown fox jumps over the lazy dog."
      );
      res.json({
        success: true,
        message: "GROQ integration is working",
        testResult,
      });
    } catch (error) {
      console.error("Error testing GROQ:", error);
      res.status(500).json({
        success: false,
        message: "GROQ integration test failed",
        error: error.message,
      });
    }
  });

  app.use("/api", apiRouter);
  return app;
}

// -----------------
// Main app initialization
const app = express();

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Register all API routes
registerRoutes(app).catch((error) => {
  console.error("Error registering routes:", error);
});

// Error handling middleware (should be placed last)
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Create HTTP server from the Express app
const server = createServer(app);

// Depending on the environment, either set up Vite (for development) or serve static files (for production)
if (process.env.NODE_ENV === "development") {
  setupVite(app, server)
    .then(() => {
      // If not in a serverless environment (e.g. Vercel), listen on port 5000
      if (!process.env.VERCEL) {
        server.listen(5000, "localhost", () => {
          log("Server running at http://localhost:5000");
        });
      }
    })
    .catch((error) => {
      console.error("Failed to setup Vite:", error);
      process.exit(1);
    });
} else {
  serveStatic(app);
  if (!process.env.VERCEL) {
    server.listen(5000, "localhost", () => {
      log("Server running at http://localhost:5000");
    });
  }
}

// -----------------
// Export the Express app as the default export for Vercel's serverless function handler.
export default app;
