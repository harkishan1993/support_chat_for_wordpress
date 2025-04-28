const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(cookieParser());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(
    cors({
        origin: "*",
        credentials: true, // Allow cookies to be sent
    })
);
const userSocketMap = {}; // {userId: socketId}
const getReceiverSocketId = (receiverId) => {
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
    // When a user initiates a call

    socket.on("incomingVoiceCall", ({ to, from }) => {
        console.log(to, from)
        const receiverSocketIds = getReceiverSocketId(to);
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("incomingVoiceCall", { from });
        });
    });

    // When a user accepts a call
    socket.on("accept-call", ({ to }) => {
        const receiverSocketIds = getReceiverSocketId(to);
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("call-accepted");
        });
    });
    // When an ICE candidate is sent from the frontend, send it to the receiver
    socket.on("ice-candidate", ({ to, candidate }) => {
        const receiverSocketIds = getReceiverSocketId(to);
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("ice-candidate", candidate);
        });
    });

    // When a user accepts the call and sends an answer (SDP)
    socket.on("answer", ({ to, answer }) => {
        const receiverSocketIds = getReceiverSocketId(to);
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("answer", answer);
        });
    });

    // When a user rejects a call
    socket.on("reject-call", ({ to }) => {
        const receiverSocketIds = getReceiverSocketId(to);
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("call-rejected");
        });
    });

    // When a user ends a call
    socket.on("end-call", ({ to }) => {
        const receiverSocketIds = getReceiverSocketId(to);
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("call-ended");
        });
    });
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

module.exports = {
    app,
    io,
    server,
    express,
    getReceiverSocketId
};
