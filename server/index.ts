import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  let staticPath: string;
  
  if (process.env.NODE_ENV === "production") {
    // In production, check multiple possible locations
    const possiblePaths = [
      path.resolve(__dirname, "public"),
      path.resolve(__dirname, "..", "public"),
      path.resolve(process.cwd(), "public"),
      path.resolve(process.cwd(), "dist", "public")
    ];
    
    // Find the first path that exists
    for (const possiblePath of possiblePaths) {
      try {
        if (require('fs').existsSync(possiblePath)) {
          staticPath = possiblePath;
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }
    
    // Fallback if no path found
    if (!staticPath) {
      staticPath = path.resolve(__dirname, "public");
      console.warn(`Warning: Static files directory not found, using fallback: ${staticPath}`);
    }
  } else {
    // In development, use the standard dev build path
    staticPath = path.resolve(__dirname, "..", "dist", "public");
  }

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
