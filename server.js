
import next from "next";
import { app , server, express } from "./src/node/socket/socket.js";
import authRoutes from "./src/node/routes/auth.route.js";
import messageRoutes from "./src/node/routes/message.route.js";
const dev = process.env.NODE_ENV !== "production";
const hostname = '::';
const port = 3000;
const appNext = next({ dev, hostname, port });
const handle = appNext.getRequestHandler();
appNext.prepare().then(() => {
  app.use(express.static("public")); // Serve static files from 'public'
  app.use(express.static(".next/static")); // Serve Next.js built files
  app.use(express.static("_next")); // Serve Next.js built files
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
  app.post("/api/chat", (req, res) => {
    return res.json({ message: "Hello, World!" });
  });
  // 🔥 Important: `app.all("*")` should come last
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  process.on("exit", () => {
    console.log("Server is shutting down...");
  });
  
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
