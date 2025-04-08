import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors"
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
    cors({
        origin: "*",
        credentials: true, // Allow cookies to be sent
    })
);
const userSocketMap = {}; // {userId: socketId}
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId] || [];
};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(userId, "socket connected");

    if (userId) {
        if (userSocketMap[userId]) {
            userSocketMap[userId].push(socket.id);
        } else {
            userSocketMap[userId] = [socket.id];
        }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        if (userId && userSocketMap[userId]) {
            userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
            if (userSocketMap[userId].length === 0) {
                delete userSocketMap[userId];
            }
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server,express };
