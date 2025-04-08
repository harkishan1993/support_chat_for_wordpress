
import prisma from "../db/prisma.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const sendMessage = async (req, res) => {
    try {
        const { message, type } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.query.id;
        const botId = "cm8wpc4hv0001dnnkhgmea0he";
        if (!message || !receiverId || !senderId) {
            return res.status(400).json({ error: "Message, receiverId and senderId are required." });
        }

        const admin = await prisma.user.findFirst({ where: { role: "administrator" } });
        if (!admin) return res.status(404).json({ error: "Administrator not found" });

        const receiver = await prisma.user.findFirst({
            where: { id: receiverId },
            select: { id: true, assistanceId: true, role: true }
        });

        const sender = await prisma.user.findFirst({
            where: { id: senderId },
            select: { id: true, assistanceId: true, role: true }
        });

        if (!receiver || !sender) return res.status(404).json({ error: "Sender or receiver not found" });

        let participantIds = new Set();

      
        // Check if conversation already exists
        let conversation;
        if((sender.id === botId && receiver.role === "user") || (sender.role === "user" && receiver.id === botId)){
            conversation = await prisma.conversation.findFirst({
                where: {
                    participants: {
                        some: {
                            userId: senderId,
                        },
                    },
                    AND: {
                        participants: {
                            some: {
                                userId: receiverId,
                            },
                        },
                        
                    }
                },
            });
                participantIds.add(receiverId); // user
                participantIds.add(senderId); // support_manager
        }
        if (sender.role === "administrator" && receiver.role === "user" && receiver.assistanceId) {
            conversation = await prisma.conversation.findFirst({
                where: {
                    participants: {
                        some: {
                            userId: senderId,
                        },
                    },
                    AND: [{
                        participants: {
                            some: {
                                userId: receiverId,
                            },
                        },
                        
                    },{
                        participants:{
                            some: {
                                userId: receiver?.assistanceId,
                            },
                        }
                    }]
                    
                },
            });

         
            participantIds.add(receiver.assistanceId); // user's support manager
            participantIds.add(admin.id); // auto include admin
            participantIds.add(receiverId); // user
        }
        if(sender.role === "support_manager" && receiver.role === "user"){
            conversation = await prisma.conversation.findFirst({
                where: {
                    participants: {
                        some: {
                            userId: senderId,
                        },
                    },
                    AND: [{
                        participants: {
                            some: {
                                userId: receiverId,
                            },
                        },
                        
                    },{
                        participants:{
                            some: {
                                userId: admin.id,
                            },
                        }
                    }]
                    
                },
            });
            participantIds.add(admin.id); // auto include admin
            participantIds.add(receiverId); // user
            participantIds.add(senderId); // support_manager
        }

        if (sender.role === "user" && receiver.id === sender.assistanceId) {
            conversation = await prisma.conversation.findFirst({
                where: {
                    participants: {
                        some: {
                            userId: senderId,
                        },
                    },
                    AND: [{
                        participants: {
                            some: {
                                userId: receiver.id,
                            },
                        },
                        
                    },{
                        participants:{
                            some: {
                                userId: admin.id,
                            },
                        }
                    }]
                    
                },
            });
            participantIds.add(admin.id); // auto include admin
            participantIds.add(receiverId); // user
            participantIds.add(senderId); // support_manager
        }
        if ((sender.role === "administrator" && receiver.role === "support_manager") ||
            (sender.role === "support_manager" && receiver.role === "administrator")) {
            conversation = await prisma.conversation.findFirst({
                where: {
                    participants: {
                        some: {
                            userId: senderId,
                        },
                    },
                    AND: {
                        participants: {
                            some: {
                                userId: receiverId,
                            },
                        },
                        
                    }
                },
            });
            participantIds.add(receiverId); // user
            participantIds.add(senderId); // support_manager
        }
      

        let finalConversation = conversation;

        // Create conversation if it doesn't exist
        if (!finalConversation) {
            finalConversation = await prisma.conversation.create({
                data: {
                    participants: {
                        create: Array.from(participantIds).map((id) => ({
                            user: { connect: { id } }
                        }))
                    }
                }
            });
        }

        // Save the message
        const newMessage = await prisma.message.create({
            data: {
                senderId,
                body: message,
                type: type,
                conversationId: finalConversation.id,
            },
            include: {
                sender: {
                    select: {
                        username: true,
                    }
                },
            }
        });

        // Emit message via socket to all participants
        if (sender.role === "administrator" && receiver.role === "user") {
            const socketIds = getReceiverSocketId(receiverId);;
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
            if(!!receiver?.assistanceId){
                const socketIdsAssisatnce = getReceiverSocketId(receiver?.assistanceId);
                socketIdsAssisatnce.forEach((socketId) => {
                    io.to(socketId).emit("newMessage", newMessage);
                });

            }
        }
        if(sender.role === "support_manager" && receiver.role === "user"){
            const socketIds = getReceiverSocketId(receiverId);;
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
            const socketIdsAdmin = getReceiverSocketId(admin?.id);
            socketIdsAdmin.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        }

        if (sender.role === "user" && receiver.id === sender.assistanceId) {
            const socketIds = getReceiverSocketId(receiverId);;
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            }
            );
            const socketIdsAdmin = getReceiverSocketId(admin?.id);
            socketIdsAdmin.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        }
        if ((sender.role === "administrator" && receiver.role === "support_manager") ||
            (sender.role === "support_manager" && receiver.role === "administrator")) {
            const socketIds = getReceiverSocketId(receiverId);;
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        }

        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.query.id;
        const conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: senderId } } },
                    { participants: { some: { userId: userToChatId } } },
                ],
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        sender: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!conversation) {
            return res.status(200).json([]);
        }

        res.status(200).json(conversation.messages);
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const authUserId = req.query.id;

        // First, get the role of the authenticated user
        const authUser = await prisma.user.findUnique({
            where: { id: authUserId },
            select: { role: true },
        });

        if (!authUser) {
            return res.status(404).json({ error: "User not found" });
        }

        let users;

        if (authUser.role === "administrator") {
            // ✅ Administrator: get all users except themselves
            users = await prisma.user.findMany({
                where: {
                    id: {
                        not: authUserId,
                    },
                },
                select: {
                    id: true,
                    username: true,
                    assistanceId: true,
                },
            });
        } else {
            // ✅ Other users: get users assigned to them via assistanceId
            users = await prisma.user.findMany({
                where: {
                    id: {
                        not: authUserId,
                    },
                    assistanceId: authUserId,
                },
                select: {
                    id: true,
                    username: true,
                    assistanceId: true,
                },
            });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getUserById = async (req, res) => {
    try {
        const authUserId = req.query.id;
        const users = await prisma.user.findFirst({
            where: {
                id: authUserId
            },
            select: {
                id: true,
                assistanceId: true,
                username: true,
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getConversationByuserId = async (req, res) => {
    try {
        const authUserId = req.query.id.trim();
        console.log(authUserId)
        const users = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: authUserId
                    }
                }
            },
            include: {
                messages: true,
            }
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserIdByconversationId = async (req, res) => {
    try {
        const authUserId = req.query.id.trim();
        const { id: conversationId } = req.params;

        const users = await prisma.userConversation.findMany({
            where: {
                conversationId,
                userId: { not: authUserId }, // Exclude the authenticated user
            },
            select: { userId: true },
            orderBy: { userId: "desc" }, // Order by user ID (if there's a better field, use that)
            take: 1, // Get only the last user ID
        });

        if (users.length === 0) {
            return res.status(404).json({ data: null });
        }

        res.status(200).json({ data: users[0]?.userId || null }); // Return only the last user ID
    } catch (error) {
        console.error("Error in getUserIdByconversationId: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const saveBotMessage = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: "User ID and message are required." });
        }

        const botMessage = await prisma.botmessages.create({
            data: {
                userId,
                messages: JSON.stringify([{ ...message, createdAt: new Date() }]), // Store as JSON
            },
        });

        res.status(201).json(botMessage);
    } catch (error) {
        console.error("Error saving bot message: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const findOrCreateUser = async (req, res) => {
    try {
        const { userId, role } = req.query; // Extract query params

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Find the user by userId
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            // Create user if not found, default role to 'user' if role is missing
            user = await prisma.user.create({
                data: {
                    id: userId,
                    role: role || "user"
                }
            });
        }

        // Return user context
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error finding or creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};