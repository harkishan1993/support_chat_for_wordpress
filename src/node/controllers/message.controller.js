
const prisma = require("../db/prisma.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const fs = require("fs")
const path = require("path")
exports.sendMessage = async (req, res) => {
    try {
        const { message, type, replyToMessageId } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.query.id;
        let uploadedFiles = [];
        const botId = "cm8wpc4hv0001dnnkhgmea0he";
        if (!receiverId || !senderId) {
            return res.status(400).json({ error: "Message, receiverId and senderId are required." });
        }
        if (!message && !req?.files) {
            return res.status(400).json({ error: "Message is required." });
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

        if (req.files && req.files.files) {
            const filesArray = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
            const getDate = Date.now()
            const uploadDir = path.join(__dirname, "../../../uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            for (const file of filesArray) {
                const filePath = `${uploadDir}/${getDate}_${file.name}`;
                await file.mv(filePath);
                uploadedFiles.push({
                    name: file.name,
                    url: `/uploads/${getDate}_${file.name}`,
                    type: file.mimetype,
                    size: file.size,
                });
            }
        }
        let conversation;
        if ((sender.id === botId && receiver.role === "user") || (sender.role === "user" && receiver.id === botId)) {
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

                    }, {
                        participants: {
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
        if (sender.role === "support_manager" && receiver.role === "user") {
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

                    }, {
                        participants: {
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

                    }, {
                        participants: {
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
        const dataMeta = {
            senderId,
            body: message,
            type: type,
            files: uploadedFiles,
            conversationId: finalConversation.id,
        }
        if (
            replyToMessageId
            && typeof replyToMessageId === 'string'
            && replyToMessageId.trim() !== 'null'
            && replyToMessageId.trim() !== 'undefined'
            && replyToMessageId.trim() !== ''
        ) {
            dataMeta.replyToMessageId = replyToMessageId;
        }
   
        const newMessage = await prisma.message.create({
            data: dataMeta,
            include: {
                sender: {
                    select: {
                        username: true,
                        role: true,
                    }
                },
                replyTo: {
                    select: {
                        id: true,
                        body: true,
                        files: true,
                        type: true,
                        createdAt: true,
                        sender: {
                            select: { username: true }
                        }
                    }
                },
                messageStatus: {
                    where: {
                        NOT: {
                            userId: senderId,
                        },
                    },
                    select: {
                        seen: true,
                        userId: true, // Optional, if you want to know who saw it
                    },
                },
            }
        });

        // Emit message via socket to all participants
        if (sender.role === "administrator" && receiver.role === "user") {
            await prisma.messagestatus.createMany({
                data: [
                    {
                        messageId: newMessage.id,
                        userId: receiverId,
                        seen: false,
                    },
                    {
                        messageId: newMessage.id,
                        userId: receiver?.assistanceId,
                        seen: false,
                    },
                    {
                        messageId: newMessage.id,
                        userId: senderId,
                        seen: true,
                        seenAt: new Date(),
                    }
                ]
            });
            const getIdForSeenMessage = getReceiverSocketId(receiver?.assistanceId);
            getIdForSeenMessage.forEach((socketId) => {
                io.to(socketId).emit("unread", { senderId: senderId });
            });
            const getIdForSeenMessageForUser = getReceiverSocketId(receiverId);
            getIdForSeenMessageForUser.forEach((socketId) => {
                io.to(socketId).emit("unread", { senderId: senderId });
            });
            const socketIds = getReceiverSocketId(receiverId);;
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
            if (!!receiver?.assistanceId) {
                const socketIdsAssisatnce = getReceiverSocketId(receiver?.assistanceId);
                socketIdsAssisatnce.forEach((socketId) => {
                    io.to(socketId).emit("newMessage", newMessage);
                });

            }
        }
        if (sender.role === "support_manager" && receiver.role === "user") {
            await prisma.messagestatus.createMany({
                data: [
                    {
                        messageId: newMessage.id,
                        userId: receiverId,
                        seen: false,
                    },
                    {
                        messageId: newMessage.id,
                        userId: admin.id,
                        seen: false,
                    },
                    {
                        messageId: newMessage.id,
                        userId: senderId,
                        seen: true,
                        seenAt: new Date(),
                    }
                ]
            });
            const getIdForSeenMessage = getReceiverSocketId(admin.id);
            getIdForSeenMessage.forEach((socketId) => {
                io.to(socketId).emit("unread", { senderId: senderId });
            });
            const getIdForSeenMessageForUser = getReceiverSocketId(receiverId);
            getIdForSeenMessageForUser.forEach((socketId) => {
                io.to(socketId).emit("unread", { senderId: senderId });
            });
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
            await prisma.messagestatus.createMany({
                data: [
                    {
                        messageId: newMessage.id,
                        userId: receiverId,
                        seen: false,
                    },
                    {
                        messageId: newMessage.id,
                        userId: admin.id,
                        seen: false,
                    },
                    {
                        messageId: newMessage.id,
                        userId: senderId,
                        seen: true,
                        seenAt: new Date(),
                    }
                ]
            });
            const getIdForSeenMessageForAdmin = getReceiverSocketId(admin.id);
            getIdForSeenMessageForAdmin.forEach((socketId) => {
                io.to(socketId).emit("unread", { senderId: senderId });
            });
            const getIdForSeenMessageForAssi = getReceiverSocketId(receiver.id);
            getIdForSeenMessageForAssi.forEach((socketId) => {
                io.to(socketId).emit("unread", { senderId: senderId });
            });
            const socketIds = getReceiverSocketId(receiverId);
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
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


exports.getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.query.id;
        const cursor = req.query.cursor;
        const limit = parseInt(req.query.limit) || 20;

        const conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: senderId } } },
                    { participants: { some: { userId: userToChatId } } },
                ],
            },
            select: { id: true },
        });

        if (!conversation) return res.status(200).json([]);

        const messages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "desc" },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            include: {
                sender: { select: { username: true, role: true } },
                replyTo: {
                    select: {
                        id: true,
                        body: true,
                        files: true,
                        type: true,
                        createdAt: true,
                        sender: {
                            select: { username: true }
                        }
                    }
                },
                messageStatus: {
                    where: { NOT: { userId: senderId } },
                    select: { seen: true, userId: true },
                },
            },
        });

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUsersForSidebar = async (req, res) => {
    try {
        const authUserId = req.query.id;

        const authUser = await prisma.user.findUnique({
            where: { id: authUserId },
            select: { role: true },
        });

        if (!authUser) {
            return res.status(404).json({ error: "User not found" });
        }

        let users;

        if (authUser.role === "administrator") {
            users = await prisma.user.findMany({
                where: {
                    AND: [
                        {
                            id: {
                                notIn: [authUserId, "cm8wpc4hv0001dnnkhgmea0he"],
                            },
                        },
                        {
                            assistanceId: {
                                not: null,
                            },
                        },
                        {
                            role: {
                                notIn: ['support_manager', 'administrator'],
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    username: true,
                    assistanceId: true,
                },
            });
        } else {
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

        // 🔍 For each user, calculate unseen message count
        const usersWithUnseen = await Promise.all(users.map(async (user) => {
            const count = await prisma.messagestatus.count({
                where: {
                    userId: authUserId, // current user (viewer)
                    seen: false,
                    message: {
                        senderId: user.id, // messages from this user
                    },
                },
            });

            return {
                ...user,
                unseenCount: count,
            };
        }));

        res.status(200).json(usersWithUnseen);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUserById = async (req, res) => {
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
        console.error("Error in getUserById: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.getConversationByuserId = async (req, res) => {
    try {
        const authUserId = req.query.id.trim();
        const cursor = req.query.cursor; // message ID for pagination
        const take = parseInt(req.query.take) || 15;

        // Get all conversation IDs the user is a part of
        const conversations = await prisma.userconversation.findMany({
            where: { userId: authUserId },
            select: { conversationId: true }
        });

        const conversationIds = conversations.map(c => c.conversationId);

        // Get paginated messages from those conversations
        const messages = await prisma.message.findMany({
            where: {
                conversationId: { in: conversationIds }
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profilePic: true,
                        role: true,
                    }
                },
                replyTo: {
                    select: {
                        id: true,
                        body: true,
                        files: true,
                        type: true,
                        createdAt: true,
                        sender: {
                            select: { username: true }
                        }
                    }
                },
                messageStatus: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            })
        });

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error in getMessagesByUser:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUserIdByconversationId = async (req, res) => {
    try {
        const authUserId = req.query.id.trim();
        const { id: conversationId } = req.params;

        const users = await prisma.userconversation.findMany({
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

exports.saveBotMessage = async (req, res) => {
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

exports.findOrCreateUser = async (req, res) => {
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

exports.getUnseenCount = async (req, res) => {
    const selectedUserId = req.params.userId;
    const authId = req.query.authid;
    const from = req.query?.from;
    if (!authId || !selectedUserId) {
        return res.status(400).json({ error: "Both ID is required" });
    }
    try {
        const seenupdate = await prisma.messagestatus.updateMany({
            where: {
                userId: authId,
                seen: false,
                message: {
                    senderId: selectedUserId,
                }
            },
            data: {
                seen: true,
                seenAt: new Date(),
            }
        });
        if (seenupdate?.count > 0) {
            const socketIds = getReceiverSocketId(selectedUserId);
            socketIds.forEach((socketId) => {
                io.to(socketId).emit("seenmsg", seenupdate);
            });
        }
        if (from == "user") {
            const admin = await prisma.user.findFirst({ where: { role: "administrator" } });
            if (!!admin?.id) {
                const seenupdate = await prisma.messagestatus.updateMany({
                    where: {
                        userId: authId,
                        seen: false,
                        message: {
                            senderId: admin.id,
                        }
                    },
                    data: {
                        seen: true,
                        seenAt: new Date(),
                    },

                });
                if (seenupdate?.count > 0) {

                    const socketIds = getReceiverSocketId(admin.id);
                    socketIds.forEach((socketId) => {
                        io.to(socketId).emit("seenmsg", seenupdate);
                    });
                }
            }
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in getUnseenCount Controller marking messages as seen:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.sendNotification = async (req, res) => {
    const { type, from, to, name } = req.body;

    try {
        if (to == "admin") {
            const admin = await prisma.user.findFirst({ where: { role: "administrator" } });

            var userId = admin?.id;
            if (!userId) return res.status(404).json({ error: "Administrator not found" });
            const body = `Chat request sent by <b>${name || "user"}</b>`
            await prisma.notification.create({
                data: {
                    userId,
                    type,
                    body,
                },
            });
            const userSocketId = getReceiverSocketId(userId);
            userSocketId.forEach((socketId) => {
                io.to(socketId).emit("notification");
            })
        }
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const [notifications, totalCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: [
                    { seen: 'asc' },
                    { createdAt: 'desc' },
                ],
                take: 50,
            }),
            prisma.notification.count({
                where: { userId, seen: false },
            }),
        ]);

        res.status(200).json({
            totalCount,
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.markNotificationsAsSeen = async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No notification IDs provided" });
    }

    try {
        await prisma.notification.updateMany({
            where: {
                id: { in: ids },
            },
            data: {
                seen: true,
            },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error marking notifications as seen:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getUsersUnseencount = async (req, res) => {
    try {
        const authUserId = req.query.id;
        const assistanceId = req.query.assistanceId;
        const admin = await prisma.user.findFirst({
            where: { role: "administrator" }
        });

        if (!authUserId || !assistanceId || !admin?.id) {
            return res.status(404).json({ error: "Id Not Found For getUsersUnseencount Controller" });
        }

        const count = await prisma.messagestatus.count({
            where: {
                userId: authUserId,
                seen: false,
                OR: [
                    {
                        message: {
                            senderId: assistanceId,
                        },
                    },
                    {
                        message: {
                            senderId: admin.id,
                        },
                    },
                ],
            },
        });
        res.status(200).json(count);
    } catch (error) {
        console.error("Error in getUsersUnseencount: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};