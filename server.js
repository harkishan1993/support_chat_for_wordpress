const next = require("next");
const { app, server, express } = require("./src/node/socket/socket.js");
const authRoutes = require("./src/node/routes/auth.route.js");
const messageRoutes = require("./src/node/routes/message.route.js");
const path = require("path")
const dev = process.env.NODE_ENV !== "production";
const hostname = "::"; // Fix typo: 'lacalhost' ➝ 'localhost'
const port = 3000;

const appNext = next({ dev, hostname, port });
const handle = appNext.getRequestHandler();

appNext.prepare().then(() => {
  app.use(express.static("public")); // Serve static files from 'public'
  app.use(express.static(".next/static")); // Serve Next.js built files
  app.use(express.static("_next")); // Serve Next.js built files
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  app.post("/api/chat", (req, res) => {
    return res.json({ message: "Hello, World!" });
  });

  // Important: catch-all route
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
