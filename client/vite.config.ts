import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine if we're running in a Replit environment
const isReplit = !!process.env.REPL_ID;

export default defineConfig(async () => {
  const plugins = [react()];

  // Only load Replit-specific plugins if running on Replit
  if (isReplit) {
    // Dynamically import the runtime error overlay plugin
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    plugins.push(runtimeErrorOverlay());

    // Optionally load the theme plugin if you need it in Replit:
    const { default: themePlugin } = await import("@replit/vite-plugin-shadcn-theme-json");
    plugins.push(themePlugin());
    
    // You can also conditionally load the cartographer plugin as before:
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "../shared"),
        "@assets": path.resolve(__dirname, "../attached_assets"),
      },
    },
    root: __dirname,
    build: {
      // For local Express integration, build output goes to the backend's public folder.
      // When deployed on Vercel, you can adjust settings (or use a different build command)
      outDir: path.resolve(__dirname, "../server/public"),
      emptyOutDir: true,
    },
  };
});
