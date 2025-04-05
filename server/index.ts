// index.ts

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Middleware to log responses for API routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Bind the original res.json to preserve context
  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Register API routes
    console.log("Before registering routes");
    await registerRoutes(app);
    console.log("After registering routes");

    // Log the registered routes (for debugging purposes)
    const registeredRoutes = app._router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => layer.route.path);
    console.log("Registered routes:", registeredRoutes);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      // Log the error instead of rethrowing it
      log(`Error: ${message} (status: ${status})`);
    });

    // Create HTTP server from Express app
    const server = createServer(app);

    // In development, set up Vite; in production, serve static files.
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Listen on port 5000 on all interfaces.
    const port = 5000;
    const host = "localhost";
    if (!process.env.VERCEL) {
      server.listen(port, host, () => {
          log(`Server running at http://${host}:${port}`);
        });
        } catch (error) {
          console.error("Server failed to start:", error);
        }
      });
    }
    
})();
